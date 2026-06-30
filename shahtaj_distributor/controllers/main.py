# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from odoo.addons.web.controllers.home import Home

class CustomHome(Home):

    def _login_redirect(self, uid, redirect=None):
        print(f"====== INCOMING REDIRECT: {redirect} ======")
        
        clean_redirect = redirect.rstrip('?') if redirect else None
        
        if not clean_redirect or clean_redirect in ['/web', '/odoo']:
            # Add the module name prefix here (shahtaj_distributor.)
            action = request.env.ref('shahtaj_distributor.action_shahtaj_dashboard', raise_if_not_found=True)
            
            if action:
                redirect = '/web#action=%s' % action.id
                print(f"====== MODIFIED REDIRECT: {redirect} ======")
                
        return super(CustomHome, self)._login_redirect(uid, redirect=redirect)