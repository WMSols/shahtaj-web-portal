# -*- coding: utf-8 -*-
{
    'name': 'Shahtaj Oil Distributor Management System',
    'version': '1.0',
    'summary': 'Standalone custom command center for Shahtaj Oil distributions.',
    'category': 'Sales/Distribution',
    'author': 'IT Services / Custom Engineering',
    'depends': ['base', 'web', 'fastapi'], 
    'data': [
        'views/client_actions.xml',
        'views/menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            # Link your OWL layout template and component logic
            'shahtaj_distributor/static/src/xml/dashboard.xml',
            'shahtaj_distributor/static/src/js/components/staff_management.js',
            'shahtaj_distributor/static/src/js/components/operations_tracking.js',
            'shahtaj_distributor/static/src/js/components/territory_routes.js',
            'shahtaj_distributor/static/src/js/components/warehouse_inventory.js',
            'shahtaj_distributor/static/src/js/components/financials_invoicing.js',
            'shahtaj_distributor/static/src/js/components/settings.js',
            'shahtaj_distributor/static/src/js/components/schedules_targets.js',
            'shahtaj_distributor/static/src/js/components/dashboard.js',
            'shahtaj_distributor/static/src/xml/*.xml',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}