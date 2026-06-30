/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class FinancialsInvoicing extends Component {
    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        this.state = useState({
            // --- TAB NAVIGATION ---
            activeSubTab: 'invoices',
            invoiceSubTab: 'customer_invoices',
            
            // --- DETAIL VIEWS & MODALS ---
            selectedInvoice: null,
            selectedOrder: null, 
            showLimitForm: false,
            
            // Payment Modal State
            showPaymentModal: false,
            paymentForm: { journal_id: '', method: 'manual' },
            journals: [], 
            
            limitForm: { shopId: null, newLimit: '' },

            // --- FILTER & PAGINATION STATE ---
            itemsPerPage: 5,
            
            ordersFilters: { search: '' },
            ordersPage: 1,
            
            invoiceFilters: { search: '', status: '', minAmount: '', maxAmount: '', startDate: '', endDate: '' },
            invoicePage: 1,
            
            paymentsFilters: { search: '', method: '' },
            paymentsPage: 1,
            
            balancesFilters: { search: '' },
            balancesPage: 1,
            
            creditFilters: { search: '', status: '' },
            creditPage: 1,

            // --- DATA ARRAYS ---
            orders: [],
            invoices: [],
            
            // Static Mock Data for other tabs to maintain structural integrity
            payments: [
                { id: "PAY-2606-050", shop: "Al-Hafeez Supermart", date: "2026-06-20", amount: "120,500", method: "Bank Transfer", status: "Posted" },
                { id: "PAY-2606-051", shop: "Ali Super Store", date: "2026-06-22", amount: "12,500", method: "Cash", status: "Posted" },
                { id: "PAY-2606-052", shop: "Bismillah General Store", date: "2026-06-15", amount: "32,000", method: "Cheque", status: "Posted" },
                { id: "PAY-2606-053", shop: "Al-Hafeez Supermart", date: "2026-05-05", amount: "40,000", method: "Bank Transfer", status: "Posted" }
            ],
            balances: [
                { shop: "Bismillah General Store", billed: "250,000", paid: "205,000", outstanding: "45,000" },
                { shop: "Al-Hafeez Supermart", billed: "500,000", paid: "500,000", outstanding: "0" },
                { shop: "Madina Traders", billed: "150,000", paid: "64,500", outstanding: "85,500" },
                { shop: "Kashmir Mart", billed: "120,000", paid: "105,000", outstanding: "15,000" },
                { shop: "Zaman Wholesale", billed: "800,000", paid: "550,000", outstanding: "250,000" }
            ],
            credits: [
                { id: "SH-5042", shop: "Bismillah General Store", limit: 100000, utilized: 45000, status: "Healthy" },
                { id: "SH-5043", shop: "Al-Hafeez Supermart", limit: 250000, utilized: 245000, status: "Critical" },
                { id: "SH-5044", shop: "Madina Traders", limit: 50000, utilized: 67500, status: "Exceeded" },
                { id: "SH-5045", shop: "Kashmir Mart", limit: 150000, utilized: 20000, status: "Healthy" },
                { id: "SH-5046", shop: "Awais Kiryana", limit: 200000, utilized: 89000, status: "Healthy" }
            ]
        });

        onWillStart(async () => {
            await this.fetchRealData();
        });
    }

    // --- DATA FETCHING (ORM WIRING) ---
    async fetchRealData() {
        try {
            // Fetch Orders to Invoice
            const ordersData = await this.orm.searchRead(
                "sale.order",
                [["invoice_status", "=", "to invoice"]],
                ["name", "partner_id", "date_order", "amount_total", "state"]
            );
            this.state.orders = ordersData.map(o => ({
                id: o.id,
                display_name: o.name,
                shop: o.partner_id[1],
                date: o.date_order ? o.date_order.split(' ')[0] : 'N/A', 
                amount: o.amount_total.toLocaleString(),
                status: o.state,
                raw: o
            }));

            // Fetch Customer Invoices
            const invoicesData = await this.orm.searchRead(
                "account.move",
                [["move_type", "=", "out_invoice"]],
                ["name", "partner_id", "invoice_date", "invoice_date_due", "amount_total", "payment_state", "state"]
            );
            this.state.invoices = invoicesData.map(inv => ({
                id: inv.id,
                display_name: inv.name,
                shop: inv.partner_id[1],
                date: inv.invoice_date,
                dueDate: inv.invoice_date_due,
                amount: inv.amount_total.toLocaleString(),
                status: inv.payment_state === 'paid' ? 'Paid' : (inv.state === 'posted' ? 'Pending' : 'Draft'),
                raw: inv
            }));

            // Fetch Bank and Cash Journals for the Payment Modal
            const journalsData = await this.orm.searchRead(
                "account.journal",
                [["type", "in", ["bank", "cash"]]],
                ["name", "type"]
            );
            this.state.journals = journalsData;

        } catch (error) {
            console.error("ORM Fetch Error. Ensure you are running within Odoo environment.", error);
        }
    }

    // --- TAB NAVIGATION ---
    setSubTab(tabName) {
        this.state.activeSubTab = tabName;
        this.resetDetailViews();
    }

    setInvoiceSubTab(subTabName) {
        this.state.invoiceSubTab = subTabName;
        this.resetDetailViews();
    }

    resetDetailViews() {
        this.state.selectedInvoice = null;
        this.state.selectedOrder = null;
        this.state.showLimitForm = false;
        this.closePaymentModal();
    }

    // --- COMPUTED PROPERTIES ---
    
    // Orders
    get filteredOrders() {
        return this.state.orders.filter(ord => {
            const search = this.state.ordersFilters.search.toLowerCase();
            return ord.shop.toLowerCase().includes(search) || ord.display_name.toLowerCase().includes(search);
        });
    }
    get paginatedOrders() {
        const start = (this.state.ordersPage - 1) * this.state.itemsPerPage;
        return this.filteredOrders.slice(start, start + this.state.itemsPerPage);
    }
    get ordersTotalPages() { return Math.max(1, Math.ceil(this.filteredOrders.length / this.state.itemsPerPage)); }

    // Invoices
    get filteredInvoices() {
        return this.state.invoices.filter(inv => {
            const s = this.state.invoiceFilters;
            const matchSearch = inv.shop.toLowerCase().includes(s.search.toLowerCase()) || inv.display_name.toLowerCase().includes(s.search.toLowerCase());
            const matchStatus = s.status ? inv.status === s.status : true;
            
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
    get invoiceTotalPages() { return Math.max(1, Math.ceil(this.filteredInvoices.length / this.state.itemsPerPage)); }

    // Payments
    get filteredPayments() {
        return this.state.payments.filter(pay => {
            const s = this.state.paymentsFilters;
            const matchSearch = pay.shop.toLowerCase().includes(s.search.toLowerCase()) || pay.id.toLowerCase().includes(s.search.toLowerCase());
            const matchMethod = s.method ? pay.method === s.method : true;
            return matchSearch && matchMethod;
        });
    }
    get paginatedPayments() {
        const start = (this.state.paymentsPage - 1) * this.state.itemsPerPage;
        return this.filteredPayments.slice(start, start + this.state.itemsPerPage);
    }
    get paymentsTotalPages() { return Math.max(1, Math.ceil(this.filteredPayments.length / this.state.itemsPerPage)); }

    // Balances
    get filteredBalances() {
        return this.state.balances.filter(bal => {
            return bal.shop.toLowerCase().includes(this.state.balancesFilters.search.toLowerCase());
        });
    }
    get paginatedBalances() {
        const start = (this.state.balancesPage - 1) * this.state.itemsPerPage;
        return this.filteredBalances.slice(start, start + this.state.itemsPerPage);
    }
    get balancesTotalPages() { return Math.max(1, Math.ceil(this.filteredBalances.length / this.state.itemsPerPage)); }

    // Credits
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
    get creditTotalPages() { return Math.max(1, Math.ceil(this.filteredCredits.length / this.state.itemsPerPage)); }

    // --- ACTIONS & NAVIGATION ---
    
    changePage(type, direction) {
        if (type === 'order') this.state.ordersPage = Math.max(1, Math.min(this.state.ordersPage + direction, this.ordersTotalPages));
        else if (type === 'invoice') this.state.invoicePage = Math.max(1, Math.min(this.state.invoicePage + direction, this.invoiceTotalPages));
        else if (type === 'payment') this.state.paymentsPage = Math.max(1, Math.min(this.state.paymentsPage + direction, this.paymentsTotalPages));
        else if (type === 'balance') this.state.balancesPage = Math.max(1, Math.min(this.state.balancesPage + direction, this.balancesTotalPages));
        else if (type === 'credit') this.state.creditPage = Math.max(1, Math.min(this.state.creditPage + direction, this.creditTotalPages));
    }

    resetInvoiceFilters() {
        this.state.invoiceFilters = { search: '', status: '', minAmount: '', maxAmount: '', startDate: '', endDate: '' };
        this.state.invoicePage = 1;
    }

    // Detail Views
    viewOrder(order) { this.state.selectedOrder = order; }
    closeOrder() { this.state.selectedOrder = null; }
    viewInvoice(invoice) { this.state.selectedInvoice = invoice; }
    closeInvoice() { this.state.selectedInvoice = null; }

    // --- BACKEND LOGIC (RPC CALLS) ---

    async triggerCreateInvoice(orderId) {
        try {
            // Calling the custom Python method you wrote in sale_order.py
            const invoiceIds = await this.orm.call("sale.order", "action_create_invoice_portal", [[orderId]]);
            if (invoiceIds && invoiceIds.length > 0) {
                await this.fetchRealData();
                this.setInvoiceSubTab('customer_invoices');
            }
        } catch (error) {
            console.error("Error creating invoice via RPC", error);
        }
    }

    async actionConfirmInvoice(invoice) {
        try {
            await this.orm.call("account.move", "action_post", [[invoice.id]]);
            invoice.status = 'Pending'; 
        } catch (error) {
            console.error("Failed to confirm invoice", error);
        }
    }

    openPaymentModal() {
        this.state.showPaymentModal = true;
        if (this.state.journals.length > 0) {
            this.state.paymentForm.journal_id = this.state.journals[0].id;
        }
    }

    closePaymentModal() {
        this.state.showPaymentModal = false;
        this.state.paymentForm = { journal_id: '', method: 'manual' };
    }

    async processPayment() {
        try {
            // For production, this calls account.payment.register action_create_payments
            this.state.selectedInvoice.status = 'Paid';
            this.closePaymentModal();
        } catch (error) {
            console.error("Failed to process payment", error);
        }
    }

    async actionPrintInvoice(invoiceId) {
        this.action.doAction({
            type: 'ir.actions.report',
            report_type: 'qweb-pdf',
            report_name: 'account.report_invoice_with_payments',
            report_file: 'account.report_invoice_with_payments',
            context: { active_ids: [invoiceId] },
        });
    }

    // --- CREDIT LIMIT LOGIC ---
    
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