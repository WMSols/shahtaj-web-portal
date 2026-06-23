/** @odoo-module **/

import { Component, useState, xml } from "@odoo/owl";

export class FinancialsInvoicing extends Component {
    setup() {
        this.state = useState({
            activeSubTab: 'invoices',
            selectedInvoice: null,
            showInvoiceForm: false,
            showLimitForm: false,
            
            invoiceForm: { shop: '', amount: '', dueDate: '' },
            limitForm: { shopId: null, newLimit: '' },

            // --- FILTER & PAGINATION STATE ---
            itemsPerPage: 5,
            invoiceFilters: { search: '', status: '', minAmount: '', maxAmount: '', startDate: '', endDate: '' },
            invoicePage: 1,
            
            creditFilters: { search: '', status: '' },
            creditPage: 1,

            // Mock Data: Invoices (Expanded & Dates standardized to YYYY-MM-DD for accurate filtering)
            invoices: [
                { id: "INV-2606-001", shop: "Bismillah General Store", date: "2026-06-18", dueDate: "2026-06-25", amount: "45,000", status: "Pending", lines: [{ desc: "Shahtaj Premium 5L (4 Cartons)", price: "45,000" }] },
                { id: "INV-2606-002", shop: "Al-Hafeez Supermart", date: "2026-06-15", dueDate: "2026-06-22", amount: "120,500", status: "Paid", lines: [{ desc: "Shahtaj 1L Pouch (100 Pcs)", price: "95,000" }, { desc: "Shahtaj 5kg Tin (20 Tins)", price: "25,500" }] },
                { id: "INV-2605-089", shop: "Madina Traders", date: "2026-06-01", dueDate: "2026-06-08", amount: "67,500", status: "Overdue", lines: [{ desc: "Shahtaj Premium 5L (15 Cartons)", price: "67,500" }] },
                { id: "INV-2606-003", shop: "Kashmir Mart", date: "2026-06-19", dueDate: "2026-06-26", amount: "15,000", status: "Pending", lines: [{ desc: "Shahtaj 1L Pouch (15 Pcs)", price: "15,000" }] },
                { id: "INV-2606-004", shop: "Awais Kiryana", date: "2026-06-20", dueDate: "2026-06-27", amount: "89,000", status: "Pending", lines: [{ desc: "Mixed Cartons", price: "89,000" }] },
                { id: "INV-2605-045", shop: "Bismillah General Store", date: "2026-05-10", dueDate: "2026-05-17", amount: "32,000", status: "Paid", lines: [{ desc: "Previous Balance", price: "32,000" }] },
                { id: "INV-2605-099", shop: "Zaman Wholesale", date: "2026-06-05", dueDate: "2026-06-12", amount: "250,000", status: "Overdue", lines: [{ desc: "Bulk Order - Tins", price: "250,000" }] },
                { id: "INV-2606-005", shop: "Ali Super Store", date: "2026-06-21", dueDate: "2026-06-28", amount: "12,500", status: "Paid", lines: [{ desc: "Shahtaj Premium 5L (1 Carton)", price: "12,500" }] },
                { id: "INV-2606-006", shop: "Tariq Traders", date: "2026-06-21", dueDate: "2026-06-28", amount: "55,000", status: "Pending", lines: [{ desc: "Assorted Oils", price: "55,000" }] },
                { id: "INV-2606-007", shop: "City Center Mart", date: "2026-06-22", dueDate: "2026-06-29", amount: "110,000", status: "Pending", lines: [{ desc: "Shahtaj 10L Canisters", price: "110,000" }] },
                { id: "INV-2605-012", shop: "Al-Hafeez Supermart", date: "2026-05-02", dueDate: "2026-05-09", amount: "40,000", status: "Paid", lines: [{ desc: "May Order", price: "40,000" }] },
                { id: "INV-2606-008", shop: "Madina Traders", date: "2026-06-22", dueDate: "2026-06-29", amount: "18,000", status: "Pending", lines: [{ desc: "Restock", price: "18,000" }] }
            ],

            // Mock Data: Shop Credit Limits (Expanded)
            credits: [
                { id: "SH-5042", shop: "Bismillah General Store", limit: 100000, utilized: 45000, status: "Healthy" },
                { id: "SH-5043", shop: "Al-Hafeez Supermart", limit: 250000, utilized: 245000, status: "Critical" },
                { id: "SH-5044", shop: "Madina Traders", limit: 50000, utilized: 67500, status: "Exceeded" },
                { id: "SH-5045", shop: "Kashmir Mart", limit: 150000, utilized: 20000, status: "Healthy" },
                { id: "SH-5046", shop: "Awais Kiryana", limit: 200000, utilized: 89000, status: "Healthy" },
                { id: "SH-5047", shop: "Zaman Wholesale", limit: 500000, utilized: 480000, status: "Critical" },
                { id: "SH-5048", shop: "Ali Super Store", limit: 75000, utilized: 12000, status: "Healthy" },
                { id: "SH-5049", shop: "Tariq Traders", limit: 100000, utilized: 55000, status: "Healthy" },
                { id: "SH-5050", shop: "City Center Mart", limit: 300000, utilized: 110000, status: "Healthy" },
                { id: "SH-5051", shop: "Mianwali Cash & Carry", limit: 100000, utilized: 115000, status: "Exceeded" }
            ]
        });
    }

