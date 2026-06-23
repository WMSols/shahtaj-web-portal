/** @odoo-module **/

import { Component, useState, xml } from "@odoo/owl";

export class TerritoryRoutes extends Component {
    setup() {
        this.state = useState({
            activeSubTab: 'routes', // Default tab
            
            // UI Form Toggles
            showAreaForm: false,
            showRouteForm: false,
            showShopForm: false,

            // Form Data States (Upgraded with new fields)
            areaForm: { name: '', code: '', is_active: true },
            routeForm: { name: '', area: '', booker: '', is_active: true },
            shopForm: { 
                name: '', owner: '', phone: '', address: '',
                area: '', route: '', lat: '', lng: '', 
                creditLimit: '', legacyBalance: '', outstandingBalance: '',
                cnicFront: null, cnicBack: null, ownerPhoto: null, exteriorPhoto: null 
            },

            // Mock Data: Geographical Areas
            areas: [
                { id: "AR-01", name: "North Zone - City Center", code: "NZ-CC", routes: 4, status: "Active" },
                { id: "AR-02", name: "South Zone - Industrial", code: "SZ-IND", routes: 2, status: "Active" },
                { id: "AR-03", name: "East Zone - Suburbs", code: "EZ-SUB", routes: 1, status: "Pending" }
            ],

            // Mock Data: Routes & Booker Assignments
            routes: [
                { id: "RT-101", name: "Commercial Market Main", area: "North Zone - City Center", booker: "Ali Khan", shops: 24, status: "Active" },
                { id: "RT-102", name: "Phase 1 Residential", area: "North Zone - City Center", booker: "Usman Tariq", shops: 18, status: "Active" },
                { id: "RT-201", name: "Factory Area Link", area: "South Zone - Industrial", booker: "Unassigned", shops: 8, status: "Inactive" }
            ],

            // Mock Data: Mapped Shops
            shops: [
                { id: "SH-5042", name: "Bismillah General Store", route: "Commercial Market Main", owner: "Haji Tariq", phone: "0300-1234567", status: "Verified" },
                { id: "SH-5043", name: "Al-Hafeez Supermart", route: "Phase 1 Residential", owner: "Rizwan Ahmed", phone: "0333-9876543", status: "Verified" },
                { id: "SH-5044", name: "Madina Traders", route: "Factory Area Link", owner: "Kamran", phone: "0321-5558888", status: "Pending Review" }
            ]
        });
    }

    setSubTab(tabName) {
        this.state.activeSubTab = tabName;
        this.state.showAreaForm = false;
        this.state.showRouteForm = false;
        this.state.showShopForm = false;
    }

    saveArea() {
        this.state.areas.push({
            id: `AR-0${this.state.areas.length + 1}`,
            name: this.state.areaForm.name,
            code: this.state.areaForm.code,
            routes: 0,
            status: this.state.areaForm.is_active ? "Active" : "Inactive"
        });
        this.state.showAreaForm = false;
        this.state.areaForm = { name: '', code: '', is_active: true };
    }

    saveRoute() {
        this.state.routes.push({
            id: `RT-${this.state.routes.length + 1}01`,
            name: this.state.routeForm.name,
            area: this.state.routeForm.area,
            booker: this.state.routeForm.booker || "Unassigned",
            shops: 0,
            status: this.state.routeForm.is_active ? "Active" : "Inactive"
        });
        this.state.showRouteForm = false;
        this.state.routeForm = { name: '', area: '', booker: '', is_active: true };
    }

    saveShop() {
        this.state.shops.push({
            id: `SH-50${this.state.shops.length + 42}`,
            name: this.state.shopForm.name,
            route: this.state.shopForm.route,
            owner: this.state.shopForm.owner,
            phone: this.state.shopForm.phone,
            status: "Pending Review"
        });
        this.state.showShopForm = false;
        this.state.shopForm = { 
            name: '', owner: '', phone: '', address: '',
            area: '', route: '', lat: '', lng: '', 
            creditLimit: '', legacyBalance: '', outstandingBalance: '',
            cnicFront: null, cnicBack: null, ownerPhoto: null, exteriorPhoto: null 
        };
    }
}

TerritoryRoutes.template = "shahtaj_distributor.TerritoryRoutes"