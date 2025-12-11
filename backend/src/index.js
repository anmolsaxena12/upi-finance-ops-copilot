import express from "express";
import cors from "cors";
import morgan from "morgan";
import { nanoid } from "nanoid";
import {
  upsertVpa,
  getVpa,
  createCollect,
  getCollect,
  updateCollect,
  createRefund,
  getRefund,
  createPayment,
  reconcile,
  snapshot
} from "./dataStore.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "upi-finance-ops-copilot", time: new Date().toISOString() });
});

app.post("/api/vpa/validate", (req, res) => {
  const { vpa } = req.body;
  if (!vpa || typeof vpa !== "string") {
    return res.status(400).json({ error: "vpa is required" });
  }
  const cached = getVpa(vpa);
  if (cached) return res.json({ source: "cache", ...cached });

  const looksValid = /^[a-zA-Z0-9_.-]+@[a-zA-Z]+$/.test(vpa);
  const status = looksValid ? "verified" : "rejected";
  const saved = upsertVpa(vpa, status);
  res.json({ source: "synthetic", ...saved });
});

app.post("/api/collect/initiate", (req, res) => {
  const { payerVpa, amount, invoiceId } = req.body;
  if (!payerVpa || !amount) return res.status(400).json({ error: "payerVpa and amount are required" });
  const id = nanoid();
  const collect = createCollect({
    id,
    payerVpa,
    amount,
    invoiceId: invoiceId || null,
    status: "pending",
    createdAt: new Date().toISOString()
  });
  createPayment({ id: `pay_${id}`, amount, payerVpa, status: "initiated", createdAt: collect.createdAt });
  res.status(201).json(collect);
});

app.get("/api/collect/:id", (req, res) => {
  const collect = getCollect(req.params.id);
  if (!collect) return res.status(404).json({ error: "not found" });
  res.json(collect);
});

app.post("/api/webhooks/collect", (req, res) => {
  const { collectId, status } = req.body;
  if (!collectId || !status) return res.status(400).json({ error: "collectId and status required" });
  const updated = updateCollect(collectId, { status });
  if (!updated) return res.status(404).json({ error: "collect not found" });
  res.json(updated);
});

app.post("/api/refunds", (req, res) => {
  const { paymentId, amount, reason } = req.body;
  if (!paymentId || !amount) return res.status(400).json({ error: "paymentId and amount are required" });
  const refund = createRefund({
    id: nanoid(),
    paymentId,
    amount,
    reason: reason || "Not specified",
    status: "requested",
    createdAt: new Date().toISOString()
  });
  res.status(201).json(refund);
});

app.get("/api/refunds/:id", (req, res) => {
  const refund = getRefund(req.params.id);
  if (!refund) return res.status(404).json({ error: "not found" });
  res.json(refund);
});

app.post("/api/reconcile", (req, res) => {
  const { paymentId, invoiceId } = req.body;
  if (!paymentId || !invoiceId) return res.status(400).json({ error: "paymentId and invoiceId are required" });
  const reconciliation = reconcile(paymentId, invoiceId);
  if (!reconciliation) return res.status(404).json({ error: "payment not found" });
  res.json(reconciliation);
});

app.post("/api/llm/draft", (req, res) => {
  const { customerName, invoiceId, amount, tone } = req.body;
  if (!customerName || !invoiceId || !amount) return res.status(400).json({ error: "customerName, invoiceId, amount required" });
  const style = tone === "friendly" ? "warm" : "concise";
  const draft = [
    `Hi ${customerName},`,
    `This is a ${style} reminder about invoice ${invoiceId} for ₹${amount}.`,
    "Please let us know if you need any help to complete the payment.",
    "Thank you."
  ].join(" ");
  res.json({ draft, grounding: { invoiceId, amount } });
});

app.get("/api/state", (_, res) => {
  res.json(snapshot());
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected error" });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

