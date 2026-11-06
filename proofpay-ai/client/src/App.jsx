
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  ChartNoAxesCombined,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Clock3,
  CircleAlert,
  MoreHorizontal,
  Download,
  ChevronDown,
  Sparkles,
  Command,
  Menu,
} from "lucide-react";
import { useEffect, useState } from "react";
import Lenis from "lenis";
import "./App.css";

const initialInvoices = [
  { id: "INV-2026-041", customer: "Sharma Enterprises", initials: "SE", amount: 85000, due: "20 Oct 2026", days: "16 days overdue", status: "Overdue" },
  { id: "INV-2026-039", customer: "Patel Industries", initials: "PI", amount: 120000, due: "28 Oct 2026", days: "8 days overdue", status: "Overdue" },
  { id: "INV-2026-044", customer: "Verma Traders", initials: "VT", amount: 45000, due: "02 Nov 2026", days: "3 days overdue", status: "Overdue" },
  { id: "INV-2026-046", customer: "Gupta Manufacturing", initials: "GM", amount: 75000, due: "12 Nov 2026", days: "Due in 7 days", status: "Pending" },
];

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Invoices", icon: FileText },
  { label: "Documents", icon: FolderOpen },
  { label: "Analytics", icon: ChartNoAxesCombined },
];

function App() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [newInvoice, setNewInvoice] = useState({
  customer: "",
  amount: "",
  dueDate: "",
});

  useEffect(() => {
  const lenis = new Lenis({
    autoRaf: true,
    duration: 1.1,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.2,
  });

  return () => {
    lenis.destroy();
  };
}, []);

useEffect(() => {
  const loadInvoices = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/invoices"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load invoices.");
      }

      const formattedInvoices = data.map((invoice) => {
        const [year, month, day] = invoice.due_date
          .split("-")
          .map(Number);

        const date = new Date(year, month - 1, day);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const difference = Math.round(
          (date - today) / 86400000
        );

        const days =
          difference < 0
            ? `${Math.abs(difference)} days overdue`
            : difference === 0
            ? "Due today"
            : `Due in ${difference} days`;

        return {
  id: invoice.invoice_number,
  customer: invoice.customer,
  initials: invoice.initials,
  amount: Number(invoice.amount),
  amountPaid: Number(invoice.amount_paid || 0),
  outstanding:
    Number(invoice.amount) - Number(invoice.amount_paid || 0),
  due: date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  days,
  status:
    Number(invoice.amount_paid || 0) >= Number(invoice.amount)
      ? "Paid"
      : difference < 0
      ? "Overdue"
      : "Pending",
};
      });

      setInvoices(formattedInvoices);

    } catch (error) {
      console.error("Failed to load invoices:", error);
    }
  };

  loadInvoices();

window.addEventListener("focus", loadInvoices);

return () => {
  window.removeEventListener("focus", loadInvoices);
};
}, []);

  const filteredInvoices = invoices.filter((invoice) =>
    `${invoice.id} ${invoice.customer}`.toLowerCase().includes(search.toLowerCase())
  );

  // DASHBOARD CALCULATIONS

const totalOutstanding = invoices.reduce(
  (total, invoice) => total + invoice.outstanding,
  0
);

const totalCollected = invoices.reduce(
  (total, invoice) => total + invoice.amountPaid,
  0
);

const totalInvoiceValue = invoices.reduce(
  (total, invoice) => total + invoice.amount,
  0
);

const collectionRate =
  totalInvoiceValue > 0
    ? (totalCollected / totalInvoiceValue) * 100
    : 0;

const overdueInvoices = invoices.filter(
  (invoice) => invoice.status === "Overdue"
);

const overdueAmount = overdueInvoices.reduce(
  (total, invoice) => total + invoice.outstanding,
  0
);

const totalInvoiceCount = invoices.length;

const overdueInvoiceCount = overdueInvoices.length;