    setSubTab(tabName) {
        this.state.activeSubTab = tabName;
        this.state.selectedInvoice = null;
        this.state.showInvoiceForm = false;
        this.state.showLimitForm = false;
    }

    // --- INVOICE COMPUTED PROPERTIES ---
    get filteredInvoices() {
        return this.state.invoices.filter(inv => {
            const s = this.state.invoiceFilters;
            const matchSearch = inv.shop.toLowerCase().includes(s.search.toLowerCase()) || inv.id.toLowerCase().includes(s.search.toLowerCase());
            const matchStatus = s.status ? inv.status === s.status : true;
            
            // Clean amount string to number for comparison
            const amt = parseFloat(inv.amount.replace(/,/g, ''));
            const matchMin = s.minAmount ? amt >= parseFloat(s.minAmount) : true;
            const matchMax = s.maxAmount ? amt <= parseFloat(s.maxAmount) : true;

            const matchStart = s.startDate ? new Date(inv.date) >= new Date(s.startDate) : true;
            const matchEnd = s.endDate ? new Date(inv.date) <= new Date(s.endDate) : true;

            return matchSearch && matchStatus && matchMin && matchMax && matchStart && matchEnd;
        });
    }

    get paginatedInvoices() {
        const start = (this.state.invoicePage - 1) * this.state.itemsPerPage;
        return this.filteredInvoices.slice(start, start + this.state.itemsPerPage);
    }

    get invoiceTotalPages() {
        return Math.max(1, Math.ceil(this.filteredInvoices.length / this.state.itemsPerPage));
    }

    // --- CREDIT COMPUTED PROPERTIES ---
    get filteredCredits() {
        return this.state.credits.filter(c => {
            const matchSearch = c.shop.toLowerCase().includes(this.state.creditFilters.search.toLowerCase()) || c.id.toLowerCase().includes(this.state.creditFilters.search.toLowerCase());
            const matchStatus = this.state.creditFilters.status ? c.status === this.state.creditFilters.status : true;
            return matchSearch && matchStatus;
        });
    }

    get paginatedCredits() {
        const start = (this.state.creditPage - 1) * this.state.itemsPerPage;
        return this.filteredCredits.slice(start, start + this.state.itemsPerPage);
    }

    get creditTotalPages() {
        return Math.max(1, Math.ceil(this.filteredCredits.length / this.state.itemsPerPage));
    }

    // --- ACTIONS ---
    changePage(type, direction) {
        if (type === 'invoice') {
            const newPage = this.state.invoicePage + direction;
            if (newPage >= 1 && newPage <= this.invoiceTotalPages) this.state.invoicePage = newPage;
        } else {
            const newPage = this.state.creditPage + direction;
            if (newPage >= 1 && newPage <= this.creditTotalPages) this.state.creditPage = newPage;
        }
    }

    resetInvoiceFilters() {
        this.state.invoiceFilters = { search: '', status: '', minAmount: '', maxAmount: '', startDate: '', endDate: '' };
        this.state.invoicePage = 1;
    }

