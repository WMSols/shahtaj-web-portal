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

WarehouseInventory.template = "shahtaj_distributor.WarehouseInventory"