const activeInvoiceCount = invoices.filter(
  (invoice) => invoice.status !== "Paid"
).length;

const partiallyPaidInvoiceCount = invoices.filter(
  (invoice) => invoice.amountPaid > 0 && invoice.outstanding > 0
).length;

const unpaidInvoiceCount = invoices.filter(
  (invoice) => invoice.amountPaid === 0 && invoice.outstanding > 0
).length;
const getOverdueDays = (due) => {
  const [day, monthText, year] = due.split(" ");

  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3,
    May: 4, Jun: 5, Jul: 6, Aug: 7,
    Sep: 8, Sept: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const dueDate = new Date(
    Number(year),
    months[monthText],
    Number(day)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((today - dueDate) / 86400000)
  );
};

const ageingBuckets = [
  { label: "1–15 days", min: 1, max: 15, amount: 0 },
  { label: "16–30 days", min: 16, max: 30, amount: 0 },
  { label: "31–60 days", min: 31, max: 60, amount: 0 },
  { label: "60+ days", min: 61, max: Infinity, amount: 0 },
];

overdueInvoices.forEach((invoice) => {
  const days = getOverdueDays(invoice.due);

  const bucket = ageingBuckets.find(
    (item) => days >= item.min && days <= item.max
  );

  if (bucket) {
    bucket.amount += invoice.outstanding;
  }
});

 
const handleAddInvoice = async (e) => {
  e.preventDefault();

  const customer = newInvoice.customer.trim();
  const amount = Number(newInvoice.amount);
  const dueDate = newInvoice.dueDate;

  if (!customer || !Number.isFinite(amount) || amount <= 0 || !dueDate) {
    alert("Please enter valid invoice details.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer,
        amount,
        dueDate,
      }),
    });

    const savedInvoice = await response.json();

    if (!response.ok) {
      throw new Error(savedInvoice.error || "Failed to save invoice.");
    }

    const [year, month, day] = savedInvoice.due_date.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const difference = Math.round((date - today) / 86400000);

    const days =
      difference < 0
        ? `${Math.abs(difference)} days overdue`
        : difference === 0
        ? "Due today"
        : `Due in ${difference} days`;

    const invoice = {
      id: savedInvoice.invoice_number,
      customer: savedInvoice.customer,
      initials: savedInvoice.initials,
      amount: Number(savedInvoice.amount),
      amountPaid: 0,
      outstanding: Number(savedInvoice.amount),
      due: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      days,
      status: savedInvoice.status,
    };

    setInvoices((previous) => [invoice, ...previous]);

    setNewInvoice({
      customer: "",
      amount: "",
      dueDate: "",
    });

    setShowAddInvoice(false);
  } catch (error) {
    console.error("Invoice creation failed:", error);
    alert(error.message);
  }
};

const handleRecordPayment = async (e) => {
  e.preventDefault();

  if (!selectedInvoice) return;

  const amountPaid = Number(paymentAmount);

  if (
    !Number.isFinite(amountPaid) ||
    amountPaid < 0 ||
    amountPaid > selectedInvoice.amount
  ) {
    alert("Enter a valid total payment amount.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/invoices/${selectedInvoice.id}/payment`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amountPaid }),
      }
    );

    const updatedInvoice = await response.json();

    if (!response.ok) {
      throw new Error(updatedInvoice.error || "Payment update failed.");
    }

    const outstanding =
      Number(updatedInvoice.amount) - Number(updatedInvoice.amount_paid);

    const [year, month, day] = updatedInvoice.due_date
      .split("-")
      .map(Number);

    const dueDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const difference = Math.round((dueDate - today) / 86400000);

    const status =
      outstanding === 0
        ? "Paid"
        : difference < 0
        ? "Overdue"
        : "Pending";

    setInvoices((previous) =>
      previous.map((invoice) =>
        invoice.id === selectedInvoice.id
          ? {
              ...invoice,
              amountPaid: Number(updatedInvoice.amount_paid),
              outstanding,
              status,
              days:
                difference < 0
                  ? `${Math.abs(difference)} days overdue`
                  : difference === 0
                  ? "Due today"
                  : `Due in ${difference} days`,
            }
          : invoice
      )
    );

    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentAmount("");
  } catch (error) {
    console.error("Payment update failed:", error);
    alert(error.message);
  }
};


