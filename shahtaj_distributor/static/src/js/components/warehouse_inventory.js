/** @odoo-module **/

import { Component, useState, xml } from "@odoo/owl";

export class WarehouseInventory extends Component {
    setup() {
        this.state = useState({
            activeSubTab: 'inventory', // Default tab
            
            showWarehouseForm: false,
            showAdjustmentForm: false,

            warehouseForm: { name: '', type: '', location: '', manager: '' },
            adjustmentForm: { product: '', warehouse: '', type: 'add', qty: 0, reason: '' },

            // Mock Data: Physical Locations
            warehouses: [
                { id: "WH-MAIN", name: "Central Hub - Lahore", type: "Main Warehouse", location: "Sundar Industrial Estate", manager: "Zafar Iqbal", status: "Active" },
                { id: "WH-SUB1", name: "North Hub - Mianwali", type: "Sub-Warehouse", location: "Main City Zone", manager: "Raza Ali", status: "Active" },
                { id: "WH-SUB2", name: "South Hub - Multan", type: "Sub-Warehouse", location: "Industrial Phase 2", manager: "Pending Allocation", status: "Maintenance" }
            ],

            // Mock Data: Product Stock Levels
            inventory: [
                { id: "SKU-1001", name: "Shahtaj Premium Cooking Oil 5L", category: "Cooking Oil", stock: 1250, unit: "Cartons", status: "Healthy" },
                { id: "SKU-1002", name: "Shahtaj Banaspati 1kg Pouch", category: "Banaspati Ghee", stock: 85, unit: "Boxes", status: "Low Stock" },
                { id: "SKU-1003", name: "Shahtaj Cooking Oil 1L Pouch", category: "Cooking Oil", stock: 3400, unit: "Pieces", status: "Healthy" },
                { id: "SKU-1004", name: "Shahtaj Banaspati 5kg Tin", category: "Banaspati Ghee", stock: 0, unit: "Tins", status: "Out of Stock" }
            ]
        });
    }

    setSubTab(tabName) {
        this.state.activeSubTab = tabName;
        this.state.showWarehouseForm = false;
        this.state.showAdjustmentForm = false;
    }

    saveWarehouse() {
        this.state.warehouses.push({
            id: `WH-NEW${this.state.warehouses.length + 1}`,
            name: this.state.warehouseForm.name,
            type: this.state.warehouseForm.type,
            location: this.state.warehouseForm.location,
            manager: this.state.warehouseForm.manager || "Unassigned",
            status: "Active"
        });
        this.state.showWarehouseForm = false;
        this.state.warehouseForm = { name: '', type: '', location: '', manager: '' };
    }

    saveAdjustment() {
        // Find the product and adjust its total stock in the mock data
        const product = this.state.inventory.find(p => p.name === this.state.adjustmentForm.product);
        if (product) {
            const qty = parseInt(this.state.adjustmentForm.qty);
            if (this.state.adjustmentForm.type === 'add') {
                product.stock += qty;
            } else if (this.state.adjustmentForm.type === 'remove') {
                product.stock = Math.max(0, product.stock - qty);
            }
            
            // Auto-update status based on new stock level
            if (product.stock === 0) product.status = "Out of Stock";
            else if (product.stock < 100) product.status = "Low Stock";
            else product.status = "Healthy";
        }
        
        this.state.showAdjustmentForm = false;
        this.state.adjustmentForm = { product: '', warehouse: '', type: 'add', qty: 0, reason: '' };
    }
}

