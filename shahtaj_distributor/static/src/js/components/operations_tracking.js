/** @odoo-module **/

import { Component, useState, xml } from "@odoo/owl";

export class OperationsTracking extends Component {
    setup() {
        this.state = useState({
            activeSubTab: 'orders', // Defaulted to orders
            selectedOrder: null,    // Tracks which order is currently open
            
            // --- FILTER & PAGINATION STATE ---
            itemsPerPage: 5,
            
            deliveryFilters: { search: '', status: '' },
            deliveryPage: 1,
            
            checkinFilters: { search: '', status: '' },
            checkinPage: 1,
            
            orderFilters: { search: '', status: '' },
            orderPage: 1,

            // Mock Data: Active Delivery Fleet (Expanded)
            deliveries: [
                { id: "DLV-0091", driver: "Zain Ahmed", route: "Route A - Central", status: "In-Transit", progress: "65%", last_update: "10 mins ago" },
                { id: "DLV-0092", driver: "Fahad Mustafa", route: "Route C - Industrial", status: "Pending", progress: "0%", last_update: "Loading at Hub" },
                { id: "DLV-0093", driver: "Kamran Ali", route: "Route B - North", status: "Delivered", progress: "100%", last_update: "1 hour ago" },
                { id: "DLV-0094", driver: "Bilal Tariq", route: "Route D - South", status: "Returned", progress: "80%", last_update: "Gate Check-in" },
                { id: "DLV-0095", driver: "Adeel Hassan", route: "Route A - Central", status: "In-Transit", progress: "45%", last_update: "2 mins ago" },
                { id: "DLV-0096", driver: "Tariq Mahmood", route: "Route E - Outer", status: "Delivered", progress: "100%", last_update: "30 mins ago" },
                { id: "DLV-0097", driver: "Usman Ali", route: "Route C - Industrial", status: "Pending", progress: "0%", last_update: "Queued" },
                { id: "DLV-0098", driver: "Hamza Farooq", route: "Route B - North", status: "In-Transit", progress: "85%", last_update: "5 mins ago" }
            ],

            // Mock Data: Geo-tagged Check-ins (Expanded)
            checkins: [
                { id: 1, time: "10:15 AM", booker: "Ali Khan", shop: "Al-Hafeez Supermart", status: "Checked Out", duration: "14 mins" },
                { id: 2, time: "10:45 AM", booker: "Ali Khan", shop: "Bismillah General Store", status: "Checked In", duration: "Active Now" },
                { id: 3, time: "09:30 AM", booker: "Usman Tariq", shop: "Metro Cash & Carry", status: "Checked Out", duration: "45 mins" },
                { id: 4, time: "11:00 AM", booker: "Zahid Qureshi", shop: "Madina Traders", status: "Checked In", duration: "Active Now" },
                { id: 5, time: "11:15 AM", booker: "Ali Khan", shop: "Kashmir Mart", status: "Checked Out", duration: "10 mins" },
                { id: 6, time: "11:30 AM", booker: "Usman Tariq", shop: "Awais Kiryana", status: "Checked Out", duration: "20 mins" },
                { id: 7, time: "11:45 AM", booker: "Zahid Qureshi", shop: "City Center Mart", status: "Checked In", duration: "Active Now" }
            ],

            // Mock Data: Expanded Live Field Orders
            orders: [
                { id: "SO-1042", shop: "Bismillah General Store", booker: "Ali Khan", address: "Main Market, Block 4, Mianwali", phone: "0300-1234567", date: "22-Jun-2026 09:15 AM", items: 34, total: "Rs. 45,000", status: "Draft", lines: [{ product: "Shahtaj Premium Cooking Oil 5L", qty: 4, unit: "Carton", price: "4,500", subtotal: "18,000" }, { product: "Shahtaj Banaspati 1kg Pouch", qty: 30, unit: "Pieces", price: "900", subtotal: "27,000" }] },
                { id: "SO-1041", shop: "Al-Hafeez Supermart", booker: "Ali Khan", address: "Commercial Zone, Phase 1", phone: "0333-9876543", date: "22-Jun-2026 08:30 AM", items: 120, total: "Rs. 120,500", status: "Confirmed", lines: [{ product: "Shahtaj Cooking Oil 1L Pouch", qty: 100, unit: "Pieces", price: "950", subtotal: "95,000" }, { product: "Shahtaj Banaspati 5kg Tin", qty: 20, unit: "Tin", price: "1,275", subtotal: "25,500" }] },
                { id: "SO-1040", shop: "Madina Traders", booker: "Usman Tariq", address: "G.T. Road Link", phone: "0321-5558888", date: "21-Jun-2026 04:45 PM", items: 15, total: "Rs. 67,500", status: "Delivered", lines: [{ product: "Shahtaj Premium Cooking Oil 5L", qty: 15, unit: "Carton", price: "4,500", subtotal: "67,500" }] },
                { id: "SO-1043", shop: "Kashmir Mart", booker: "Ali Khan", address: "PAF Road", phone: "0345-1112222", date: "22-Jun-2026 10:00 AM", items: 50, total: "Rs. 47,500", status: "Confirmed", lines: [{ product: "Shahtaj Cooking Oil 1L Pouch", qty: 50, unit: "Pieces", price: "950", subtotal: "47,500" }] },
                { id: "SO-1044", shop: "Awais Kiryana", booker: "Usman Tariq", address: "Ballo Khel Road", phone: "0301-9998888", date: "22-Jun-2026 10:30 AM", items: 10, total: "Rs. 12,750", status: "Draft", lines: [{ product: "Shahtaj Banaspati 5kg Tin", qty: 10, unit: "Tin", price: "1,275", subtotal: "12,750" }] },
                { id: "SO-1045", shop: "City Center Mart", booker: "Zahid Qureshi", address: "City Center", phone: "0333-4445555", date: "22-Jun-2026 11:15 AM", items: 200, total: "Rs. 190,000", status: "Confirmed", lines: [{ product: "Shahtaj Cooking Oil 1L Pouch", qty: 200, unit: "Pieces", price: "950", subtotal: "190,000" }] },
                { id: "SO-1046", shop: "Metro Cash & Carry", booker: "Usman Tariq", address: "Main Highway", phone: "0300-7776666", date: "21-Jun-2026 05:30 PM", items: 5, total: "Rs. 22,500", status: "Delivered", lines: [{ product: "Shahtaj Premium Cooking Oil 5L", qty: 5, unit: "Carton", price: "4,500", subtotal: "22,500" }] }
            ]
        });
    }