    // ... keeping existing viewInvoice, closeInvoice, generateInvoice, openLimitForm, updateCreditLimit methods
    viewInvoice(invoice) { this.state.selectedInvoice = invoice; }
    closeInvoice() { this.state.selectedInvoice = null; }

    generateInvoice() {
        this.state.invoices.unshift({
            id: `INV-2606-00${this.state.invoices.length + 1}`,
            shop: this.state.invoiceForm.shop || "Unknown Shop",
            date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
            dueDate: this.state.invoiceForm.dueDate || "2026-06-26",
            amount: this.state.invoiceForm.amount || "0",
            status: "Pending",
            lines: [{ desc: "Consolidated pending orders", price: this.state.invoiceForm.amount || "0" }]
        });
        this.state.showInvoiceForm = false;
        this.state.invoiceForm = { shop: '', amount: '', dueDate: '' };
    }

    openLimitForm(creditRecord) {
        this.state.limitForm.shopId = creditRecord.id;
        this.state.limitForm.newLimit = creditRecord.limit;
        this.state.showLimitForm = true;
    }

    updateCreditLimit() {
        const record = this.state.credits.find(c => c.id === this.state.limitForm.shopId);
        if (record) {
            record.limit = parseInt(this.state.limitForm.newLimit);
            if (record.utilized > record.limit) record.status = "Exceeded";
            else if (record.utilized > (record.limit * 0.85)) record.status = "Critical";
            else record.status = "Healthy";
        }
        this.state.showLimitForm = false;
    }
}

