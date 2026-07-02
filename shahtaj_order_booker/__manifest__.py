# -*- coding: utf-8 -*-
{
    'name': 'Shahtaj Order Booker',
    'version': '19.0.1.0.27',
    'post_init_hook': 'post_init_hook',
    'category': 'Sales',
    'summary': 'Field order booking with routes, visits, GPS, targets, and inventory',
    'depends': ['base', 'contacts', 'sale', 'sale_stock', 'mail', 'account', 'stock'],
    'data': [
                # ── 1. SECURITY (groups first, then access, then rules) ──
                'security/shahtaj_security.xml',
                'security/ir.model.access.csv',
                'security/shahtaj_record_rules.xml',
                'security/shahtaj_partner_access.xml',

                # ── 2. BASE DATA (no view/action dependencies) ──
                'data/shahtaj_account_data.xml',
                'data/shahtaj_product_data.xml',
                'data/shahtaj_api_data.xml',
                'data/shahtaj_cron.xml',

                # ── 3. CORE VIEWS + ACTIONS (no inherit from other module views) ──
                'views/shahtaj_route_views.xml',
                'views/shahtaj_zone_views.xml',
                'views/shahtaj_partner_views.xml',                                     # defines view_shahtaj_shop_form
                'views/shahtaj_schedule_views.xml',
                'views/shahtaj_visit_task_views.xml',
                'views/shahtaj_target_views.xml',

                # ── 4. VISIT VIEWS (before sale_accounting which inherits visit views) ──
                'data/shahtaj_visit_action_cleanup.xml',             # upgrade cleanup: old my_visits action
                'views/shahtaj_visit_views.xml',
                'wizard/shahtaj_visit_checkin_views.xml',

                # ── 5. ACCOUNTING / PRODUCT VIEWS (inherit standard Odoo or partner views) ──
                'views/shahtaj_account_payment_views.xml',
                'views/shahtaj_accounting_views.xml',                         # refs view_shahtaj_shop_form
                'views/shahtaj_sale_accounting_views.xml',     # refs view_shahtaj_visit_form/list
                'views/shahtaj_accounting_hub_views.xml',
                'views/shahtaj_product_views.xml',
                'views/shahtaj_sale_stock_fix.xml',

                # ── 6. HUB + USER MANAGEMENT VIEWS ──
                'views/shahtaj_schedule_hub_views.xml',
                'views/shahtaj_visit_hub_views.xml',
                'views/shahtaj_order_booker_users_views.xml',

                # ── 7. WIZARDS (actions used by menus) ──
                'wizard/shahtaj_generate_tasks_views.xml',
                'wizard/shahtaj_create_order_booker_views.xml',
                'wizard/shahtaj_quick_add_product_views.xml',
                'wizard/shahtaj_add_stock_views.xml',

                # ── 8. SECURITY FIXES (must update rules created in step 1) ──
                'security/shahtaj_record_rules_fix.xml',
                'security/shahtaj_booker_ui_fix.xml',
                'security/shahtaj_partner_access_upgrade.xml',

                # ── 9. DATA FIXES / CLEANUP (must run after actions they touch) ──
                'data/shahtaj_accounting_action_fix.xml',         # patches action_shahtaj_customer_payments
                'data/shahtaj_accounting_menu_cleanup.xml', # removes legacy accounting sub-menus
                'data/shahtaj_users.xml',                                                                         # assigns distributor group to admin

                # ── 10. MENUS (ALWAYS LAST) ──
                'views/shahtaj_menus.xml',                                                                     # creates menu_shahtaj_root + main menus
                'views/shahtaj_product_inventory_views.xml',# child menus under menu_shahtaj_root
                'views/shahtaj_api_test_menu.xml',                                     # API test menu under menu_shahtaj_root
],
    'application': True,
    'installable': True,
    'license': 'LGPL-3',
}
