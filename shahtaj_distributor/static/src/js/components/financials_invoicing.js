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

FinancialsInvoicing.template = "shahtaj_distributor.FinancialsInvoicing"