/** @odoo-module **/

import { Component, useState, xml } from "@odoo/owl";

export class StaffManagement extends Component {
    setup() {
        this.state = useState({
            activeTab: 'all', // 'all', 'order_booker', 'delivery_man', 'recovery_man'
            viewMode: 'list', // 'list' or 'detail'
            detailTab: 'schedules', // 'schedules' or 'targets' (for the detail view tables)
            selectedStaff: null,
            showForm: false,
            
            formData: { 
                name: '', 
                employee_code: '', 
                phone: '', 
                role: '', 
                route_id: '', 
                warehouse_id: '',
                email: '',
                password: ''
            },
            
            // Upgraded Mock Data: added schedulesList and targetsList arrays of objects
            staffList: [
                { 
                    id: 1, 
                    name: "Ali Khan", 
                    employee_code: "EMP-1042", 
                    role: "Order Booker", 
                    assignment: "Route A - North",
                    metrics: {
                        today: { total: 45, pending: 12, completed: 33 },
                        activeTarget: { title: "Monthly Sales Volume", goal: "500,000 PKR", progress: 68 },
                        // New Object Array for Schedules Table
                        schedulesList: [
                            { id: 1, day: "Monday", route: "Commercial Market", zone: "North Zone", shops: 24, progress: "100%", status: "Completed" },
                            { id: 2, day: "Tuesday", route: "Phase 1 Residential", zone: "North Zone", shops: 18, progress: "45%", status: "Active" }
                        ],
                        // New Object Array for Targets Table
                        targetsList: [
                            { id: 1, startDate: "2026-06-01", endDate: "2026-06-30", type: "Sales Volume", goal: "500,000 PKR", achieved: "340,000 PKR", progress: "68%", status: "Active" },
                            { id: 2, startDate: "2026-06-01", endDate: "2026-06-15", type: "Visit Count", goal: "150 Visits", achieved: "150 Visits", progress: "100%", status: "Completed" }
                        ]
                    }
                },
                { 
                    id: 2, 
                    name: "Usman Tariq", 
                    employee_code: "EMP-1088", 
                    role: "Order Booker", 
                    assignment: "Route B - Industrial",
                    metrics: {
                        today: { total: 30, pending: 30, completed: 0 },
                        activeTarget: { title: "New Shop Registrations", goal: "15 Shops", progress: 40 },
                        // New Object Array for Schedules Table
                        schedulesList: [
                            { id: 3, day: "Wednesday", route: "Factory Area Link", zone: "Industrial Zone", shops: 30, progress: "0%", status: "Pending" },
                            { id: 4, day: "Thursday", route: "Main Hub Link", zone: "Industrial Zone", shops: 25, progress: "0%", status: "Pending" }
                        ],
                        // New Object Array for Targets Table
                        targetsList: [
                            { id: 3, startDate: "2026-06-10", endDate: "2026-06-25", type: "New Registrations", goal: "15 Shops", achieved: "6 Shops", progress: "40%", status: "Active" }
                        ]
                    }
                },
                { 
                    id: 3, 
                    name: "Zain Ahmed", 
                    employee_code: "", 
                    role: "Delivery Man", 
                    assignment: "Main Hub", 
                    metrics: null 
                }
            ]
        });
    }

    // --- Tab & View Controllers ---
    switchTab(tabName) {
        this.state.activeTab = tabName;
        this.state.viewMode = 'list';
        this.state.showForm = false;
    }

    openDetails(staff) {
        this.state.selectedStaff = staff;
        this.state.viewMode = 'detail';
        this.state.showForm = false;
        this.state.detailTab = 'schedules'; // Reset tab when opening details
    }

    goBack() {
        this.state.selectedStaff = null;
        this.state.viewMode = 'list';
    }

    openForm() {
        this.state.formData = { name: '', employee_code: '', phone: '', role: '', route_id: '', warehouse_id: '', email: '', password: '' };
        this.state.showForm = true;
        this.state.viewMode = 'list';
    }

    // --- Computed Properties ---
    get filteredStaffList() {
        if (this.state.activeTab === 'all') return this.state.staffList;
        // Convert "Order Booker" to "order_booker" to match the tab keys
        return this.state.staffList.filter(s => s.role.toLowerCase().replace(' ', '_') === this.state.activeTab);
    }

    // --- Actions ---
    saveStaff() {
        let assignment = "Pending";
        if (this.state.formData.role === 'order_booker') assignment = this.state.formData.route_id;
        if (this.state.formData.role === 'delivery_man' || this.state.formData.role === 'recovery_man') assignment = this.state.formData.warehouse_id;

        // Initialize empty metrics with the new arrays for order bookers
        let metrics = null;
        if (this.state.formData.role === 'order_booker') {
            metrics = { 
                today: { total: 0, pending: 0, completed: 0 }, 
                activeTarget: { title: "No Active Target", goal: "-", progress: 0 }, 
                schedulesList: [], 
                targetsList: [] 
            };
        }

        this.state.staffList.push({
            id: this.state.staffList.length + 1,
            name: this.state.formData.name,
            employee_code: this.state.formData.employee_code,
            role: this.state.formData.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), // Capitalize logic
            assignment: assignment,
            metrics: metrics
        });
        this.state.showForm = false;
    }
}

StaffManagement.template = "shahtaj_distributor.StaffManagement"