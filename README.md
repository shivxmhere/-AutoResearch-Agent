# 🤖 AutoResearch Agent

**An Autonomous Multi-Agent AI Research System**

AutoResearch Agent is an intelligent system that automates deep research into any topic. By utilizing LangGraph, FastAPI, Next.js, and cutting-edge LLMs (like LLaMA 3.3 via Groq), it breaks down complex queries, conducts parallel web searches, scrapes content, analyzes data, fact-checks findings, and synthesizes a comprehensive final report. 

Built for the Microsoft Hackathon, this application provides a stunning, terminal-inspired dark mode UI to display real-time agent activities and beautiful, structured research reports.

## ✨ Features

- **Multi-Agent Architecture**: 
  - `Orchestrator`: Plans the research and generates sub-queries.
  - `Searcher`: Executes concurrent web searches via Tavily/Serper APIs.
  - `Reader`: Scrapes and cleans web content.
  - `Analyst`: Processes content and extracts key findings.
  - `Fact Checker`: Verifies extracted claims and highlights contradictions.
  - `Reporter`: Synthesizes everything into a final Markdown report.
- **Real-Time Streaming**: Watch the agents work live via SSE (Server-Sent Events).
- **Graceful Error Handling**: Resilient to target website blocks and LLM hallucinations. Fallbacks are built-in for every agent step.
- **Beautiful UI**: Built with Next.js 14, Tailwind CSS, and shadcn/ui. Features a sleek, modern, terminal-style dark theme with glowing accents.

## 🏗️ Architecture

- **Backend**: Python, FastAPI, LangGraph, LangChain, Groq (LLaMA-3.3-70b/Mixtral), Tavily Search.
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, React Markdown.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18+)
- Python (3.11+)

### 1. Set up the Backend (FastAPI + LangGraph)

```bash
cd backend
python -m venv .venv
# Activate the virtual environment
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory and add your API keys:

```ini
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
SERPER_API_KEY=your_serper_api_key_here
```

Start the backend server:

```bash
python main.py
```
*The backend will run on `http://localhost:8000`*

### 2. Set up the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000`*

## 💡 Usage

1. Open `http://localhost:3000` in your web browser.
2. Enter a research topic (e.g., "The future of solid-state batteries in EVs").
3. Select your desired research depth (Standard/Deep).
4. Watch the agents intelligently break down the task, browse the web, and analyze content in the live feed.
5. Receive a meticulously crafted, fact-checked research report!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---
*Created for the Microsoft Hackathon.* 🚀
