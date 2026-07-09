import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields


def execute():
    create_custom_fields({
        "POS Profile": [
            {
                "fieldname": "show_quantity_dialog",
                "fieldtype": "Check",
                "label": "Quick Quantity Dialog",
                "default": "0",
                "insert_after": "auto_add_item_to_cart",
                "description": "When checked, clicking an item in the POS opens a quantity dialog instead of auto-adding qty=1",
                "translatable": 1,
            }
        ]
    })
