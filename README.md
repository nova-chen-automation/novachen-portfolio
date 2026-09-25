# Nova Chen — AI & Workflow Automation

I design and build automation pipelines that keep working in production — n8n workflows, private local LLM setups, and API integrations.

## What I do

- **n8n workflow engineering** — lead & ops pipelines with manual approval gates, CRM sync, email/Slack/calendar automation, retries, error handling, and deduplication.
- **Local LLMs (Ollama / LM Studio)** — private document search and processing. Tuned against the client's real documents, not a demo dataset.
- **API / webhook / database integrations** — direct API first; custom Python/JS when an n8n node isn't enough.
- **Plain-language runbooks** — handoff documentation so the client is never stuck waiting on me.

## Selected work

### Lead pipeline with approval gates
`demo/lead_pipeline_demo.js`

Form → database → n8n flow with **two manual approval checkpoints** and a **payment-state switch** that automatically pauses a client's flow when they have overdue invoices — and resumes it the moment payment lands.

- Run it: `node demo/lead_pipeline_demo.js selftest`
- Result: **10 passed, 0 failed**
- Built in: retries with backoff, idempotency keys, explicit error handling, and an audit log of every state change.

## How I work

1. **Data map first** — document what data exists, where it lives, and what may never leave the client's premises.
2. **Build the smallest working thing** — then make it survive production.
3. **Prove it** — every deliverable ships with a runnable self-check, not a promise.
4. **Document it** — a runbook in plain language, so the system is not a black box.

## Contact

- **Email:** nova.chen.ai@foxmail.com
- **Timezone:** UTC+8 — flexible with calls for US/EU clients.
- Happy to sign an NDA before we discuss specifics.
