import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [vpa, setVpa] = useState("");
  const [vpaResult, setVpaResult] = useState(null);
  const [collectPayload, setCollectPayload] = useState({ payerVpa: "", amount: "", invoiceId: "" });
  const [collectResult, setCollectResult] = useState(null);
  const [draftInput, setDraftInput] = useState({ customerName: "", invoiceId: "", amount: "", tone: "concise" });
  const [draft, setDraft] = useState("");
  const [stateSnapshot, setStateSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchState();
  }, []);

  async function fetchState() {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      const json = await res.json();
      setStateSnapshot(json);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleVpaValidate(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/vpa/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vpa })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Validation failed");
      setVpaResult(json);
      fetchState();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCollect(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/collect/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...collectPayload, amount: Number(collectPayload.amount) })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Collect failed");
      setCollectResult(json);
      fetchState();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDraft(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/llm/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draftInput, amount: Number(draftInput.amount) })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Draft failed");
      setDraft(json.draft);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>UPI Finance Ops Copilot</h1>
        <p>Test VPA checks, collect initiation, reconciliation, and draft outreach.</p>
      </header>

      <main className="grid">
        <section>
          <h2>VPA validation</h2>
          <form onSubmit={handleVpaValidate} className="card">
            <label>
              VPA
              <input value={vpa} onChange={(e) => setVpa(e.target.value)} placeholder="name@bank" required />
            </label>
            <button type="submit" disabled={loading}>Validate</button>
            {vpaResult && (
              <div className="result">
                <strong>Status:</strong> {vpaResult.status} ({vpaResult.source})
              </div>
            )}
          </form>
        </section>

        <section>
          <h2>Initiate collect</h2>
          <form onSubmit={handleCollect} className="card">
            <label>
              Payer VPA
              <input
                value={collectPayload.payerVpa}
                onChange={(e) => setCollectPayload({ ...collectPayload, payerVpa: e.target.value })}
                required
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                value={collectPayload.amount}
                onChange={(e) => setCollectPayload({ ...collectPayload, amount: e.target.value })}
                required
              />
            </label>
            <label>
              Invoice ID (optional)
              <input
                value={collectPayload.invoiceId}
                onChange={(e) => setCollectPayload({ ...collectPayload, invoiceId: e.target.value })}
              />
            </label>
            <button type="submit" disabled={loading}>Send collect</button>
            {collectResult && (
              <div className="result">
                <strong>Collect ID:</strong> {collectResult.id} — {collectResult.status}
              </div>
            )}
          </form>
        </section>

        <section>
          <h2>Draft outreach</h2>
          <form onSubmit={handleDraft} className="card">
            <label>
              Customer name
              <input
                value={draftInput.customerName}
                onChange={(e) => setDraftInput({ ...draftInput, customerName: e.target.value })}
                required
              />
            </label>
            <label>
              Invoice ID
              <input
                value={draftInput.invoiceId}
                onChange={(e) => setDraftInput({ ...draftInput, invoiceId: e.target.value })}
                required
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                value={draftInput.amount}
                onChange={(e) => setDraftInput({ ...draftInput, amount: e.target.value })}
                required
              />
            </label>
            <label>
              Tone
              <select value={draftInput.tone} onChange={(e) => setDraftInput({ ...draftInput, tone: e.target.value })}>
                <option value="concise">Concise</option>
                <option value="friendly">Friendly</option>
              </select>
            </label>
            <button type="submit" disabled={loading}>Generate draft</button>
            {draft && <div className="result">{draft}</div>}
          </form>
        </section>

        <section>
          <h2>State snapshot</h2>
          <div className="card">
            <button onClick={fetchState} disabled={loading}>Refresh</button>
            <pre className="state">{JSON.stringify(stateSnapshot, null, 2)}</pre>
          </div>
        </section>
      </main>

      {error && <div className="error">Error: {error}</div>}
    </div>
  );
}

