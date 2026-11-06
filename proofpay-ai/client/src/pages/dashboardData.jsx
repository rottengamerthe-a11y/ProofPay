
import { dashboardData } from "../data/dashboardData";
import {
  IndianRupee,
  FileText,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function Dashboard() {
  const stats = [
    {
      title: "Total Outstanding",
      value: currency(dashboardData.totalOutstanding),
      icon: IndianRupee,
    },
    {
      title: "Overdue Amount",
      value: currency(dashboardData.overdueAmount),
      icon: AlertCircle,
    },
    {
      title: "Total Invoices",
      value: dashboardData.totalInvoices,
      icon: FileText,
    },
    {
      title: "Collection Rate",
      value: `${dashboardData.collectionRate}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Here's your receivables overview.</p>
        </div>
        <button className="primary-btn">+ Add Invoice</button>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="stat-card" key={stat.title}>
              <div className="stat-heading">
                <span>{stat.title}</span>
                <Icon size={20} />
              </div>
              <h2>{stat.value}</h2>
              <span className="stat-note">
                Receivables overview
              </span>
            </article>
          );
        })}
      </section>

      <section className="invoice-section">
        <div className="section-heading">
          <div>
            <h2>Recent Invoices</h2>
            <p>Monitor your outstanding payments.</p>
          </div>
          <button className="text-btn">
            View all <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {dashboardData.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.customer}</td>
                  <td>{currency(invoice.amount)}</td>
                  <td>{invoice.dueDate}</td>
                  <td>
                    <span
                      className={`status ${
                        invoice.status === "Overdue"
                          ? "overdue"
                          : "pending"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
