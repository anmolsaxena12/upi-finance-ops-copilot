const state = {
  vpaCache: new Map(),
  collects: new Map(),
  refunds: new Map(),
  invoices: new Map(),
  payments: new Map()
};

export function upsertVpa(vpa, status) {
  const entry = { vpa, status, checkedAt: new Date().toISOString() };
  state.vpaCache.set(vpa, entry);
  return entry;
}

export function getVpa(vpa) {
  return state.vpaCache.get(vpa);
}

export function createCollect(payload) {
  state.collects.set(payload.id, payload);
  return payload;
}

export function getCollect(id) {
  return state.collects.get(id);
}

export function updateCollect(id, updates) {
  const existing = state.collects.get(id);
  if (!existing) return null;
  const next = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  state.collects.set(id, next);
  return next;
}

export function createPayment(payment) {
  state.payments.set(payment.id, payment);
  return payment;
}

export function getPayment(id) {
  return state.payments.get(id);
}

export function createRefund(refund) {
  state.refunds.set(refund.id, refund);
  return refund;
}

export function getRefund(id) {
  return state.refunds.get(id);
}

export function reconcile(paymentId, invoiceId) {
  const payment = state.payments.get(paymentId);
  if (!payment) return null;
  const reconciliation = {
    paymentId,
    invoiceId,
    reconciledAt: new Date().toISOString(),
    status: "linked"
  };
  state.invoices.set(invoiceId, reconciliation);
  return reconciliation;
}

export function snapshot() {
  return {
    vpaCache: Array.from(state.vpaCache.values()),
    collects: Array.from(state.collects.values()),
    refunds: Array.from(state.refunds.values()),
    payments: Array.from(state.payments.values()),
    invoices: Array.from(state.invoices.values())
  };
}

