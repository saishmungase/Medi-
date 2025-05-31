# MediPlus 🩺📸
A smart prescription scanner that helps users understand medicines instantly by scanning prescriptions using AI and APIs.

## 🚀 Overview
**MedLens** allows users to upload or take pictures of medical prescriptions. It extracts medicine names using OCR and fetches information like usage, side effects, interactions, etc., via a medicine information API. Designed for individuals seeking clarity on their medication, especially when a doctor is unavailable.

## 🧠 Core Features
- Upload prescription image or click using camera
- Extract medicine names using OCR (Tesseract.js)
- Fetch medicine info (usage, side effects, interactions, etc.)
- Mobile-first design with clean UX
- Potential multilingual support and chatbot integration in future

## 🏗️ Architecture
- **Frontend**: React + TailwindCSS
- **OCR**: Tesseract.js (browser-based OCR)
- **Medicine Info**: Open Medicine API (e.g., DrugBank, openFDA, Health APIs)
- **Backend (Optional)**: Node.js/Express server to proxy API calls and handle future chatbot/NLP features
- **Hosting**: Vercel / Firebase Hosting

## 🔁 Workflow
1. User uploads prescription image
2. OCR extracts potential medicine names
3. App matches and cleans drug names
4. Medicine info is fetched via API
5. Info is displayed in an easy-to-understand UI

## 🛠️ Installation
```bash
git clone https://github.com/yourusername/medlens.git
cd frontend
npm install
npm run dev
cd ../backend
npm install
node server.js
