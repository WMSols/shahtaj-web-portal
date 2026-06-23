/** @odoo-module **/

import { Component, useState, xml } from "@odoo/owl";

export class PortalSettings extends Component {
    setup() {
        this.state = useState({
            activeSubTab: 'general', // 'general' or 'users'
            showUserForm: false,
            
            // Mock Data: Native Company Settings mapping
            companyForm: {
                name: "Shahtaj Oil Distributor (Mianwali Branch)",
                phone: "0459-123456",
                logo_preview: false // In production, this will hold the base64 string
            },

            // Mock Data: User Provisioning mapping
            userForm: { name: '', email: '', password: '', role: '' },
            
            // Mock Data: Existing Users
            users: [
                { id: 1, name: "Sohaib Zaman", email: "admin@shahtaj.com", role: "Distributor (Super Admin)", status: "Active" },
                { id: 2, name: "Usman Tariq", email: "usman.area@shahtaj.com", role: "Area Manager", status: "Active" },
                { id: 3, name: "Ali Khan", email: "ali.kpo@shahtaj.com", role: "KPO (Key Punch Operator)", status: "Active" }
            ]
        });
    }

    setSubTab(tabName) {
        this.state.activeSubTab = tabName;
        this.state.showUserForm = false;
    }

    // --- Company Settings Actions ---
    triggerLogoUpload() {
        // In the real version, this will trigger a hidden <input type="file">
        alert("File picker will open here to select a new logo.");
    }

    saveCompanySettings() {
        // Mock save action
        alert(`Settings saved for: ${this.state.companyForm.name}`);
    }

    // --- User Management Actions ---
    openUserForm() {
        this.state.userForm = { name: '', email: '', password: '', role: '' };
        this.state.showUserForm = true;
    }

    saveUser() {
        if (!this.state.userForm.name || !this.state.userForm.role) return;
        
        this.state.users.push({
            id: this.state.users.length + 1,
            name: this.state.userForm.name,
            email: this.state.userForm.email || "Pending",
            role: this.state.userForm.role,
            status: "Active"
        });
        this.state.showUserForm = false;
    }
}

