import { supabase } from "./supabase.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  const { error } = await supabase
    .from("invoices")
    .select("id")
    .limit(1);

  if (error) {
    return res.status(500).json({
      status: "error",
      database: error.message
    });
  }

  res.json({
    status: "ok",
    application: "ProofPay AI",
    database: "connected"
  });
});

// Get all invoices
app.get("/api/invoices", async (req, res) => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json(data);
});

// Create a new invoice
app.post("/api/invoices", async (req, res) => {
  const { customer, amount, dueDate } = req.body;

  // Validate input
  if (
    !customer ||
    typeof customer !== "string" ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    !dueDate ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)
  ) {
    return res.status(400).json({
      error: "Valid customer, positive amount, and due date are required."
    });
  }

  const cleanCustomer = customer.trim();

  if (!cleanCustomer) {
    return res.status(400).json({
      error: "Customer name cannot be empty."
    });
  }

  const initials = cleanCustomer
    .split(/\s+/)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const invoiceNumber = `INV-${Date.now()}`;

  const today = new Date().toISOString().slice(0, 10);

  const status = dueDate < today ? "Overdue" : "Pending";

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      customer: cleanCustomer,
      initials,
      amount: Number(amount),
      due_date: dueDate,
      status
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.status(201).json(data);
});

// Record a payment against an invoice
app.patch("/api/invoices/:id/payment", async (req, res) => {
  const { amountPaid } = req.body;
  const { id } = req.params;

  if (
    !Number.isFinite(Number(amountPaid)) ||
    Number(amountPaid) < 0
  ) {
    return res.status(400).json({
      error: "Enter a valid payment amount."
    });
  }

  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("id, amount, amount_paid")
    .eq("invoice_number", id)
    .single();

  if (fetchError || !invoice) {
    return res.status(404).json({
      error: "Invoice not found."
    });
  }

  const payment = Number(amountPaid);

  if (payment > Number(invoice.amount)) {
    return res.status(400).json({
      error: "Payment cannot exceed invoice amount."
    });
  }

  const { data, error } = await supabase
    .from("invoices")
    .update({ amount_paid: payment })
    .eq("invoice_number", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json(data);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});