    setSubTab(tabName) {
        this.state.activeSubTab = tabName;
        this.state.selectedOrder = null;
    }

    // --- DELIVERY GETTERS ---
    get filteredDeliveries() {
        return this.state.deliveries.filter(d => {
            const matchSearch = d.driver.toLowerCase().includes(this.state.deliveryFilters.search.toLowerCase()) || 
                                d.id.toLowerCase().includes(this.state.deliveryFilters.search.toLowerCase()) ||
                                d.route.toLowerCase().includes(this.state.deliveryFilters.search.toLowerCase());
            const matchStatus = this.state.deliveryFilters.status ? d.status === this.state.deliveryFilters.status : true;
            return matchSearch && matchStatus;
        });
    }
    get paginatedDeliveries() {
        const start = (this.state.deliveryPage - 1) * this.state.itemsPerPage;
        return this.filteredDeliveries.slice(start, start + this.state.itemsPerPage);
    }
    get deliveryTotalPages() { return Math.max(1, Math.ceil(this.filteredDeliveries.length / this.state.itemsPerPage)); }

    // --- CHECKIN GETTERS ---
    get filteredCheckins() {
        return this.state.checkins.filter(c => {
            const matchSearch = c.shop.toLowerCase().includes(this.state.checkinFilters.search.toLowerCase()) || 
                                c.booker.toLowerCase().includes(this.state.checkinFilters.search.toLowerCase());
            const matchStatus = this.state.checkinFilters.status ? c.status === this.state.checkinFilters.status : true;
            return matchSearch && matchStatus;
        });
    }
    get paginatedCheckins() {
        const start = (this.state.checkinPage - 1) * this.state.itemsPerPage;
        return this.filteredCheckins.slice(start, start + this.state.itemsPerPage);
    }
    get checkinTotalPages() { return Math.max(1, Math.ceil(this.filteredCheckins.length / this.state.itemsPerPage)); }

