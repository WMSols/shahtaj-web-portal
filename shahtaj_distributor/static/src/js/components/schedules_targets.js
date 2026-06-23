/** @odoo-module **/

import { Component, useState, xml } from "@odoo/owl";

export class SchedulesTargets extends Component {
    setup() {
        this.state = useState({
            activeMainTab: 'schedules', // 'schedules' or 'targets'
            viewMode: 'list', // 'list' or 'detail'
            selectedBooker: null,
            showForm: false,
            errorMessage: '',

            // Form Data
            scheduleForm: { day: '', route: '', zone: '', is_active: true },
            targetForm: { startDate: '', endDate: '', is_active: true, type: '', amount: '', currency: 'PKR', product: '' },

            // Mock Data
            bookers: [
                { id: "OB-01", name: "Ali Khan", zone: "North Zone", route: "Commercial Market Main" },
                { id: "OB-02", name: "Usman Tariq", zone: "North Zone", route: "Phase 1 Residential" },
                { id: "OB-03", name: "Zain Ahmed", zone: "South Zone", route: "Factory Area Link" }
            ],
            
            // Shared Data Arrays
            schedules: [],
            targets: [],
            
            // Dropdown Options
            zones: ["North Zone - City Center", "South Zone - Industrial", "East Zone - Suburbs"],
            routes: ["Commercial Market Main", "Phase 1 Residential", "Factory Area Link"]
        });
    }

    // --- Navigation Controllers ---
    switchMainTab(tab) {
        this.state.activeMainTab = tab;
        this.state.viewMode = 'list';
        this.state.selectedBooker = null;
        this.state.showForm = false;
        this.state.errorMessage = '';
    }

    openBookerDetails(booker) {
        this.state.selectedBooker = booker;
        this.state.viewMode = 'detail';
        this.state.showForm = false;
        this.state.errorMessage = '';
    }

    goBackToList() {
        this.state.viewMode = 'list';
        this.state.selectedBooker = null;
        this.state.showForm = false;
        this.state.errorMessage = '';
    }

    openForm() {
        this.state.showForm = true;
        this.state.errorMessage = '';
        // Reset forms
        this.state.scheduleForm = { day: '', route: '', zone: '', is_active: true };
        this.state.targetForm = { startDate: '', endDate: '', is_active: true, type: '', amount: '', currency: 'PKR', product: '' };
    }

    // --- Data Getters ---
    get currentBookerSchedules() {
        return this.state.schedules.filter(s => s.bookerId === this.state.selectedBooker?.id);
    }

    get currentBookerTargets() {
        return this.state.targets.filter(t => t.bookerId === this.state.selectedBooker?.id);
    }

    // --- Save Handlers ---
    saveSchedule() {
        // Validation: Check if day is already scheduled for this booker
        const dayExists = this.currentBookerSchedules.some(s => s.day === this.state.scheduleForm.day);
        
        if (dayExists) {
            this.state.errorMessage = `A schedule for ${this.state.scheduleForm.day} already exists for this Order Booker.`;
            return;
        }

        if (!this.state.scheduleForm.day || !this.state.scheduleForm.route) {
            this.state.errorMessage = "Day and Route are required.";
            return;
        }

        this.state.schedules.push({
            id: `SCH-${Date.now()}`,
            bookerId: this.state.selectedBooker.id,
            day: this.state.scheduleForm.day,
            route: this.state.scheduleForm.route,
            zone: this.state.scheduleForm.zone,
            status: this.state.scheduleForm.is_active ? "Active" : "Inactive",
            progress: "0%",
            done: 0,
            planned: 0,
            shops: 0 // Will be calculated by backend
        });

        this.state.showForm = false;
        this.state.errorMessage = '';
    }

    saveTarget() {
        if (!this.state.targetForm.startDate || !this.state.targetForm.endDate || !this.state.targetForm.type) {
            this.state.errorMessage = "Start Date, End Date, and Target Type are required.";
            return;
        }
        const start = new Date(this.state.targetForm.startDate);
        const end = new Date(this.state.targetForm.endDate);
        
        if (end < start) {
            this.state.errorMessage = "The End Date cannot be earlier than the Start Date.";
            return;
        }

        this.state.targets.push({
            id: `TGT-${Date.now()}`,
            bookerId: this.state.selectedBooker.id,
            startDate: this.state.targetForm.startDate,
            endDate: this.state.targetForm.endDate,
            type: this.state.targetForm.type,
            amount: this.state.targetForm.amount,
            currency: this.state.targetForm.type === 'sales_amount' ? this.state.targetForm.currency : null,
            product: this.state.targetForm.type === 'product_quantity' ? this.state.targetForm.product : null,
            status: this.state.targetForm.is_active ? "Active" : "Inactive",
            progressPercentage: "0%",
            achievedAmount: 0
        });

        this.state.showForm = false;
        this.state.errorMessage = '';
    }
}

SchedulesTargets.template = "shahtaj_distributor.SchedulesTargets"