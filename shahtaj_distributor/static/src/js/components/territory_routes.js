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

TerritoryRoutes.template = xml`
    <div class="card border-0 shadow-sm bg-white">
        
        <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center rounded-top">
            <div>
                <h2 class="h4 font-weight-bold text-dark mb-0">Territory &amp; Route Management</h2>
                <small class="text-muted">Create areas, define routes, map shops, and assign field staff.</small>
            </div>
            <div>
                <span class="badge badge-info px-3 py-2 text-white"><i class="fa fa-map-marker mr-1"></i> Mapping Engine Active</span>
            </div>
        </div>

        <div class="p-3 border-bottom">
            <ul class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button t-on-click="() => this.setSubTab('areas')" 
                            t-attf-class="nav-link font-weight-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'areas' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🗺️ Areas
                    </button>
                </li>
                <li class="nav-item mx-2">
                    <button t-on-click="() => this.setSubTab('routes')" 
                            t-attf-class="nav-link font-weight-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'routes' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🛤️ Routes &amp; Assignments
                    </button>
                </li>
                <li class="nav-item">
                    <button t-on-click="() => this.setSubTab('shops')" 
                            t-attf-class="nav-link font-weight-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'shops' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🏪 Shops Directory
                    </button>
                </li>
            </ul>
        </div>

        <t t-if="this.state.activeSubTab === 'areas'">
            <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                <h6 class="font-weight-bold mb-0">Geographical Areas</h6>
                <button class="btn btn-sm btn-dark" t-on-click="() => this.state.showAreaForm = true">+ Add New Area</button>
            </div>

            <t t-if="this.state.showAreaForm">
                <div class="p-4 bg-light border-bottom">
                    <div class="row align-items-end">
                        <div class="col-md-4">
                            <label class="small font-weight-bold">Area Name</label>
                            <input type="text" class="form-control" t-model="this.state.areaForm.name" placeholder="e.g. West Zone"/>
                        </div>
                        <div class="col-md-3">
                            <label class="small font-weight-bold">Area Code</label>
                            <input type="text" class="form-control" t-model="this.state.areaForm.code" placeholder="e.g. WZ-01"/>
                        </div>
                        <div class="col-md-2 pb-2">
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" id="areaActiveSwitch" t-model="this.state.areaForm.is_active"/>
                                <label class="custom-control-label small font-weight-bold cursor-pointer" for="areaActiveSwitch">Active Status</label>
                            </div>
                        </div>
                        <div class="col-md-3 d-flex">
                            <button class="btn btn-outline-secondary mr-2 w-50" t-on-click="() => this.state.showAreaForm = false">Cancel</button>
                            <button class="btn btn-success w-50" t-on-click="saveArea">Save</button>
                        </div>
                    </div>
                </div>
            </t>

            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light text-uppercase small font-weight-bold text-muted">
                        <tr>
                            <th class="border-top-0 pl-4">Area ID</th>
                            <th class="border-top-0">Area Name</th>
                            <th class="border-top-0 text-center">Active Routes</th>
                            <th class="border-top-0">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <t t-foreach="this.state.areas" t-as="area" t-key="area.id">
                            <tr>
                                <td class="pl-4 font-weight-bold align-middle"><t t-esc="area.id"/></td>
                                <td class="align-middle">
                                    <div class="text-dark font-weight-bold"><t t-esc="area.name"/></div>
                                    <small class="text-muted">Code: <t t-esc="area.code"/></small>
                                </td>
                                <td class="align-middle text-center"><span class="badge badge-light border px-2 py-1"><t t-esc="area.routes"/></span></td>
                                <td class="align-middle">
                                    <span t-attf-class="badge #{area.status === 'Active' ? 'badge-success' : 'badge-warning'} px-2 py-1"><t t-esc="area.status"/></span>
                                </td>
                            </tr>
                        </t>
                    </tbody>
                </table>
            </div>
        </t>

        <t t-if="this.state.activeSubTab === 'routes'">
            <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                <h6 class="font-weight-bold mb-0">Route Configurations</h6>
                <button class="btn btn-sm btn-dark" t-on-click="() => this.state.showRouteForm = true">+ Create Route</button>
            </div>

            <t t-if="this.state.showRouteForm">
                <div class="p-4 bg-light border-bottom">
                    <div class="row align-items-end">
                        <div class="col-md-3">
                            <label class="small font-weight-bold">Route Name</label>
                            <input type="text" class="form-control" t-model="this.state.routeForm.name" placeholder="e.g. Main Market"/>
                        </div>
                        <div class="col-md-2">
                            <label class="small font-weight-bold">Parent Zone</label>
                            <select class="form-control" t-model="this.state.routeForm.area">
                                <option value="">Select Zone...</option>
                                <t t-foreach="this.state.areas" t-as="a" t-key="a.id">
                                    <option t-att-value="a.name"><t t-esc="a.name"/></option>
                                </t>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="small font-weight-bold">Assign Booker</label>
                            <select class="form-control" t-model="this.state.routeForm.booker">
                                <option value="">Unassigned</option>
                                <option value="Ali Khan">Ali Khan</option>
                                <option value="Usman Tariq">Usman Tariq</option>
                            </select>
                        </div>
                        <div class="col-md-2 pb-2">
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" id="routeActiveSwitch" t-model="this.state.routeForm.is_active"/>
                                <label class="custom-control-label small font-weight-bold cursor-pointer" for="routeActiveSwitch">Active Status</label>
                            </div>
                        </div>
                        <div class="col-md-2 d-flex">
                            <button class="btn btn-outline-secondary mr-2 w-100" t-on-click="() => this.state.showRouteForm = false">Cancel</button>
                            <button class="btn btn-success w-100" t-on-click="saveRoute">Save</button>
                        </div>
                    </div>
                </div>
            </t>

            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light text-uppercase small font-weight-bold text-muted">
                        <tr>
                            <th class="border-top-0 pl-4">Route Info</th>
                            <th class="border-top-0">Assigned To</th>
                            <th class="border-top-0 text-center">Mapped Shops</th>
                            <th class="border-top-0 text-right pr-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <t t-foreach="this.state.routes" t-as="route" t-key="route.id">
                            <tr>
                                <td class="pl-4 align-middle">
                                    <div class="text-dark font-weight-bold"><t t-esc="route.name"/></div>
                                    <small class="text-muted"><i class="fa fa-map-marker mr-1"></i> <t t-esc="route.area"/></small>
                                </td>
                                <td class="align-middle">
                                    <span t-attf-class="badge #{route.booker === 'Unassigned' ? 'badge-danger' : 'badge-primary'} px-2 py-1"><t t-esc="route.booker"/></span>
                                </td>
                                <td class="align-middle text-center"><span class="badge badge-light border px-2 py-1"><t t-esc="route.shops"/></span></td>
                                <td class="align-middle text-right pr-4">
                                    <span t-attf-class="badge #{route.status === 'Active' ? 'badge-success' : 'badge-secondary'} px-2 py-1"><t t-esc="route.status"/></span>
                                </td>
                            </tr>
                        </t>
                    </tbody>
                </table>
            </div>
        </t>

        <t t-if="this.state.activeSubTab === 'shops'">
            
            <t t-if="!this.state.showShopForm">
                <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h6 class="font-weight-bold mb-0">Registered Shops</h6>
                    <button class="btn btn-sm btn-dark" t-on-click="() => this.state.showShopForm = true">+ Register New Shop</button>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light text-uppercase small font-weight-bold text-muted">
                            <tr>
                                <th class="border-top-0 pl-4">Shop Details</th>
                                <th class="border-top-0">Contact</th>
                                <th class="border-top-0">Route Mapping</th>
                                <th class="border-top-0 text-right pr-4">Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            <t t-foreach="this.state.shops" t-as="shop" t-key="shop.id">
                                <tr>
                                    <td class="pl-4 align-middle">
                                        <div class="text-dark font-weight-bold"><t t-esc="shop.name"/></div>
                                        <small class="text-muted">ID: <t t-esc="shop.id"/></small>
                                    </td>
                                    <td class="align-middle">
                                        <div class="text-dark"><t t-esc="shop.owner"/></div>
                                        <small class="text-muted"><t t-esc="shop.phone"/></small>
                                    </td>
                                    <td class="align-middle text-primary font-weight-bold"><t t-esc="shop.route"/></td>
                                    <td class="align-middle text-right pr-4">
                                        <span t-attf-class="badge #{shop.status === 'Verified' ? 'badge-success' : 'badge-warning'} px-2 py-1"><t t-esc="shop.status"/></span>
                                    </td>
                                </tr>
                            </t>
                        </tbody>
                    </table>
                </div>
            </t>

            <t t-else="">
                <div class="p-4 bg-light">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4 class="font-weight-bold text-dark mb-0">New Shop Registration</h4>
                        <button class="btn btn-sm btn-outline-secondary font-weight-bold" t-on-click="() => this.state.showShopForm = false">← Back to Directory</button>
                    </div>

                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h6 class="font-weight-bold text-primary mb-0">1. Basic Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="small font-weight-bold">Shop Name</label>
                                    <input type="text" class="form-control" t-model="this.state.shopForm.name" placeholder="e.g. Al-Hafeez Supermart"/>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="small font-weight-bold">Owner Name</label>
                                    <input type="text" class="form-control" t-model="this.state.shopForm.owner" placeholder="e.g. Rizwan Ahmed"/>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="small font-weight-bold">Contact Phone</label>
                                    <input type="text" class="form-control" t-model="this.state.shopForm.phone" placeholder="03XX-XXXXXXX"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h6 class="font-weight-bold text-success mb-0">2. Geographical Mapping</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="small font-weight-bold">Select Zone</label>
                                    <select class="form-control" t-model="this.state.shopForm.area">
                                        <option value="">-- Select Zone --</option>
                                        <t t-foreach="this.state.areas" t-as="a" t-key="a.id">
                                            <option t-att-value="a.name"><t t-esc="a.name"/></option>
                                        </t>
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="small font-weight-bold">Assign to Route</label>
                                    <select class="form-control" t-model="this.state.shopForm.route">
                                        <option value="">-- Select Route --</option>
                                        <t t-foreach="this.state.routes" t-as="r" t-key="r.id">
                                            <option t-att-value="r.name"><t t-esc="r.name"/></option>
                                        </t>
                                    </select>
                                </div>
                                <div class="col-md-2 mb-3">
                                    <label class="small font-weight-bold text-muted">GPS Latitude</label>
                                    <input type="number" step="any" class="form-control" t-model="this.state.shopForm.lat" placeholder="31.5204"/>
                                </div>
                                <div class="col-md-2 mb-3">
                                    <label class="small font-weight-bold text-muted">GPS Longitude</label>
                                    <input type="number" step="any" class="form-control" t-model="this.state.shopForm.lng" placeholder="74.3587"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h6 class="font-weight-bold text-warning text-dark mb-0">3. Financial Ledger Setup</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="small font-weight-bold">Approved Credit Limit (Rs.)</label>
                                    <input type="number" class="form-control" t-model="this.state.shopForm.creditLimit" placeholder="e.g. 150000"/>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="small font-weight-bold">Legacy Balance Brought Forward</label>
                                    <input type="number" class="form-control" t-model="this.state.shopForm.legacyBalance" placeholder="0.00"/>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="small font-weight-bold">Current Outstanding Balance</label>
                                    <input type="number" class="form-control" t-model="this.state.shopForm.outstandingBalance" placeholder="0.00"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h6 class="font-weight-bold text-info mb-0">4. KYC &amp; Visual Verification</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <label class="small font-weight-bold">Owner CNIC (Front)</label>
                                    <input type="file" class="form-control-file small"/>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="small font-weight-bold">Owner CNIC (Back)</label>
                                    <input type="file" class="form-control-file small"/>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="small font-weight-bold">Owner Portrait Photo</label>
                                    <input type="file" class="form-control-file small"/>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="small font-weight-bold">Shop Exterior Photo</label>
                                    <input type="file" class="form-control-file small"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end pb-4 mt-3">
                        <button class="btn btn-outline-secondary px-4 mr-2 font-weight-bold" t-on-click="() => this.state.showShopForm = false">Discard</button>
                        <button class="btn btn-dark px-5 font-weight-bold" t-on-click="saveShop">Register Shop &amp; Submit for Review</button>
                    </div>
                </div>
            </t>
        </t>
    </div>
`;