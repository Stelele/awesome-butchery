(function () {
    var _dialog = null;

    function getExistingQty(item) {
        var cur_pos = window.cur_pos;
        if (!cur_pos || !cur_pos.frm || !cur_pos.frm.doc.items) return null;

        var match = cur_pos.frm.doc.items.find(function (i) {
            return (
                i.item_code === item.item_code &&
                (!item.batch_no || i.batch_no === item.batch_no) &&
                i.uom === item.uom &&
                i.rate === parseFloat(item.rate)
            );
        });
        return match || null;
    }

    function showQuantityDialog(item, matchRow, events) {
        if (_dialog) {
            _dialog.hide();
            _dialog = null;
        }

        var initialQty = matchRow ? String(matchRow.qty) : "";

        _dialog = new frappe.ui.Dialog({
            title: item.item_code || __("Enter Quantity"),
            fields: [
                {
                    fieldname: "qty",
                    fieldtype: "Data",
                    label: __("Quantity"),
                    default: initialQty,
                    reqd: 1,
                },
            ],
            primary_action_label: __("OK"),
            primary_action: function () {
                var rawVal = _dialog.get_field("qty").$input.val();
                var qty = parseFloat(rawVal);
                if (!qty || qty <= 0) return;

                _dialog.hide();
                _dialog = null;

                if (matchRow) {
                    frappe.model.set_value(matchRow.doctype, matchRow.name, "qty", qty);
                    window.cur_pos.update_cart_html(matchRow);
                } else {
                    events.item_selected({
                        field: "qty",
                        value: qty,
                        item: item,
                    });
                }
            },
        });

        _dialog.show();

        var $body = _dialog.$body;

        var qtyField = _dialog.get_field("qty");
        var okBtn = _dialog.get_primary_btn();

        function updateState() {
            var val = parseFloat(qtyField.$input.val());
            okBtn.prop("disabled", !val || val <= 0);
        }
        updateState();

        var $numpadWrapper = $('<div class="qty-dialog-numpad-wrapper">').appendTo($body);

        var firstDigit = true;

        new erpnext.PointOfSale.NumberPad({
            wrapper: $numpadWrapper,
            events: {
                numpad_event: function ($btn) {
                    var val = $btn.attr("data-button-value");
                    var current = String(qtyField.$input.val() || "");

                    if (val === "delete") {
                        current = current.slice(0, -1);
                    } else if (val === "decimal") {
                        if (current.indexOf(".") === -1) {
                            current += ".";
                        }
                    } else {
                        if (firstDigit && current === initialQty) {
                            current = val;
                        } else {
                            current += val;
                        }
                        firstDigit = false;
                    }

                    qtyField.$input.val(current).trigger("input");
                    qtyField.$input.focus();
                    updateState();
                },
            },
            cols: 3,
            keys: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [".", 0, "Delete"],
            ],
            fieldnames_map: { ".": "decimal", Delete: "delete" },
        });

        qtyField.$input.on("input", updateState);
        qtyField.$input.focus();
        if (initialQty) qtyField.$input.select();

        _dialog.$wrapper.on("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                if (!okBtn.prop("disabled")) {
                    _dialog.primary_action();
                }
            }
        });

        _dialog.onhide = function () {
            _dialog = null;
        };
    }

    function hookItemSelector(selector) {
        if (!window.cur_pos || !window.cur_pos.settings || !window.cur_pos.settings.show_quantity_dialog) return;

        selector.$component.off("click", ".item-wrapper");
        selector.$component.on("click", ".item-wrapper", function () {
            var $item = $(this);
            var item_code = $item.attr("data-item-code");
            var batch_no = $item.attr("data-batch-no");
            var serial_no = $item.attr("data-serial-no");
            var uom = $item.attr("data-uom");
            var rate = $item.attr("data-rate");
            var stock_uom = $item.attr("data-stock-uom");

            batch_no = (batch_no === "undefined" || batch_no === "null") ? undefined : batch_no;
            serial_no = (serial_no === "undefined" || serial_no === "null") ? undefined : serial_no;
            uom = uom === "undefined" ? undefined : uom;
            rate = rate === "undefined" ? undefined : rate;
            stock_uom = stock_uom === "undefined" ? undefined : stock_uom;

            var item = { item_code: item_code, batch_no: batch_no, serial_no: serial_no, uom: uom, rate: rate, stock_uom: stock_uom };

            var matchRow = getExistingQty(item);

            showQuantityDialog(item, matchRow, selector.events);
        });
    }

    function init() {
        if (!erpnext.PointOfSale || !erpnext.PointOfSale.ItemSelector) {
            setTimeout(init, 50);
            return;
        }

        var ItemSelector = erpnext.PointOfSale.ItemSelector;

        if (!ItemSelector.prototype._quickQtyPatched) {
            ItemSelector.prototype._quickQtyPatched = true;

            var origBindEvents = ItemSelector.prototype.bind_events;
            ItemSelector.prototype.bind_events = function () {
                origBindEvents.call(this);
                hookItemSelector(this);
            };
        }

        if (window.cur_pos && window.cur_pos.item_selector) {
            hookItemSelector(window.cur_pos.item_selector);
        }

        setTimeout(init, 500);
    }

    init();
})();
