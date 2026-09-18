# Awesome Butchery — User Guide

> End-user documentation for the Awesome Butchery ERPNext POS augmentations app.

## Table of Contents

1. [Quick Quantity Dialog](#quick-quantity-dialog)
2. [POS Profile Configuration](#pos-profile-configuration)
3. [Using the Dialog in POS](#using-the-dialog-in-pos)
4. [Disabling the Feature](#disabling-the-feature)

---

## Quick Quantity Dialog

The **Quick Quantity Dialog** is a butchery-specific enhancement to the standard ERPNext Point of Sale. When enabled, clicking any item on the POS screen opens a quantity-entry dialog instead of automatically adding one item (qty=1) to the cart.

### When to use it

- You sell items by variable quantity (e.g., meat by the pound, cheese by the slice)
- You want staff to confirm quantities before adding items to the order
- You need to prevent accidental qty=1 additions for high-value items

### How it works

1. A POS Profile administrator enables **Quick Quantity Dialog** on the profile.
2. When an item is clicked on the POS, a modal dialog opens.
3. The dialog includes the ERPNext **NumberPad** for easy quantity entry.
4. After entering the quantity and clicking **OK**, the item is added to the cart with the specified amount.

---

## POS Profile Configuration

1. **Navigate**: `Point of Sale > Setup > POS Profile`
2. **Open** an existing profile or **Create New**.
3. Find the **Quick Quantity Dialog** checkbox.
4. **Check** the box to enable the feature for this profile.
5. **Save** the profile.

> The checkbox is a Custom Field (`show_quantity_dialog`) added by the app. It appears after the `auto_add_item_to_cart` field on the POS Profile form.

### Multiple POS Profiles

You can create different profiles with different settings:
- **Profile A**: Quick Quantity Dialog **enabled** — for the butchery counter
- **Profile B**: Quick Quantity Dialog **disabled** — for general retail

Assign the appropriate profile to each POS station.

---

## Using the Dialog in POS

### Step-by-step

1. Open the Point of Sale interface on a terminal or tablet.
2. Select the appropriate POS Profile (one with **Quick Quantity Dialog** enabled).
3. Browse or search for the butchery item you want to add.
4. **Click the item** — instead of auto-adding qty=1, a dialog slides in.
5. The **NumberPad** appears for quantity entry:
   - Click number buttons to build the quantity
   - Use the **Delete** button to backspace
   - Use the **decimal** point for fractional quantities (e.g., 0.5 lb)
6. Click **OK** — the item is added to the cart with your specified quantity.
   Or click **Cancel** — the item is not added.

### Keyboard shortcuts (dialog open)

| Key | Action |
|---|---|
| `Enter` | Accept the entered quantity and close the dialog (when a valid quantity is entered) |

---

## Disabling the Feature

To revert to the default behavior (auto-add qty=1):

1. Go to **Point of Sale > Setup > POS Profile**.
2. Edit the profile.
3. **Uncheck** **Quick Quantity Dialog**.
4. **Save**.

The change takes effect after the POS screen is **reloaded or reopened** — the profile setting is read when the POS opens, so an already-open POS keeps the previous behavior until refreshed.

---

## Frequently Asked Questions

| Question | Answer |
|---|---|
| **Can I set a default quantity?** | The dialog starts blank, or prefilled with the current cart quantity when that same item is already in the cart. |
| **Does this work for all item types?** | Yes — any item on a POS Profile with the checkbox enabled will trigger the dialog when clicked. |
| **Can I disable it for specific items only?** | No — the feature is profile-level, not item-level. Use separate POS Profiles for different item sets. |
| **What if the dialog doesn't appear?** | Ensure the profile is saved after checking the box, then run `bench build` or `bench --site <site> clear-cache`. (`frappe.clear_cache(doctype="POS Profile")` is Python code — run it inside `bench --site <site> console`.) |
| **Can I use the numpad for fractional quantities?** | Yes — the NumberPad includes a decimal point button for values like 0.25, 0.5, 0.75, etc. |

---

## Key Terms

- **POS Profile** — A named configuration for Point of Sale stations, controlling which fields and behaviors are active.
- **Quick Quantity Dialog** — The app's custom checkbox feature that replaces auto-add with a quantity-entry modal.
- **NumberPad** — ERPNext's on-screen keypad component used within the dialog for quantity entry.
- **Item Code** — The ERPNext identifier for a product (e.g., "CHICKEN-WHOLE", "BEEF-GROUND").