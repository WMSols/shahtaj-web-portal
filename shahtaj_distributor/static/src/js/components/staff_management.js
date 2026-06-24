/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class StaffManagement extends Component {
    setup() {
        this.orm = useService("orm");
        this.state = useState({
            activeTab: 'order_booker',
            viewMode: 'list', 
            detailTab: 'schedules', 
            selectedStaff: null,
            showForm: false,
            isLoading: false,
            
            // Real Data Arrays
            staffList: [],
            detailSchedules: [],
            detailTargets: [],
            
            formData: { 
                name: '', 
                employee_code: '', 
                email: '',
                password: '',
                role: 'order_booker'
            }
        });

        onWillStart(async () => {
            await this.fetchStaffData();
        });
    }

    // --- Data Fetching ---
    async fetchStaffData() {
        const bookers = await this.orm.searchRead(
            "res.users",
            [["shahtaj_is_order_booker", "=", true]],
            [
                "id", "name", "shahtaj_employee_code", "shahtaj_online_status",
                "shahtaj_task_today_total", "shahtaj_task_today_pending", "shahtaj_task_today_done",
                "shahtaj_active_target_progress", "shahtaj_active_target_summary"
            ]
        );
        
        this.state.staffList = bookers.map(u => ({
            id: u.id,
            name: u.name,
            employee_code: u.shahtaj_employee_code,
            role: "Order Booker",
            status: u.shahtaj_online_status,
            metrics: {
                today: { 
                    total: u.shahtaj_task_today_total, 
                    pending: u.shahtaj_task_today_pending, 
                    completed: u.shahtaj_task_today_done 
                },
                activeTarget: { 
                    summary: u.shahtaj_active_target_summary, 
                    progress: u.shahtaj_active_target_progress 
                }
            }
        }));
    }

    async openDetails(staff) {
        this.state.selectedStaff = staff;
        
        // 1. Fetch Weekly Schedules
        const schedules = await this.orm.searchRead(
            "shahtaj.weekly.schedule",
            [["order_booker_id", "=", staff.id]],
            ["id", "day_of_week", "route_id", "zone_id", "active"] // Fixed 'day' to 'day_of_week'
        );

        // Map numeric day values to string labels
        const dayMap = {
            '0': 'Monday', '1': 'Tuesday', '2': 'Wednesday', 
            '3': 'Thursday', '4': 'Friday', '5': 'Saturday', '6': 'Sunday'
        };

        this.state.detailSchedules = schedules.map(s => ({
            ...s,
            day: dayMap[s.day_of_week] || s.day_of_week
        }));

        // 2. Fetch Performance Targets
        this.state.detailTargets = await this.orm.searchRead(
            "shahtaj.visit.target",
            [["order_booker_id", "=", staff.id]],
            ["id", "date_start", "date_end", "target_type", "target_value", "achieved_value", "progress_percent", "active"]
        );

        this.state.viewMode = 'detail';
        this.state.detailTab = 'schedules';
    }

    // --- UI Controls ---
    switchTab(tabName) {
        this.state.activeTab = tabName;
        this.state.viewMode = 'list';
        this.fetchStaffData();
    }

    goBack() {
        this.state.selectedStaff = null;
        this.state.viewMode = 'list';
        this.fetchStaffData();
    }

    openForm() {
        this.state.formData = { name: '', employee_code: '', email: '', password: '', role: 'order_booker' };
        this.state.showForm = true;
    }

    // --- Database Creation ---
    async saveStaff() {
        if (!this.state.formData.name || !this.state.formData.email || !this.state.formData.password) {
            alert("Name, Email, and Password are required.");
            return;
        }

        try {
            // Find the ID of the 'Order Booker' access group dynamically
            const groupData = await this.orm.searchRead(
                "ir.model.data",
                [["module", "=", "shahtaj_order_booker"], ["name", "=", "group_shahtaj_order_booker"]],
                ["res_id"]
            );
            
            const payload = {
                name: this.state.formData.name,
                login: this.state.formData.email,
                password: this.state.formData.password,
                shahtaj_employee_code: this.state.formData.employee_code,
            };

            // Link the group to the user via the Many2many relationship
            if (groupData.length > 0) {
                payload.groups_id = [[4, groupData[0].res_id]];
            }

            // Create the record directly via ORM
            await this.orm.create("res.users", [payload]);

            this.state.showForm = false;
            await this.fetchStaffData();

        } catch (error) {
            console.error("Creation failed:", error);
            alert(`Failed to create order booker:\n\n${error.data?.message || error.message}`);
        }
    }
}

StaffManagement.template = "shahtaj_distributor.StaffManagement";