PortalSettings.template = xml`
    <div class="card border-0 shadow-sm bg-white">
        
        <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center rounded-top">
            <div>
                <h2 class="h4 fw-bold text-dark mb-0">Portal Configuration</h2>
                <small class="text-muted">Manage system preferences and user access rights.</small>
            </div>
            <div>
                <span class="badge bg-dark px-3 py-2 fs-6 shadow-sm"><i class="fa fa-cog text-white me-1"></i> Admin Controls</span>
            </div>
        </div>

        <div class="p-3 border-bottom">
            <ul class="nav nav-pills nav-fill">
                <li class="nav-item me-2">
                    <button t-on-click="() => this.setSubTab('general')" 
                            t-attf-class="nav-link fw-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'general' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🏢 General Settings
                    </button>
                </li>
                <li class="nav-item">
                    <button t-on-click="() => this.setSubTab('users')" 
                            t-attf-class="nav-link fw-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'users' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🔐 Access Management
                    </button>
                </li>
            </ul>
        </div>

        <t t-if="this.state.activeSubTab === 'general'">
            <div class="p-4">
                <div class="row">
                    <div class="col-md-7 border-end pe-4">
                        <h5 class="fw-bold mb-4">Company Profile</h5>
                        
                        <div class="mb-3">
                            <label class="small fw-bold text-muted mb-1">Distributor Name (Appears on Invoices)</label>
                            <input type="text" class="form-control" t-model="this.state.companyForm.name"/>
                        </div>
                        
                        <div class="mb-4">
                            <label class="small fw-bold text-muted mb-1">Primary Contact Number</label>
                            <input type="text" class="form-control" t-model="this.state.companyForm.phone"/>
                        </div>

                        <button class="btn btn-primary fw-bold px-4" t-on-click="saveCompanySettings">Save Changes</button>
                    </div>

                    <div class="col-md-5 ps-4">
                        <h5 class="fw-bold mb-4">Corporate Branding</h5>
                        
                        <div class="p-4 border rounded bg-light text-center">
                            <div class="mb-3">
                                <t t-if="this.state.companyForm.logo_preview">
                                    <img src="this.state.companyForm.logo_preview" class="img-fluid rounded border shadow-sm" style="max-height: 120px;"/>
                                </t>
                                <t t-else="">
                                    <div class="bg-white border rounded d-inline-flex justify-content-center align-items-center shadow-sm" style="width: 120px; height: 120px;">
                                        <i class="fa fa-building fa-3x text-muted"></i>
                                    </div>
                                </t>
                            </div>
                            
                            <h6 class="fw-bold">Company Logo</h6>
                            <small class="text-muted d-block mb-3">Recommended size: 400x150px (PNG or JPG)</small>
                            <button class="btn btn-sm btn-outline-dark" t-on-click="triggerLogoUpload">
                                <i class="fa fa-upload me-1"></i> Upload New Image
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </t>

        <t t-if="this.state.activeSubTab === 'users'">
            
            <t t-if="!this.state.showUserForm">
                <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h6 class="fw-bold mb-0">System Users &amp; Permissions</h6>
                    <button class="btn btn-sm btn-dark" t-on-click="openUserForm">+ Add Portal User</button>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th class="border-top-0 ps-4">User Name</th>
                                <th class="border-top-0">Login Email</th>
                                <th class="border-top-0">System Role (RBAC)</th>
                                <th class="border-top-0 text-center">Status</th>
                                <th class="border-top-0 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <t t-foreach="this.state.users" t-as="user" t-key="user.id">
                                <tr>
                                    <td class="ps-4 fw-bold align-middle text-dark"><t t-esc="user.name"/></td>
                                    <td class="align-middle text-muted"><t t-esc="user.email"/></td>
                                    <td class="align-middle">
                                        <span class="badge bg-secondary p-2 fs-6 shadow-sm"><t t-esc="user.role"/></span>
                                    </td>
                                    <td class="align-middle text-center">
                                        <span class="text-success fw-bold">● <t t-esc="user.status"/></span>
                                    </td>
                                    <td class="align-middle text-end pe-4">
                                        <button class="btn btn-sm btn-outline-secondary"><i class="fa fa-pencil"></i></button>
                                    </td>
                                </tr>
                            </t>
                        </tbody>
                    </table>
                </div>
            </t>

            <t t-else="">
                <div class="p-4" style="background-color: #f8fafc;">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <button class="btn btn-sm btn-light border shadow-sm fw-bold text-dark" t-on-click="() => this.state.showUserForm = false">
                            ← Back to User List
                        </button>
                        <h5 class="fw-bold text-dark mb-0">Provision New User</h5>
                    </div>

                    <div class="card border-0 shadow-sm p-4">
                        <div class="row">
                            <div class="col-md-6 border-end pe-4">
                                <h6 class="text-muted text-uppercase small fw-bold mb-3">Identity Details</h6>
                                
                                <div class="mb-3">
                                    <label class="small fw-bold">Full Name</label>
                                    <input type="text" class="form-control" t-model="this.state.userForm.name" placeholder="e.g. Adeel Hassan"/>
                                </div>

                                <div class="mb-3">
                                    <label class="small fw-bold">Assign System Role</label>
                                    <select class="form-select" t-model="this.state.userForm.role">
                                        <option value="">-- Select Security Group --</option>
                                        <option value="Distributor (Super Admin)">Distributor (Super Admin)</option>
                                        <option value="Area Manager">Area Manager</option>
                                        <option value="KPO (Key Punch Operator)">KPO (Key Punch Operator)</option>
                                    </select>
                                    <small class="text-muted mt-1 d-block">This dictates what tabs and actions this user can see.</small>
                                </div>
                            </div>

                            <div class="col-md-6 ps-4">
                                <h6 class="text-muted text-uppercase small fw-bold mb-3">Authentication Credentials</h6>
                                
                                <div class="mb-3">
                                    <label class="small fw-bold">Login Email</label>
                                    <input type="email" class="form-control" t-model="this.state.userForm.email" placeholder="user@shahtaj.com" autocomplete="off"/>
                                </div>

                                <div class="mb-3">
                                    <label class="small fw-bold">Initial Password</label>
                                    <input type="password" class="form-control" t-model="this.state.userForm.password" placeholder="••••••••" autocomplete="new-password"/>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button class="btn btn-outline-secondary fw-bold" t-on-click="() => this.state.showUserForm = false">Cancel</button>
                            <button class="btn btn-dark fw-bold px-4" t-on-click="saveUser">Create User Account</button>
                        </div>
                    </div>
                </div>
            </t>
            
        </t>
    </div>
`;