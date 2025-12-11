# UPI Finance Ops Copilot

## Project Vision and Goals
The UPI Finance Ops Copilot is a MERN stack application integrated with Large Language Models (LLMs) using Retrieval-Augmented Generation (RAG) techniques to automate Accounts Receivable (AR) and Accounts Payable (AP) operations for Indian SMEs.

Key functionalities include:
- VPA (Virtual Payment Address) validation to reduce failed payment attempts
- UPI collect request initiation and status tracking via webhook callbacks
- Refund request creation and lifecycle management
- Reconciliation of payment events to invoices with real-time live dashboards
- LLM-powered draft communications grounded in invoice and customer data
- Observability with logging, tracing, and grounding evaluation for trustworthy AI outputs

---

## Tech Stack Planned
- Frontend: React 18 (with Suspense and streaming Server-Side Rendering)
- Backend: Node.js with Express framework
- Database: MongoDB (Atlas free tier) with Change Streams support for real-time updates
- AI Layer: Large Language Models with Retrieval-Augmented Generation (RAG) over invoice/customer data
- Deployment: Free-tier services such as Vercel/Netlify for frontend and Render/Railway for backend
- Tools: GitHub for version control and CI/CD, Postman for API testing

---

## Milestones and Timelines Overview

| Week | Major Focus Areas                                   |
|-------|--------------------------------------------------|
| 1     | Planning, API design, VPA validation, collect request implementation with mocks               |
| 2     | Webhook handling with idempotency, payment status streaming, refund processing               |
| 3     | LLM integration for draft communication, observability, evaluation metrics                   |
| 4     | Testing, performance tuning, deployment, project documentation                              |

---

## What is implemented now
- Express backend with stubbed VPA validation, collect initiation, webhook status updates, refunds, reconciliation, synthetic LLM outreach drafts, and a live state snapshot.
- In-memory datastore for quick demos (no external services required).
- React 18 + Vite frontend that exercises the backend flows (VPA checks, collect initiation, outreach drafts, and state viewer).
- CORS enabled for local dev and simple logging via morgan.

---

## Useful Resources and API Documentation
- UPI Collect Request API: [Federal Bank UPI Collect API](https://developer.federalbank.co.in/fedbnkdev/dev/product/2491/api/2151)
- VPA Validation APIs (e.g. Nimbbl, Razorpay, Paytm docs)
- UPI Refund API Docs: [Setu Refund API](https://docs.setu.co/payments/umap/refunds-disputes)
- MongoDB Change Streams: https://www.mongodb.com/docs/manual/changeStreams/
- React Suspense Docs: https://react.dev/reference/react/Suspense
- LangChain RAG and LLM best practices

---

## How to Contribute or Provide Feedback
Contributions and suggestions are welcome via GitHub Issues and Pull Requests.

---

## Run the project locally

Prereqs: Node.js 18+ and npm installed.

### 1) Start the backend
```
cd backend
npm install
npm run dev
```
Server listens on `http://localhost:4000`.

### 2) Start the frontend
```
cd frontend
npm install
VITE_API_URL=http://localhost:4000 npm run dev
```
Vite serves the React app on `http://localhost:5173`.

### 3) Quick manual flows
- **Health**: GET `http://localhost:4000/api/health`
- **VPA check**: POST `http://localhost:4000/api/vpa/validate` with `{ "vpa": "name@bank" }`
- **Collect**: POST `http://localhost:4000/api/collect/initiate` with `{ "payerVpa": "name@bank", "amount": 499, "invoiceId": "INV-123" }`
- **Webhook simulation**: POST `http://localhost:4000/api/webhooks/collect` with `{ "collectId": "<id>", "status": "paid" }`
- **Refund**: POST `http://localhost:4000/api/refunds` with `{ "paymentId": "<pay_id>", "amount": 100 }`
- **Reconcile**: POST `http://localhost:4000/api/reconcile` with `{ "paymentId": "<pay_id>", "invoiceId": "INV-123" }`
- **LLM draft**: POST `http://localhost:4000/api/llm/draft` with `{ "customerName": "Asha", "invoiceId": "INV-123", "amount": 499, "tone": "friendly" }`

Use the React UI to drive the same flows without Postman.

---

## Project layout
- `backend/` – Express server and in-memory workflow logic.
- `frontend/` – Vite + React interface for the main flows.
- `.gitignore` – Basic Node/Vite ignores.