return (
  <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Command size={20} strokeWidth={2.4} /></div>
          <span>proofpay<span className="brand-ai">.ai</span></span>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switch">
          <div className="workspace-avatar">A</div>
          <div className="workspace-copy">
            <strong>Acme Industries</strong>
            <span>Free workspace</span>
          </div>
          <ChevronDown size={15} />
        </div>

        <div className="nav-label">MENU</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-link ${activeNav === label ? "active" : ""}`}
              onClick={() => {
                setActiveNav(label);
                setMenuOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Invoices" && (
  <span className="nav-count">{invoices.length}</span>
)}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-card">
            <div className="ai-card-icon"><Sparkles size={16} /></div>
            <strong>Receivables intelligence</strong>
            <p>Find payment risks before they become problems.</p>
            <span>Powered by ProofPay AI <ArrowUpRight size={13} /></span>
          </div>
          <button className="nav-link settings-link" onClick={() => setActiveNav("Settings")}>
            <Settings size={18} /><span>Settings</span>
          </button>
          <div className="profile">
            <div className="profile-avatar">JD</div>
            <div className="profile-copy">
              <strong>John Doe</strong>
              <span>Administrator</span>
            </div>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
            <span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{activeNav}</strong>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="top-avatar">JD</div>
          </div>
        </header>

  <div className="page-content">

  {activeNav === "Overview" && (
    <section className="welcome-row">
      <div>
        <div className="eyebrow">
          <span className="live-dot" /> FINANCIAL OVERVIEW
        </div>

        <h1>
          Good evening<span className="heading-period">.</span>
        </h1>

        <p className="page-subtitle">
          Here's what's happening with your receivables.
        </p>
      </div>

      <div className="welcome-actions">
        <button className="secondary-button">
          <Download size={16} /> Export report
        </button>

        <button
          className="primary-button"
          onClick={() => setShowAddInvoice(true)}
        >
          <Plus size={17} /> Add invoice
        </button>
      </div>
    </section>
  )}

  {activeNav === "Overview" && (
    <>
      {/* Keep ALL your existing Overview dashboard content here */}    
<section className="metrics-grid">
  <article className="metric-card metric-featured">
    <div className="metric-top">
      <span>Total outstanding</span>
      <span className="metric-icon">
        <IndianRupee size={17} />
      </span>
    </div>

    <div className="metric-value">
      {currency(totalOutstanding)}
    </div>

    <div className="metric-bottom">
      <span className="metric-muted">
        {totalInvoiceCount}
      </span>
      <span>total invoices</span>
    </div>

    <div className="metric-decoration" />
  </article>

  <article className="metric-card">
    <div className="metric-top">
      <span>Overdue amount</span>
      <span className="metric-icon danger-icon">
        <CircleAlert size={17} />
      </span>
    </div>

    <div className="metric-value">
      {currency(overdueAmount)}
    </div>

    <div className="metric-bottom">
      <span className="metric-muted">
        {overdueAmount === 0 ? "On track" : overdueInvoiceCount}
      </span>
      <span>
        {overdueAmount === 0 ? "No overdue balance" : "overdue invoices"}
      </span>
    </div>
  </article>

  <article className="metric-card">
    <div className="metric-top">
      <span>Active invoices</span>
      <span className="metric-icon">
        <FileText size={17} />
      </span>
    </div>

    <div className="metric-value">
      {activeInvoiceCount}
    </div>

    <div className="metric-bottom">
      <span className="metric-muted">
        {partiallyPaidInvoiceCount} partial
      </span>
      <span>
        · {unpaidInvoiceCount} unpaid
      </span>
    </div>
  </article>

  <article className="metric-card">
    <div className="metric-top">
      <span>Overdue invoices</span>
      <span className="metric-icon danger-icon">
        <CircleAlert size={17} />
      </span>
    </div>

    <div className="metric-value">
      {overdueInvoiceCount}
    </div>

    <div className="metric-bottom">
      <span className="metric-muted">
        {totalInvoiceCount === 0
          ? "0.0%"
          : `${((overdueInvoiceCount / totalInvoiceCount) * 100).toFixed(1)}%`}
      </span>
      <span>of total invoices</span>
    </div>
  </article>
</section>

          <section className="panel invoices-panel">
            <div className="panel-header invoice-header">
              <div>
                <div className="panel-kicker">YOUR RECEIVABLES</div>
                <h2>Invoices needing attention</h2>
                <p>Prioritise follow-ups and keep cash flowing.</p>
              </div>
              <button className="view-all-button" onClick={() => setActiveNav("Invoices")}>View all invoices <ArrowUpRight size={15} /></button>
            </div>
            <div className="table-scroll">
              <table className="invoice-table">
                <thead><tr>
  <th>INVOICE</th>
  <th>CUSTOMER</th>
  <th>INVOICE AMOUNT</th>
  <th>PAID</th>
  <th>OUTSTANDING</th>
  <th>DUE DATE</th>
  <th>STATUS</th>
  <th />
</tr></thead>
                <tbody>
  {filteredInvoices.map((invoice) => (
    <tr key={invoice.id}>
      <td className="invoice-id">{invoice.id}</td>

      <td>
        <div className="customer-cell">
          <span className="customer-avatar">
            {invoice.initials}
          </span>
          <strong>{invoice.customer}</strong>
        </div>
      </td>

      <td className="amount-cell">
        {currency(invoice.amount)}
      </td>

      <td className="amount-cell">
        {currency(invoice.amountPaid)}
      </td>

      <td className="amount-cell outstanding-cell">
        {currency(invoice.outstanding)}
      </td>

      <td>
        <div className="due-cell">
          {invoice.due}
          <span>{invoice.days}</span>
        </div>
      </td>

      <td>
        <span className={`status-pill ${invoice.status.toLowerCase()}`}>
          <i />
          {invoice.status}
        </span>
      </td>

      <td>
        <button
          type="button"
          className="record-payment-button"
          disabled={invoice.status === "Paid"}
          onClick={() => {
            setSelectedInvoice(invoice);
            setPaymentAmount(String(invoice.amountPaid));
            setShowPaymentModal(true);
          }}
        >
          Record payment
        </button>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          </section>

          <footer className="page-footer">
            <span>© 2026 ProofPay AI</span>
            <span><i className="footer-status" /> All systems operational</span>
            <span>Built for better cash flow.</span>
          </footer>
            </>
)}
{activeNav === "Invoices" && (
  <section className="panel invoices-panel">
    <div className="panel-header invoice-header">
      <div>
        <div className="panel-kicker">INVOICE MANAGEMENT</div>
        <h2>All invoices</h2>
        <p>Manage invoices, track collections and record payments.</p>
      </div>

      <button
        className="primary-button"
        onClick={() => setShowAddInvoice(true)}
      >
        + Add invoice
      </button>
    </div>

    <div className="table-scroll">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>INVOICE</th>
            <th>CUSTOMER</th>
            <th>INVOICE AMOUNT</th>
            <th>PAID</th>
            <th>OUTSTANDING</th>
            <th>DUE DATE</th>
            <th>STATUS</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="invoice-id">{invoice.id}</td>

              <td>
                <div className="customer-cell">
                  <span className="customer-avatar">
                    {invoice.initials}
                  </span>
                  <strong>{invoice.customer}</strong>
                </div>
              </td>

              <td className="amount-cell">
                {currency(invoice.amount)}
              </td>

              <td className="amount-cell">
                {currency(invoice.amountPaid)}
              </td>

              <td className="amount-cell outstanding-cell">
                {currency(invoice.outstanding)}
              </td>

              <td>
                <div className="due-cell">
                  {invoice.due}
                  <span>{invoice.days}</span>
                </div>
              </td>

              <td>
                <span className={`status-pill ${invoice.status.toLowerCase()}`}>
                  <i />
                  {invoice.status}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className="record-payment-button"
                  disabled={invoice.status === "Paid"}
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setPaymentAmount(String(invoice.amountPaid));
                    setShowPaymentModal(true);
                  }}
                >
                  Record payment
                </button>
              </td>
            </tr>
          ))}

          {filteredInvoices.length === 0 && (
            <tr>
              <td colSpan={8}>No invoices found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
)}

{activeNav === "Analytics" && (
  <div className="analytics-page">

    <section className="welcome-row">
      <div>
        <div className="eyebrow">
          <span className="live-dot" /> FINANCIAL INTELLIGENCE
        </div>
        <h1>
          Analytics<span className="heading-period">.</span>
        </h1>
        <p className="page-subtitle">
          Understand your receivables and collection performance.
        </p>
      </div>
    </section>

    <section className="metrics-grid">

      <article className="metric-card metric-featured">
        <div className="metric-top">
          <span>Total invoice value</span>
          <span className="metric-icon">
            <IndianRupee size={17} />
          </span>
        </div>
        <div className="metric-value">
          {currency(totalInvoiceValue)}
        </div>
        <div className="metric-bottom">
          <span>{totalInvoiceCount}</span>
          <span>invoices issued</span>
        </div>
      </article>

      <article className="metric-card">
        <div className="metric-top">
          <span>Total collected</span>
          <span className="metric-icon">
            <ArrowUpRight size={17} />
          </span>
        </div>
        <div className="metric-value">
          {currency(totalCollected)}
        </div>
        <div className="metric-bottom">
          <span className="metric-muted">
            {collectionRate.toFixed(1)}%
          </span>
          <span>collection rate</span>
        </div>
      </article>

      <article className="metric-card">
        <div className="metric-top">
          <span>Outstanding</span>
          <span className="metric-icon">
            <IndianRupee size={17} />
          </span>
        </div>
        <div className="metric-value">
          {currency(totalOutstanding)}
        </div>
        <div className="metric-bottom">
          <span className="metric-muted">
            {activeInvoiceCount}
          </span>
          <span>active invoices</span>
        </div>
      </article>

      <article className="metric-card">
        <div className="metric-top">
          <span>Overdue amount</span>
          <span className="metric-icon danger-icon">
            <CircleAlert size={17} />
          </span>
        </div>
        <div className="metric-value">
          {currency(overdueAmount)}
        </div>
        <div className="metric-bottom">
          <span className="metric-muted">
            {overdueInvoiceCount}
          </span>
          <span>overdue invoices</span>
        </div>
      </article>

    </section>

    <section className="analytics-grid">

      <article className="panel collections-panel">
        <div className="panel-header">
          <div>
            <div className="panel-kicker">PERFORMANCE</div>
            <h2>Collection performance</h2>
            <p>Current portfolio collection status</p>
          </div>
          <span className="eyebrow">LIVE DATA</span>
        </div>

        <div className="collection-summary">
          <div>
            <span>Invoice value</span>
            <strong>{currency(totalInvoiceValue)}</strong>
          </div>
          <div>
            <span>Collected</span>
            <strong>{currency(totalCollected)}</strong>
          </div>
          <div>
            <span>Outstanding</span>
            <strong>{currency(totalOutstanding)}</strong>
          </div>
        </div>

        <div className="collection-progress">
          <div className="collection-progress-header">
            <span>Collection rate</span>
            <strong>{collectionRate.toFixed(1)}%</strong>
          </div>

          <div className="collection-progress-track">
            <div
              className="collection-progress-fill"
              style={{
                width: `${collectionRate}%`,
              }}
            />
          </div>
        </div>
      </article>

      <article className="panel ageing-panel">
        <div className="panel-header">
          <div>
            <div className="panel-kicker">RISK ANALYSIS</div>
            <h2>Overdue ageing</h2>
            <p>Outstanding by payment delay</p>
          </div>
        </div>

        <div className="ageing-total">
          <strong>{currency(overdueAmount)}</strong>
          <span>total overdue</span>
        </div>

        <div className="ageing-bars">
          {ageingBuckets.map((bucket, index) => (
            <div className="ageing-row" key={bucket.label}>
              <div>
                <span>{bucket.label}</span>
                <strong>{currency(bucket.amount)}</strong>
              </div>

              <div className="bar-track">
                <i
                  className={
                    index === 1 ? "bar-mid" :
                    index === 2 ? "bar-old" :
                    index === 3 ? "bar-critical" : ""
                  }
                  style={{
                    width: overdueAmount > 0
                      ? `${(bucket.amount / overdueAmount) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

    </section>
  </div>
)}
        </div>
      </main>
      {showAddInvoice && (
  <div className="modal-overlay">
    <div className="invoice-modal">
      <div className="modal-header">
        <div>
          <span className="eyebrow">NEW RECORD</span>
          <h2>Add invoice</h2>
          <p>Enter the details of the invoice.</p>
        </div>

        <button
          className="modal-close"
          type="button"
          onClick={() => setShowAddInvoice(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleAddInvoice}>
        <label>
          Customer name
          <input
            type="text"
            placeholder="e.g. Sharma Enterprises"
            value={newInvoice.customer}
            onChange={(e) =>
              setNewInvoice({
                ...newInvoice,
                customer: e.target.value,
              })
              
            }
            
            required
          />
        </label>

        <label>
          Invoice amount (₹)
          <input
            type="number"
            placeholder="e.g. 85000"
            min="1"
            step="1"
            value={newInvoice.amount}
            onChange={(e) =>
              setNewInvoice({
                ...newInvoice,
                amount: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Due date
          <input
            type="date"
            value={newInvoice.dueDate}
            onChange={(e) =>
              setNewInvoice({
                ...newInvoice,
                dueDate: e.target.value,
              })
            }
            required
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowAddInvoice(false)}
          >
            Cancel
          </button>

          <button type="submit" className="primary-button">
            <Plus size={16} /> Create invoice
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showPaymentModal && selectedInvoice && (
  <div className="modal-overlay">
    <div className="invoice-modal">
      <div className="modal-header">
        <div>
          <span className="eyebrow">PAYMENT UPDATE</span>
          <h2>Record payment</h2>
          <p>Update the amount collected for this invoice.</p>
        </div>

        <button
          className="modal-close"
          type="button"
          onClick={() => {
            setShowPaymentModal(false);
            setSelectedInvoice(null);
            setPaymentAmount("");
          }}
        >
          ×
        </button>
      </div>

      <div className="payment-summary">
        <p>{selectedInvoice.customer}</p>
        <strong>{selectedInvoice.id}</strong>

        <div>
          <span>Invoice amount</span>
          <strong>{currency(selectedInvoice.amount)}</strong>
        </div>

        <div>
          <span>Outstanding</span>
          <strong>{currency(selectedInvoice.outstanding)}</strong>
        </div>
      </div>

      <form onSubmit={handleRecordPayment}>
        <label>
          Total amount paid so far (₹)
          <input
            type="number"
            min="0"
            max={selectedInvoice.amount}
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setShowPaymentModal(false);
              setSelectedInvoice(null);
              setPaymentAmount("");
            }}
          >
            Cancel
          </button>

          <button type="submit" className="primary-button">
            Save payment
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

export default App;
