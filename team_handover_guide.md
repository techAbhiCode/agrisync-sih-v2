# AgriSync - Smart Mandi Queue & Logistics Management
## 🚀 Team Handover & Setup Guide

Welcome to the **AgriSync** project! This document contains everything you need to understand what has been built so far, how to set up the project on your local machine, and how to contribute effectively without breaking existing features.

---

## 📖 1. Project Context (What we have built so far)
AgriSync is a comprehensive system designed to solve the problem of long queues, capacity mismanagement, and logistics disconnects at agricultural Mandis. 

**Tech Stack:**
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, Framer Motion, `react-i18next` (for translation).
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB Atlas.
*   **AI:** Google Gemini API (for advisory).

**Key Features Implemented:**
1.  **Smart Booking System:** Allocates slots based on dynamic Mandi capacity (e.g., if a Mandi has a 50 Qtl limit, the system blocks overbooking).
2.  **QR Gate Pass:** Generates a secure Virtual Token for Mandi entry.
3.  **Logistics Tracking:** Tracks truck statuses (Booked ➔ Onboard ➔ Delivered).
4.  **Multilingual UI:** Complete Hindi and English translation using `react-i18next`.
5.  **AI Assistant:** Integrated Gemini API for crop advisory and weather.

---

## 🛠️ 2. Local Setup Guide (Step-by-Step)

Follow these steps to run the project on your machine.

### Step 1: Clone the Repository
```bash
git clone <repository_url>
cd agrisync-sih-v2
```

### Step 2: Install Dependencies
Open **two** separate terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
```

### Step 3: Setup Environment Variables
You need to create a `.env` file in the **backend** folder. Ask the team lead for the exact values, but the structure should look like this:

**Create `backend/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0...
GEMINI_API_KEY=AIzaSy...
# Any other Redis or Weather API keys if applicable
```

### Step 4: Run the Servers
**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server should start on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Frontend should start on http://localhost:5173
```

---

## 🌿 3. Git Workflow (How to push updates safely)
To avoid merge conflicts and breaking the main code, **never push directly to the `main` branch.**

1.  **Pull the latest code:** `git pull origin main`
2.  **Create a new branch for your feature:** 
    ```bash
    git checkout -b feature/rag-implementation
    # OR 
    git checkout -b fix/ui-bug
    ```
3.  **Make your changes and commit:**
    ```bash
    git add .
    git commit -m "feat: added RAG for AI advisory"
    ```
4.  **Push your branch:**
    ```bash
    git push origin feature/rag-implementation
    ```
5.  **Create a Pull Request (PR):** Go to GitHub/GitLab and create a PR to merge your branch into `main`. Let another team member review it before merging.

---

## 🤖 4. AI Assistant Context Prompt
*(Copy and paste this prompt to any AI coding assistant like ChatGPT, Claude, Cursor, or Gemini before you start working, so the AI understands the project perfectly).*

**Copy the below prompt:**

> **Project Context:** I am working on "AgriSync", a Smart Mandi Queue & Logistics Management MERN stack application. 
> 
> **Tech Stack:** 
> - Frontend: React (Vite), TypeScript, Tailwind CSS, Framer Motion (for UI animations), `react-i18next` (for Hindi/English localization), `lucide-react` (for icons).
> - Backend: Node.js, Express.js, MongoDB (Mongoose).
>
> **Design Language:** The UI heavily uses modern Glassmorphism (e.g., `bg-white/40 backdrop-blur-xl border-white/20`), soft gradients, and rounded cards. Always maintain this premium, dynamic aesthetic. Do not use generic blocky UI.
> 
> **Current Architecture Rules:**
> 1. All strings in the frontend MUST be wrapped in the `t('key', 'Default English')` translation function using `useTranslation` from `react-i18next` to maintain bilingual support.
> 2. Booking forms and tickets are localized.
> 3. We are planning to implement **RAG (Retrieval-Augmented Generation)** to replace general AI prompts with verified agricultural data. 
> 4. Always use `overflow-y-auto` carefully on specific list containers, NOT parent containers, to prevent UI scrolling bugs.
> 
> **My Task:** [Explain your current task here, e.g., "Help me set up the Pinecone Vector DB connection in the backend for RAG."]