    // --- ORDER GETTERS ---
    get filteredOrders() {
        return this.state.orders.filter(o => {
            const matchSearch = o.shop.toLowerCase().includes(this.state.orderFilters.search.toLowerCase()) || 
                                o.id.toLowerCase().includes(this.state.orderFilters.search.toLowerCase()) ||
                                o.booker.toLowerCase().includes(this.state.orderFilters.search.toLowerCase());
            const matchStatus = this.state.orderFilters.status ? o.status === this.state.orderFilters.status : true;
            return matchSearch && matchStatus;
        });
    }
    get paginatedOrders() {
        const start = (this.state.orderPage - 1) * this.state.itemsPerPage;
        return this.filteredOrders.slice(start, start + this.state.itemsPerPage);
    }
    get orderTotalPages() { return Math.max(1, Math.ceil(this.filteredOrders.length / this.state.itemsPerPage)); }

    // --- PAGINATION ACTION ---
    changePage(type, direction) {
        if (type === 'delivery') {
            const newPage = this.state.deliveryPage + direction;
            if (newPage >= 1 && newPage <= this.deliveryTotalPages) this.state.deliveryPage = newPage;
        } else if (type === 'checkin') {
            const newPage = this.state.checkinPage + direction;
            if (newPage >= 1 && newPage <= this.checkinTotalPages) this.state.checkinPage = newPage;
        } else if (type === 'order') {
            const newPage = this.state.orderPage + direction;
            if (newPage >= 1 && newPage <= this.orderTotalPages) this.state.orderPage = newPage;
        }
    }

    viewOrder(order) { this.state.selectedOrder = order; }
    closeOrder() { this.state.selectedOrder = null; }
}

