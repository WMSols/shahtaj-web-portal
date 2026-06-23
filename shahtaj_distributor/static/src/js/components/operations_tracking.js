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

OperationsTracking.template = "shahtaj_distributor.OperationsTracking"