WarehouseInventory.template = xml`
    <div class="card border-0 shadow-sm bg-white">
        
        <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center rounded-top">
            <div>
                <h2 class="h4 font-weight-bold text-dark mb-0">Warehouse &amp; Inventory</h2>
                <small class="text-muted">Manage main hubs, sub-warehouses, and physical stock levels.</small>
            </div>
            <div>
                <span class="badge badge-dark px-3 py-2 text-white"><i class="fa fa-cubes mr-1"></i> Inventory Engine Active</span>
            </div>
        </div>

        <div class="p-3 border-bottom">
            <ul class="nav nav-pills nav-fill">
                <li class="nav-item mr-2">
                    <button t-on-click="() => this.setSubTab('inventory')" 
                            t-attf-class="nav-link font-weight-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'inventory' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        📦 Stock Levels
                    </button>
                </li>
                <li class="nav-item">
                    <button t-on-click="() => this.setSubTab('warehouses')" 
                            t-attf-class="nav-link font-weight-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'warehouses' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🏭 Facilities &amp; Hubs
                    </button>
                </li>
            </ul>
        </div>

        <t t-if="this.state.activeSubTab === 'inventory'">
            <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                <h6 class="font-weight-bold mb-0">Master Inventory Control</h6>
                <button class="btn btn-sm btn-dark font-weight-bold" t-on-click="() => this.state.showAdjustmentForm = true">
                    <i class="fa fa-sliders mr-1"></i> Quick Adjustment
                </button>
            </div>

            <t t-if="this.state.showAdjustmentForm">
                <div class="p-4 bg-light border-bottom">
                    <h6 class="font-weight-bold text-dark mb-3">Adjust Physical Stock</h6>
                    <div class="row">
                        <div class="col-md-3">
                            <label class="small font-weight-bold">Select Product</label>
                            <select class="form-control" t-model="this.state.adjustmentForm.product">
                                <option value="">-- Choose SKU --</option>
                                <t t-foreach="this.state.inventory" t-as="inv" t-key="inv.id">
                                    <option t-att-value="inv.name"><t t-esc="inv.name"/></option>
                                </t>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="small font-weight-bold">Action</label>
                            <select class="form-control" t-model="this.state.adjustmentForm.type">
                                <option value="add">📥 Stock In (Add)</option>
                                <option value="remove">📤 Stock Out (Deduct)</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="small font-weight-bold">Quantity</label>
                            <input type="number" class="form-control" t-model="this.state.adjustmentForm.qty" min="1"/>
                        </div>
                        <div class="col-md-3">
                            <label class="small font-weight-bold">Target Warehouse</label>
                            <select class="form-control" t-model="this.state.adjustmentForm.warehouse">
                                <option value="">-- Target Facility --</option>
                                <t t-foreach="this.state.warehouses" t-as="wh" t-key="wh.id">
                                    <option t-att-value="wh.name"><t t-esc="wh.name"/></option>
                                </t>
                            </select>
                        </div>
                        <div class="col-md-2 d-flex align-items-end pb-1">
                            <button class="btn btn-outline-secondary w-50 mr-1" t-on-click="() => this.state.showAdjustmentForm = false">Cancel</button>
                            <button class="btn btn-success w-50" t-on-click="saveAdjustment">Apply</button>
                        </div>
                    </div>
                </div>
            </t>

            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light text-uppercase small font-weight-bold text-muted">
                        <tr>
                            <th class="border-top-0 pl-4">Product Details</th>
                            <th class="border-top-0">Category</th>
                            <th class="border-top-0 text-right">Physical Quantity</th>
                            <th class="border-top-0 text-center pr-4">Stock Health</th>
                        </tr>
                    </thead>
                    <tbody>
                        <t t-foreach="this.state.inventory" t-as="item" t-key="item.id">
                            <tr>
                                <td class="pl-4 align-middle">
                                    <div class="text-dark font-weight-bold"><t t-esc="item.name"/></div>
                                    <small class="text-muted">SKU: <t t-esc="item.id"/></small>
                                </td>
                                <td class="align-middle">
                                    <span class="badge badge-light border text-secondary px-2 py-1"><t t-esc="item.category"/></span>
                                </td>
                                <td class="align-middle text-right">
                                    <span class="h5 font-weight-bold text-dark mb-0"><t t-esc="item.stock"/></span>
                                    <span class="text-muted ml-1 small"><t t-esc="item.unit"/></span>
                                </td>
                                <td class="align-middle text-center pr-4">
                                    <span t-attf-class="badge #{item.status === 'Healthy' ? 'badge-success' : item.status === 'Low Stock' ? 'badge-warning text-dark' : 'badge-danger'} px-3 py-2 w-75">
                                        <t t-esc="item.status"/>
                                    </span>
                                </td>
                            </tr>
                        </t>
                    </tbody>
                </table>
            </div>
        </t>

        <t t-if="this.state.activeSubTab === 'warehouses'">
            <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                <h6 class="font-weight-bold mb-0">Storage Facilities Network</h6>
                <button class="btn btn-sm btn-dark" t-on-click="() => this.state.showWarehouseForm = true">+ Register Facility</button>
            </div>

            <t t-if="this.state.showWarehouseForm">
                <div class="p-4 bg-light border-bottom">
                    <div class="row">
                        <div class="col-md-3">
                            <label class="small font-weight-bold">Facility Name</label>
                            <input type="text" class="form-control" t-model="this.state.warehouseForm.name" placeholder="e.g. West Distribution Hub"/>
                        </div>
                        <div class="col-md-3">
                            <label class="small font-weight-bold">Facility Type</label>
                            <select class="form-control" t-model="this.state.warehouseForm.type">
                                <option value="Main Warehouse">Main Warehouse</option>
                                <option value="Sub-Warehouse">Sub-Warehouse</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="small font-weight-bold">Location Details</label>
                            <input type="text" class="form-control" t-model="this.state.warehouseForm.location" placeholder="City / Area Code"/>
                        </div>
                        <div class="col-md-3 d-flex align-items-end pb-1">
                            <button class="btn btn-outline-secondary mr-2" t-on-click="() => this.state.showWarehouseForm = false">Cancel</button>
                            <button class="btn btn-success flex-grow-1" t-on-click="saveWarehouse">Register Facility</button>
                        </div>
                    </div>
                </div>
            </t>

            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light text-uppercase small font-weight-bold text-muted">
                        <tr>
                            <th class="border-top-0 pl-4">Facility Details</th>
                            <th class="border-top-0">Type Designation</th>
                            <th class="border-top-0">Facility Manager</th>
                            <th class="border-top-0 text-right pr-4">Operational Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <t t-foreach="this.state.warehouses" t-as="wh" t-key="wh.id">
                            <tr>
                                <td class="pl-4 align-middle">
                                    <div class="text-dark font-weight-bold"><t t-esc="wh.name"/></div>
                                    <small class="text-muted"><i class="fa fa-map-marker mr-1"></i> <t t-esc="wh.location"/></small>
                                </td>
                                <td class="align-middle">
                                    <span t-attf-class="badge #{wh.type === 'Main Warehouse' ? 'badge-primary' : 'badge-info'} px-2 py-1"><t t-esc="wh.type"/></span>
                                </td>
                                <td class="align-middle text-dark">
                                    <t t-esc="wh.manager"/>
                                </td>
                                <td class="align-middle text-right pr-4">
                                    <span t-attf-class="badge #{wh.status === 'Active' ? 'badge-success' : 'badge-secondary'} px-2 py-1"><t t-esc="wh.status"/></span>
                                </td>
                            </tr>
                        </t>
                    </tbody>
                </table>
            </div>
        </t>

    </div>
`;