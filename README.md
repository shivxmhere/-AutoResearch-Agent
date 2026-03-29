# 🤖 AutoResearch Agent: Cyber Intelligence System

**Autonomous Multi-Agent AI Research System | Microsoft Hackathon 2026**

AutoResearch Agent is a powerful, production-ready AI research engine that automates deep technical investigations. Built with a "Multi-Agent" mindset, it utilizes **LangGraph**, **FastAPI**, and **Groq (LLaMA 3.3 70B)** to autonomously browse, scrape, analyze, fact-check, and synthesize comprehensive intelligence reports on any complex topic.

> [!IMPORTANT]
> **Built by Team TechLions**: Ankur Verma, Shivam Singh, and Aditya Ojha (IIT Patna).

---

## 💎 Key Features

- **🌐 Cyber-Intelligence UI**: A $10M-funded aesthetic redesign using Next.js 14, Tailwind CSS (V4), and Framer Motion. Features include glassmorphism, animated neural-network backgrounds, and real-time agent pipeline visuals.
- **🧠 5-Agent Orchestration**:
  - **Orchestrator**: Strategizes research paths and generates iterative sub-queries.
  - **Searcher**: Executes extreme-scale concurrent web searches (Tavily & Serper).
  - **Reader**: High-performance scraping and markdown cleaning of target content.
  - **Analyst**: Deep reasoning and synthesis of raw data into coherent findings.
  - **Fact Checker**: Cross-references claims and detects research contradictions.
  - **Reporter**: Generates professional, structured Markdown intelligence reports.
- **⚡ Performance First**: Powered by **Groq LPU Inference**, achieving near-instant reasoning speeds using LLaMA 3.3 70B.
- **📡 Real-Time Streaming**: Full SSE (Server-Sent Events) integration allows you to watch the "mind" of each agent as it processes information.
- **🔬 Depth Selection**: Choose between `Quick` (30s), `Standard` (60s), and `Deep` (120s+) research modes.

---

## 🛠️ Technology Stack

| Architecture | Technologies |
| :--- | :--- |
| **Backend** | Python 3.11, FastAPI, LangGraph, LangChain, Groq, Pydantic |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Radix UI |
| **AI Modules** | LLaMA 3.3 70B (Groq), Tavily API, Serper API, FAISS (Vector DB) |
| **Deployment** | Vercel (Frontend), GitHub Actions |

---

## 🚀 Installation & Setup

### 1. Backend Configuration
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate | Unix: source .venv/bin/activate
pip install -r requirements.txt
```

Create a `backend/.env` file:
```ini
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly-...
SERPER_API_KEY=your-key
```

Run the API:
```bash
python main.py
```

### 2. Frontend Configuration
```bash
cd frontend
npm install
npm run dev
```

---

## 💡 How it Works

1. **Query Expansion**: The Orchestrator takes your simple query and expands it into 5-10 technical research vectors.
2. **Parallel Research**: The Searcher and Reader agents work concurrently across dozens of live web sources.
3. **Consolidation**: The Analyst synthesizes raw text, removing noise and extracting high-signal findings.
4. **Verification**: The Fact Checker ensures the report isn't based on hallucinations or outdated data.
5. **Synthesis**: A beautiful, multi-tabbed research report is rendered with confidence scores and source citations.

---

### 🏛️ Team TechLions
*   **Ankur Verma** - Software Architect
*   **Shivam Singh** - Full Stack & AI Lead
*   **Aditya Ojha** - Frontend Specialist

---
*Created for the Microsoft Hackathon - Track 2: Agentic AI.* 🚀