OperationsTracking.template = xml`
    <div class="card border-0 shadow-sm bg-white">
        
        <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center rounded-top">
            <div>
                <h2 class="h4 fw-bold text-dark mb-0">Live Operations Tracker</h2>
                <small class="text-muted">Monitor logistics, field personnel, and incoming orders in real-time.</small>
            </div>
            <div>
                <span class="badge bg-success px-3 py-2 fs-6 shadow-sm"><i class="fa fa-circle text-white me-1" style="font-size: 8px;"></i> System Online</span>
            </div>
        </div>

        <div class="p-3 border-bottom">
            <ul class="nav nav-pills nav-fill">
                <li class="nav-item">
                    <button t-on-click="() => this.setSubTab('deliveries')" 
                            t-attf-class="nav-link fw-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'deliveries' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🚚 Delivery Fleet
                    </button>
                </li>
                <li class="nav-item mx-2">
                    <button t-on-click="() => this.setSubTab('checkins')" 
                            t-attf-class="nav-link fw-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'checkins' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        📍 Shop Check-ins
                    </button>
                </li>
                <li class="nav-item">
                    <button t-on-click="() => this.setSubTab('orders')" 
                            t-attf-class="nav-link fw-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'orders' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🛒 Live Orders
                    </button>
                </li>
            </ul>
        </div>

        <t t-if="this.state.activeSubTab === 'deliveries'">
            <div class="p-3 bg-light border-bottom">
                <div class="row g-2">
                    <div class="col-md-6">
                        <input type="text" class="form-control form-control-sm" placeholder="Search Driver, Route, or ID..." 
                               t-model="this.state.deliveryFilters.search" t-on-input="() => this.state.deliveryPage = 1"/>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select form-select-sm" t-model="this.state.deliveryFilters.status" t-on-change="() => this.state.deliveryPage = 1">
                            <option value="">All Statuses</option>
                            <option value="In-Transit">In-Transit</option>
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Returned">Returned</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="p-0 table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light text-uppercase small fw-bold text-muted">
                        <tr>
                            <th class="border-top-0 ps-4">Manifest ID</th>
                            <th class="border-top-0">Driver &amp; Route</th>
                            <th class="border-top-0">Completion</th>
                            <th class="border-top-0">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <t t-if="this.paginatedDeliveries.length === 0">
                            <tr><td colspan="4" class="text-center py-4 text-muted">No delivery fleet records found.</td></tr>
                        </t>
                        <t t-foreach="this.paginatedDeliveries" t-as="dlv" t-key="dlv.id">
                            <tr>
                                <td class="ps-4 fw-bold align-middle"><t t-esc="dlv.id"/></td>
                                <td class="align-middle">
                                    <div class="text-dark fw-bold"><t t-esc="dlv.driver"/></div>
                                    <small class="text-muted"><t t-esc="dlv.route"/></small>
                                </td>
                                <td class="align-middle w-25">
                                    <div class="d-flex align-items-center">
                                        <div class="progress flex-grow-1 me-2" style="height: 8px;">
                                            <div class="progress-bar bg-info" role="progressbar" t-attf-style="width: #{dlv.progress};"></div>
                                        </div>
                                        <small class="text-muted fw-bold"><t t-esc="dlv.progress"/></small>
                                    </div>
                                    <small class="text-muted" style="font-size: 11px;">Update: <t t-esc="dlv.last_update"/></small>
                                </td>
                                <td class="align-middle">
                                    <span t-if="dlv.status === 'In-Transit'" class="badge bg-warning text-dark p-2 fs-6 shadow-sm"><t t-esc="dlv.status"/></span>
                                    <span t-if="dlv.status === 'Pending'" class="badge bg-secondary p-2 fs-6 shadow-sm"><t t-esc="dlv.status"/></span>
                                    <span t-if="dlv.status === 'Delivered'" class="badge bg-success p-2 fs-6 shadow-sm"><t t-esc="dlv.status"/></span>
                                    <span t-if="dlv.status === 'Returned'" class="badge bg-danger p-2 fs-6 shadow-sm"><t t-esc="dlv.status"/></span>
                                </td>
                            </tr>
                        </t>
                    </tbody>
                </table>
            </div>

            <div class="p-3 border-top d-flex justify-content-between align-items-center bg-light">
                <small class="text-muted fw-bold">
                    Showing <t t-esc="this.filteredDeliveries.length === 0 ? 0 : ((this.state.deliveryPage - 1) * this.state.itemsPerPage) + 1"/> to 
                    <t t-esc="Math.min(this.state.deliveryPage * this.state.itemsPerPage, this.filteredDeliveries.length)"/> of <t t-esc="this.filteredDeliveries.length"/>
                </small>
                <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('delivery', -1)" t-att-disabled="this.state.deliveryPage === 1">Previous</button>
                    <button class="btn btn-sm btn-light border px-3 fw-bold disabled"><t t-esc="this.state.deliveryPage"/> / <t t-esc="this.deliveryTotalPages"/></button>
                    <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('delivery', 1)" t-att-disabled="this.state.deliveryPage === this.deliveryTotalPages">Next</button>
                </div>
            </div>
        </t>

        <t t-if="this.state.activeSubTab === 'checkins'">
            <div class="p-3 bg-light border-bottom d-flex gap-2">
                <input type="text" class="form-control form-control-sm w-50" placeholder="Search Shop or Booker..." 
                       t-model="this.state.checkinFilters.search" t-on-input="() => this.state.checkinPage = 1"/>
                <select class="form-select form-select-sm w-25" t-model="this.state.checkinFilters.status" t-on-change="() => this.state.checkinPage = 1">
                    <option value="">All Feed Statuses</option>
                    <option value="Checked In">Active (Checked In)</option>
                    <option value="Checked Out">Completed (Checked Out)</option>
                </select>
            </div>
            
            <div class="list-group list-group-flush">
                <t t-if="this.paginatedCheckins.length === 0">
                    <div class="p-4 text-center text-muted">No check-in activity found.</div>
                </t>
                <t t-foreach="this.paginatedCheckins" t-as="log" t-key="log.id">
                    <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                        <div class="d-flex align-items-center">
                            <div class="bg-light rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm border" style="width: 45px; height: 45px; font-size: 1.2rem;">
                                📍
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold"><t t-esc="log.shop"/></h6>
                                <small class="text-muted"><t t-esc="log.booker"/> • <t t-esc="log.time"/></small>
                            </div>
                        </div>
                        <div class="text-end">
                            <span t-attf-class="badge #{log.status === 'Checked In' ? 'bg-success text-white shadow-sm' : 'bg-light text-dark border'} p-2 fs-6 mb-1 d-inline-block">
                                <t t-esc="log.status"/>
                            </span>
                            <div class="text-muted fw-bold small"><t t-esc="log.duration"/></div>
                        </div>
                    </div>
                </t>
            </div>

            <div class="p-3 border-top d-flex justify-content-between align-items-center bg-light">
                <small class="text-muted fw-bold">
                    Showing <t t-esc="this.filteredCheckins.length === 0 ? 0 : ((this.state.checkinPage - 1) * this.state.itemsPerPage) + 1"/> to 
                    <t t-esc="Math.min(this.state.checkinPage * this.state.itemsPerPage, this.filteredCheckins.length)"/> of <t t-esc="this.filteredCheckins.length"/>
                </small>
                <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('checkin', -1)" t-att-disabled="this.state.checkinPage === 1">Previous</button>
                    <button class="btn btn-sm btn-light border px-3 fw-bold disabled"><t t-esc="this.state.checkinPage"/> / <t t-esc="this.checkinTotalPages"/></button>
                    <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('checkin', 1)" t-att-disabled="this.state.checkinPage === this.checkinTotalPages">Next</button>
                </div>
            </div>
        </t>

        <t t-if="this.state.activeSubTab === 'orders'">
            
            <t t-if="!this.state.selectedOrder">
                <div class="p-3 bg-light border-bottom">
                    <div class="row g-2">
                        <div class="col-md-6">
                            <input type="text" class="form-control form-control-sm" placeholder="Search Shop, Booker, or Order ID..." 
                                   t-model="this.state.orderFilters.search" t-on-input="() => this.state.orderPage = 1"/>
                        </div>
                        <div class="col-md-4">
                            <select class="form-select form-select-sm" t-model="this.state.orderFilters.status" t-on-change="() => this.state.orderPage = 1">
                                <option value="">All Order Statuses</option>
                                <option value="Draft">Draft</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="p-0 table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th class="border-top-0 ps-4">Order Ref</th>
                                <th class="border-top-0">Shop Details</th>
                                <th class="border-top-0">Order Value</th>
                                <th class="border-top-0">Status</th>
                                <th class="border-top-0 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <t t-if="this.paginatedOrders.length === 0">
                                <tr><td colspan="5" class="text-center py-4 text-muted">No live orders found.</td></tr>
                            </t>
                            <t t-foreach="this.paginatedOrders" t-as="ord" t-key="ord.id">
                                <tr>
                                    <td class="ps-4 fw-bold align-middle text-dark"><t t-esc="ord.id"/></td>
                                    <td class="align-middle">
                                        <div class="text-dark fw-bold"><t t-esc="ord.shop"/></div>
                                        <small class="text-muted">Booked by: <t t-esc="ord.booker"/></small>
                                    </td>
                                    <td class="align-middle">
                                        <div class="fw-bold fs-6"><t t-esc="ord.total"/></div>
                                        <small class="text-muted"><t t-esc="ord.items"/> Total Units</small>
                                    </td>
                                    <td class="align-middle">
                                        <span t-attf-class="badge #{ord.status === 'Confirmed' ? 'bg-primary' : ord.status === 'Delivered' ? 'bg-success' : 'bg-secondary'} p-2 fs-6 shadow-sm">
                                            <t t-esc="ord.status"/>
                                        </span>
                                    </td>
                                    <td class="align-middle text-end pe-4">
                                        <button class="btn btn-sm btn-outline-dark fw-bold" t-on-click="() => this.viewOrder(ord)">
                                            View Details →
                                        </button>
                                    </td>
                                </tr>
                            </t>
                        </tbody>
                    </table>
                </div>

                <div class="p-3 border-top d-flex justify-content-between align-items-center bg-light">
                    <small class="text-muted fw-bold">
                        Showing <t t-esc="this.filteredOrders.length === 0 ? 0 : ((this.state.orderPage - 1) * this.state.itemsPerPage) + 1"/> to 
                        <t t-esc="Math.min(this.state.orderPage * this.state.itemsPerPage, this.filteredOrders.length)"/> of <t t-esc="this.filteredOrders.length"/>
                    </small>
                    <div class="btn-group shadow-sm">
                        <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('order', -1)" t-att-disabled="this.state.orderPage === 1">Previous</button>
                        <button class="btn btn-sm btn-light border px-3 fw-bold disabled"><t t-esc="this.state.orderPage"/> / <t t-esc="this.orderTotalPages"/></button>
                        <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('order', 1)" t-att-disabled="this.state.orderPage === this.orderTotalPages">Next</button>
                    </div>
                </div>
            </t>

            <t t-else="">
                <div class="p-4" style="background-color: #f8fafc;">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <button class="btn btn-sm btn-light border shadow-sm fw-bold text-dark" t-on-click="closeOrder">
                            ← Back to List
                        </button>
                        <div>
                            <span t-attf-class="badge #{this.state.selectedOrder.status === 'Confirmed' ? 'bg-primary' : this.state.selectedOrder.status === 'Delivered' ? 'bg-success' : 'bg-secondary'} p-2 fs-6 text-uppercase shadow-sm" style="letter-spacing: 1px;">
                                Status: <t t-esc="this.state.selectedOrder.status"/>
                            </span>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6 mb-3 mb-md-0">
                            <div class="card border-0 shadow-sm p-4 h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-3">Customer Details</h6>
                                <h5 class="fw-bold text-dark mb-1"><t t-esc="this.state.selectedOrder.shop"/></h5>
                                <p class="text-muted mb-1 small">📍 <t t-esc="this.state.selectedOrder.address"/></p>
                                <p class="text-muted mb-0 small">📞 <t t-esc="this.state.selectedOrder.phone"/></p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card border-0 shadow-sm p-4 h-100">
                                <h6 class="text-muted text-uppercase small fw-bold mb-3">Order Information</h6>
                                <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                    <span class="text-muted small">Order Reference:</span>
                                    <span class="fw-bold text-dark"><t t-esc="this.state.selectedOrder.id"/></span>
                                </div>
                                <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                    <span class="text-muted small">Order Date:</span>
                                    <span class="fw-bold text-dark"><t t-esc="this.state.selectedOrder.date"/></span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span class="text-muted small">Field Booker:</span>
                                    <span class="fw-bold text-dark"><t t-esc="this.state.selectedOrder.booker"/></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm overflow-hidden">
                        <div class="bg-dark text-white p-3">
                            <h6 class="mb-0 fw-bold">Order Line Items</h6>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-borderless table-striped mb-0">
                                <thead class="border-bottom small text-muted text-uppercase fw-bold">
                                    <tr>
                                        <th class="ps-4">Product Description</th>
                                        <th class="text-center">Quantity</th>
                                        <th class="text-end">Unit Price</th>
                                        <th class="text-end pe-4">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <t t-foreach="this.state.selectedOrder.lines" t-as="line" t-key="line.product">
                                        <tr>
                                            <td class="ps-4 fw-bold text-dark"><t t-esc="line.product"/></td>
                                            <td class="text-center"><t t-esc="line.qty"/> <small class="text-muted"><t t-esc="line.unit"/></small></td>
                                            <td class="text-end">Rs. <t t-esc="line.price"/></td>
                                            <td class="text-end pe-4 fw-bold">Rs. <t t-esc="line.subtotal"/></td>
                                        </tr>
                                    </t>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="bg-light p-4 border-top">
                            <div class="row justify-content-end">
                                <div class="col-md-5">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Total Units:</span>
                                        <span class="fw-bold"><t t-esc="this.state.selectedOrder.items"/></span>
                                    </div>
                                    <div class="d-flex justify-content-between border-top pt-3 mt-2">
                                        <span class="text-dark fw-bold text-uppercase">Grand Total:</span>
                                        <h4 class="fw-bold text-success mb-0"><t t-esc="this.state.selectedOrder.total"/></h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </t>
        </t>
    </div>
`;