FinancialsInvoicing.template = xml`
    <div class="card border-0 shadow-sm bg-white">
        
        <div class="p-4 border-bottom bg-light d-flex justify-content-between align-items-center rounded-top">
            <div>
                <h2 class="h4 fw-bold text-dark mb-0">Financials &amp; Invoicing</h2>
                <small class="text-muted">Accounting controls and credit risk management.</small>
            </div>
            <div>
                <span class="badge bg-success px-3 py-2 text-white"><i class="fa fa-money me-1"></i> Finance Engine Active</span>
            </div>
        </div>

        <div class="p-3 border-bottom">
            <ul class="nav nav-pills nav-fill">
                <li class="nav-item me-2">
                    <button t-on-click="() => this.setSubTab('invoices')" 
                            t-attf-class="nav-link fw-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'invoices' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        🧾 Invoice Management
                    </button>
                </li>
                <li class="nav-item">
                    <button t-on-click="() => this.setSubTab('credit')" 
                            t-attf-class="nav-link fw-bold rounded-pill border-0 px-4 py-2 w-100 transition-all #{this.state.activeSubTab === 'credit' ? 'active bg-dark text-white shadow-sm' : 'text-muted bg-white'}">
                        💳 Credit Risk Control
                    </button>
                </li>
            </ul>
        </div>

        <t t-if="this.state.activeSubTab === 'invoices'">
            <t t-if="!this.state.selectedInvoice">
                
                <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h6 class="fw-bold mb-0">Consolidated Invoices</h6>
                    <button class="btn btn-sm btn-dark" t-on-click="() => this.state.showInvoiceForm = true">+ Generate Invoice</button>
                </div>

                <div class="p-3 bg-light border-bottom">
                    <div class="row g-2">
                        <div class="col-md-3">
                            <input type="text" class="form-control form-control-sm" placeholder="Search Shop or ID..." 
                                   t-model="this.state.invoiceFilters.search" t-on-input="() => this.state.invoicePage = 1"/>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select form-select-sm" t-model="this.state.invoiceFilters.status" t-on-change="() => this.state.invoicePage = 1">
                                <option value="">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                        <div class="col-md-3 d-flex gap-2">
                            <input type="number" class="form-control form-control-sm" placeholder="Min Amount" t-model="this.state.invoiceFilters.minAmount" t-on-input="() => this.state.invoicePage = 1"/>
                            <input type="number" class="form-control form-control-sm" placeholder="Max Amount" t-model="this.state.invoiceFilters.maxAmount" t-on-input="() => this.state.invoicePage = 1"/>
                        </div>
                        <div class="col-md-3 d-flex gap-2">
                            <input type="date" class="form-control form-control-sm" t-model="this.state.invoiceFilters.startDate" t-on-change="() => this.state.invoicePage = 1"/>
                            <input type="date" class="form-control form-control-sm" t-model="this.state.invoiceFilters.endDate" t-on-change="() => this.state.invoicePage = 1"/>
                        </div>
                        <div class="col-md-1">
                            <button class="btn btn-sm btn-outline-secondary w-100" t-on-click="resetInvoiceFilters">Clear</button>
                        </div>
                    </div>
                </div>

                <t t-if="this.state.showInvoiceForm">
                    <div class="p-4 bg-light border-bottom">
                        <div class="row">
                            <div class="col-md-4">
                                <label class="small fw-bold">Select Shop</label>
                                <select class="form-select" t-model="this.state.invoiceForm.shop">
                                    <option value="">-- Choose Shop --</option>
                                    <option value="Bismillah General Store">Bismillah General Store</option>
                                    <option value="Kashmir Mart">Kashmir Mart</option>
                                    <option value="Al-Hafeez Supermart">Al-Hafeez Supermart</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="small fw-bold">Total Amount (Rs.)</label>
                                <input type="text" class="form-control" t-model="this.state.invoiceForm.amount" placeholder="e.g. 50,000"/>
                            </div>
                            <div class="col-md-3">
                                <label class="small fw-bold">Due Date</label>
                                <input type="date" class="form-control" t-model="this.state.invoiceForm.dueDate"/>
                            </div>
                            <div class="col-md-2 d-flex align-items-end pb-1 gap-2">
                                <button class="btn btn-outline-secondary w-50" t-on-click="() => this.state.showInvoiceForm = false">Cancel</button>
                                <button class="btn btn-success w-50" t-on-click="generateInvoice">Create</button>
                            </div>
                        </div>
                    </div>
                </t>

                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th class="border-top-0 ps-4">Invoice #</th>
                                <th class="border-top-0">Billed To</th>
                                <th class="border-top-0">Timeline</th>
                                <th class="border-top-0 text-end">Amount</th>
                                <th class="border-top-0 text-center">Status</th>
                                <th class="border-top-0 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <t t-if="this.paginatedInvoices.length === 0">
                                <tr><td colspan="6" class="text-center py-4 text-muted">No invoices found matching criteria.</td></tr>
                            </t>
                            <t t-foreach="this.paginatedInvoices" t-as="inv" t-key="inv.id">
                                <tr>
                                    <td class="ps-4 fw-bold align-middle text-primary"><t t-esc="inv.id"/></td>
                                    <td class="align-middle fw-bold text-dark"><t t-esc="inv.shop"/></td>
                                    <td class="align-middle">
                                        <div class="small text-muted">Issued: <t t-esc="inv.date"/></div>
                                        <div class="small fw-bold" t-attf-class="#{inv.status === 'Overdue' ? 'text-danger' : ''}">Due: <t t-esc="inv.dueDate"/></div>
                                    </td>
                                    <td class="align-middle text-end fw-bold">Rs. <t t-esc="inv.amount"/></td>
                                    <td class="align-middle text-center">
                                        <span t-attf-class="badge #{inv.status === 'Paid' ? 'bg-success' : inv.status === 'Overdue' ? 'bg-danger' : 'bg-warning text-dark'} px-2 py-1">
                                            <t t-esc="inv.status"/>
                                        </span>
                                    </td>
                                    <td class="align-middle text-end pe-4">
                                        <button class="btn btn-sm btn-outline-dark fw-bold" t-on-click="() => this.viewInvoice(inv)">View →</button>
                                    </td>
                                </tr>
                            </t>
                        </tbody>
                    </table>
                </div>

                <div class="p-3 border-top d-flex justify-content-between align-items-center bg-light">
                    <small class="text-muted fw-bold">
                        Showing <t t-esc="this.filteredInvoices.length === 0 ? 0 : ((this.state.invoicePage - 1) * this.state.itemsPerPage) + 1"/> to 
                        <t t-esc="Math.min(this.state.invoicePage * this.state.itemsPerPage, this.filteredInvoices.length)"/> of <t t-esc="this.filteredInvoices.length"/> entries
                    </small>
                    <div class="btn-group shadow-sm">
                        <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('invoice', -1)" t-att-disabled="this.state.invoicePage === 1">Previous</button>
                        <button class="btn btn-sm btn-light border px-3 fw-bold disabled"><t t-esc="this.state.invoicePage"/> / <t t-esc="this.invoiceTotalPages"/></button>
                        <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('invoice', 1)" t-att-disabled="this.state.invoicePage === this.invoiceTotalPages">Next</button>
                    </div>
                </div>

            </t>
            
            <t t-else="">
                <div class="p-4" style="background-color: #f8fafc;">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <button class="btn btn-sm btn-light border shadow-sm fw-bold text-dark" t-on-click="closeInvoice">
                            ← Back to Ledger
                        </button>
                        <span class="h4 fw-bold text-dark mb-0">TAX INVOICE</span>
                    </div>

                    <div class="card border-0 shadow-sm p-4 mb-4">
                        <div class="row">
                            <div class="col-md-6 border-end">
                                <h6 class="text-muted text-uppercase small fw-bold mb-3">Billed To</h6>
                                <h5 class="fw-bold text-dark mb-1"><t t-esc="this.state.selectedInvoice.shop"/></h5>
                                <p class="text-muted mb-0 small">Payment Status: 
                                    <strong t-attf-class="#{this.state.selectedInvoice.status === 'Paid' ? 'text-success' : 'text-danger'}"><t t-esc="this.state.selectedInvoice.status"/></strong>
                                </p>
                            </div>
                            <div class="col-md-6 ps-4">
                                <h6 class="text-muted text-uppercase small fw-bold mb-3">Invoice Details</h6>
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="text-muted small">Invoice Number:</span>
                                    <span class="fw-bold text-dark"><t t-esc="this.state.selectedInvoice.id"/></span>
                                </div>
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="text-muted small">Issue Date:</span>
                                    <span class="fw-bold text-dark"><t t-esc="this.state.selectedInvoice.date"/></span>
                                </div>
                                <div class="d-flex justify-content-between text-danger">
                                    <span class="small fw-bold">Due Date:</span>
                                    <span class="fw-bold"><t t-esc="this.state.selectedInvoice.dueDate"/></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm overflow-hidden">
                        <table class="table table-striped mb-0">
                            <thead class="bg-dark text-white small text-uppercase fw-bold">
                                <tr>
                                    <th class="ps-4">Description</th>
                                    <th class="text-end pe-4">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <t t-foreach="this.state.selectedInvoice.lines" t-as="line" t-key="line.desc">
                                    <tr>
                                        <td class="ps-4 text-dark"><t t-esc="line.desc"/></td>
                                        <td class="text-end pe-4 fw-bold">Rs. <t t-esc="line.price"/></td>
                                    </tr>
                                </t>
                            </tbody>
                        </table>
                        <div class="bg-light p-3 text-end border-top">
                            <span class="text-dark fw-bold text-uppercase me-3">Grand Total:</span>
                            <h4 class="fw-bold text-success d-inline mb-0">Rs. <t t-esc="this.state.selectedInvoice.amount"/></h4>
                        </div>
                    </div>
                </div>
            </t>
        </t>

        <t t-if="this.state.activeSubTab === 'credit'">
            <div class="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                <h6 class="fw-bold mb-0">Shop Credit Limit Monitor</h6>
            </div>

            <div class="p-3 bg-light border-bottom">
                <div class="row g-2">
                    <div class="col-md-5">
                        <input type="text" class="form-control form-control-sm" placeholder="Search Shop Name or ID..." 
                               t-model="this.state.creditFilters.search" t-on-input="() => this.state.creditPage = 1"/>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select form-select-sm" t-model="this.state.creditFilters.status" t-on-change="() => this.state.creditPage = 1">
                            <option value="">All Risk Statuses</option>
                            <option value="Healthy">Healthy</option>
                            <option value="Critical">Critical</option>
                            <option value="Exceeded">Exceeded</option>
                        </select>
                    </div>
                </div>
            </div>

            <t t-if="this.state.showLimitForm">
                <div class="p-4 bg-light border-bottom d-flex align-items-end">
                    <div class="me-3 flex-grow-1">
                        <label class="small fw-bold">Adjust Limit for Selected Shop</label>
                        <input type="number" class="form-control" t-model="this.state.limitForm.newLimit"/>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary" t-on-click="() => this.state.showLimitForm = false">Cancel</button>
                        <button class="btn btn-primary" t-on-click="updateCreditLimit">Apply New Limit</button>
                    </div>
                </div>
            </t>

            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="bg-light text-uppercase small fw-bold text-muted">
                        <tr>
                            <th class="border-top-0 ps-4">Shop Details</th>
                            <th class="border-top-0 w-25">Credit Utilization</th>
                            <th class="border-top-0 text-end">Available Credit</th>
                            <th class="border-top-0 text-center">Risk Status</th>
                            <th class="border-top-0 text-end pe-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <t t-if="this.paginatedCredits.length === 0">
                            <tr><td colspan="5" class="text-center py-4 text-muted">No credit records found.</td></tr>
                        </t>
                        <t t-foreach="this.paginatedCredits" t-as="credit" t-key="credit.id">
                            <tr>
                                <td class="ps-4 align-middle">
                                    <div class="text-dark fw-bold"><t t-esc="credit.shop"/></div>
                                    <small class="text-muted">ID: <t t-esc="credit.id"/></small>
                                </td>
                                <td class="align-middle">
                                    <div class="d-flex justify-content-between mb-1">
                                        <small class="fw-bold text-dark">Rs. <t t-esc="credit.utilized"/></small>
                                        <small class="text-muted">Limit: Rs. <t t-esc="credit.limit"/></small>
                                    </div>
                                    <div class="progress" style="height: 8px;">
                                        <div t-attf-class="progress-bar #{credit.status === 'Healthy' ? 'bg-success' : credit.status === 'Critical' ? 'bg-warning' : 'bg-danger'}" 
                                             role="progressbar" 
                                             t-attf-style="width: #{(credit.utilized / credit.limit) * 100}%; max-width: 100%;"></div>
                                    </div>
                                </td>
                                <td class="align-middle text-end fw-bold">
                                    <t t-if="credit.limit - credit.utilized &lt; 0">
                                        <span class="text-danger">Rs. 0</span>
                                    </t>
                                    <t t-else="">
                                        Rs. <t t-esc="credit.limit - credit.utilized"/>
                                    </t>
                                </td>
                                <td class="align-middle text-center">
                                    <span t-attf-class="badge #{credit.status === 'Healthy' ? 'bg-success' : credit.status === 'Critical' ? 'bg-warning text-dark' : 'bg-danger'} px-2 py-1">
                                        <t t-esc="credit.status"/>
                                    </span>
                                </td>
                                <td class="align-middle text-end pe-4">
                                    <button class="btn btn-sm btn-outline-secondary" t-on-click="() => this.openLimitForm(credit)">
                                        <i class="fa fa-pencil"></i> Edit Limit
                                    </button>
                                </td>
                            </tr>
                        </t>
                    </tbody>
                </table>
            </div>

            <div class="p-3 border-top d-flex justify-content-between align-items-center bg-light">
                <small class="text-muted fw-bold">
                    Showing <t t-esc="this.filteredCredits.length === 0 ? 0 : ((this.state.creditPage - 1) * this.state.itemsPerPage) + 1"/> to 
                    <t t-esc="Math.min(this.state.creditPage * this.state.itemsPerPage, this.filteredCredits.length)"/> of <t t-esc="this.filteredCredits.length"/> entries
                </small>
                <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('credit', -1)" t-att-disabled="this.state.creditPage === 1">Previous</button>
                    <button class="btn btn-sm btn-light border px-3 fw-bold disabled"><t t-esc="this.state.creditPage"/> / <t t-esc="this.creditTotalPages"/></button>
                    <button class="btn btn-sm btn-white border" t-on-click="() => this.changePage('credit', 1)" t-att-disabled="this.state.creditPage === this.creditTotalPages">Next</button>
                </div>
            </div>

        </t>
    </div>
`;