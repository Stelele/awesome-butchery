# Awesome Butchery — Developer Guide

> Augmentations to ERPNext POS for a butchery workflow

---

## Architecture

The app extends ERPNext Point of Sale with a single custom feature: a **Quick Quantity Dialog** that replaces auto-add (qty=1) with a number-entry modal when enabled on a POS Profile.

### Layer Diagram

```text
+----------------------+     +----------------------+
|  ERPNext POS Core    |     |  Awesome Butchery    |
+----------+-----------+     +----------+-----------+
           |                         |
           |  JS hook (pos_quick_qty.js)  |
           v                         v
+----------------------+     +----------------------+
|  POS ItemSelector    |-----|  Modified: intercepts |
|  (erpnext.PointOfSale)|     |  item-click behavior  |
+----------+-----------+     +----------+-----------+
           |                         |
           |  Custom Field: show_quantity_dialog  |
           v                         v
+----------------------+     +----------------------+
|  POS Profile DocType |     |  Dialog: NumberPad   |
+----------------------+     +----------------------+
```

### Component Overview

| Component | Language | Location | Purpose |
|---|---|---|---|
| **App metadata** | Python | `hooks.py` | App name, description, includes, fixtures |
| **Custom field creation** | Python | `awesome_butchery/migrate.py` `after_migrate()` | Creates `show_quantity_dialog` Check field on POS Profile |
| **Client behavior** | JavaScript | `awesome_butchery/public/js/pos_quick_qty.js` | Intercepts POS item clicks, opens quantity dialog |
| **Styling** | CSS | `awesome_butchery/public/css/pos_quick_qty.css` | Numpad grid layout overrides |
| **Fixture definition** | JSON | `awesome_butchery/fixtures/custom_field.json` | Declares Custom Field for app install |

---

## Hooks Table

All hooks declared in `awesome_butchery/hooks.py`:

| Hook | Module.Method | Description |
|---|---|---|
| `app_name` | `awesome_butchery` | App internal name |
| `app_title` | `Awesome Butchery` | Display name |
| `app_publisher` | `Gift Mugweni` | Publisher |
| `app_description` | `Augmentations to erpnext pos for a butchery work flow` | Short description |
| `app_license` | `mit` | License type |
| `app_include_css` | `/assets/awesome_butchery/css/pos_quick_qty.css` | CSS included in desk header |
| `app_include_js` | `/assets/awesome_butchery/js/pos_quick_qty.js` | JS included in desk header |
| `fixtures` | `[{"dt": "Custom Field", "filters": [["fieldname", "=", "show_quantity_dialog"]]}]` | App fixture: Custom Field for `show_quantity_dialog` |
| `after_migrate` | `awesome_butchery.migrate.after_migrate` | Runs after `bench migrate`; creates custom field + clears cache |

> **Note**: This app does **not** define any `doc_events`, `scheduler_events`, `permission_query_conditions`, `auth_hooks`, or `override_whitelisted_methods`.

---

## Whitelisted APIs (`/api/method/`)

This app **does not** expose any whitelisted API methods. There are no `frappe.whitelist()`-decorated functions in the codebase, and no `/api/method/<module>.<method>` endpoints are defined.

If API endpoints are needed in the future, they would follow the standard Frappe pattern:

```python
# examples/decorators.py
import frappe

@frappe.whitelist()
def get_pos_dialog_status():
    """Example: Check if quick quantity dialog is enabled for a user."""
    # ... implementation
    pass
```

Verified URL patterns (none currently exist for this app):

| Pattern | Status |
|---|---|
| `/api/method/awesome_butchery.get_pos_dialog_status` | ❌ Not implemented |
| `/api/method/awesome_butchery.get_custom_fields` | ❌ Not implemented |

---

## Fixtures / DocType Info

### Custom Field Fixture

File: `awesome_butchery/fixtures/custom_field.json`

```json
[
  {
    "doctype": "Custom Field",
    "name": "POS Profile-show_quantity_dialog",
    "dt": "POS Profile",
    "fieldname": "show_quantity_dialog",
    "fieldtype": "Check",
    "label": "Quick Quantity Dialog",
    "default": "0",
    "insert_after": "auto_add_item_to_cart",
    "description": "When checked, clicking an item in the POS opens a quantity dialog instead of auto-adding qty=1",
    "translatable": 1,
    "permlevel": 0,
    "module": "Awesome Butchery",
    "is_system_generated": 1,
    "hidden": 0
  }
]
```

This fixture is also replicated in `hooks.py` fixtures list (line 93-95) for sync consistency. Note: the fixture is the source of truth for the full attribute set (`translatable`, `permlevel`, `module`, `is_system_generated`, `hidden`); `migrate.py` `after_migrate()` sets only `translatable`.

### Related DocTypes

- **POS Profile** — the feature's checkbox appears on this DocType form
- **Custom Field** — managed by the fixture; `is_system_generated: 1` means it is auto-created on install

---

## Development Setup (Bench Commands)

All commands run from the bench directory. Use an explicit `--site` flag.

### Fresh Install (local)

See [Installation → Development Install (local)](../README.md#development-install-local) in the README for the canonical fresh-install commands.

### Run Tests

```bash
bench --site test_site set-config allow_tests true
bench --site test_site run-tests --app awesome_butchery
```

### Migrate

```bash
bench --site test_site migrate
```

> After `bench migrate`, the `show_quantity_dialog` custom field appears on the POS Profile form. If the field does not appear, run `bench build` or `bench --site <site> clear-cache`.
>
> `frappe.clear_cache(doctype="POS Profile")` is Python code, not a shell command — run it inside the bench console:
>
> ```bash
> bench --site <site> console
> frappe.clear_cache(doctype="POS Profile")
> ```

### Code Style

This app uses `pre-commit` with the following tools:

- **ruff** — Python linting and formatting
- **eslint** — JavaScript linting
- **prettier** — Code formatting

Run pre-commit locally:

```bash
# From bench root
cd apps/awesome_butchery
pre-commit install
pre-commit run --all-files
```

### CI

The GitHub Actions CI requires Docker (MariaDB, Redis). See `.github/workflows/ci.yml` for the full pipeline.

---

## Directory Structure (key files only)

```
awesome_butchery/
├── awesome_butchery/
│   ├── __init__.py          # __version__ = "0.0.1"
│   ├── hooks.py             # app metadata + hooks table
│   ├── migrate.py           # after_migrate() creates custom field
│   ├── fixtures/
│   │   └── custom_field.json  # Custom Field fixture
│   ├── patches/             # (empty, pre/post model sync)
│   ├── public/
│   │   ├── css/
│   │   │   └── pos_quick_qty.css
│   │   └── js/
│   │       └── pos_quick_qty.js  # POS item-click interceptor
│   ├── templates/           # (empty)
│   └── modules.txt          # "Awesome Butchery"
├── docs/
│   ├── USER_GUIDE.md        # end-user documentation
│   └── DEVELOPER.md         # this file
├── README.md                # installation & contributing
├── pyproject.toml
└── .github/
    └── workflows/
        ├── ci.yml
        └── linter.yml
```