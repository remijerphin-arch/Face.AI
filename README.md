# FaceSense AI

FaceSense AI is a premium, futuristic, Apple-level AI face analysis web application. It features a luxurious, minimal, and highly interactive user experience.

---

## Key Features

1. **AI Face Analysis & Landmark Mapping**: Connects a 68-point dynamic neon face mesh canvas over the user's photo to analyze structural properties.
2. **Face Shape Detection**: Classifies Oval, Round, Square, Rectangle, Diamond, Heart, and Triangle face shapes with matching reasoning.
3. **Interactive Dermal Scan**: Assesses skin properties (Acne, wrinkles, oiliness, hydration, pigmentation, redness) with severity details and care guides.
4. **Grooming Recommendations**: Recommends 10 hairstyles, hair colors, and beard contours tailored to the face shape.
5. **Wardrobe & Color Analysis**: Explores personal skin undertones (Warm, Cool, Olive, Neutral) and suggests color palettes to wear or avoid.
6. **AI Fashion Stylist**: Recommends custom apparel layouts for Casual, Formal, and Party events.
7. **30-Day Glow-Up Schedule**: Custom day-by-day morning and night routine tracker with product recommendations.
8. **AI Chatbot**: A responsive chatbot contextually pre-loaded with the user's scan results to guide their styling journey.

---

## Privacy Promise (Sandbox Policy)

This application is strictly **privacy-first**:
- **No persistent databases or storage**: Face photos are converted directly to byte streams, processed in-memory, and immediately discarded.
- **No user profile logins or registration**: Instant access out-of-the-box.
- **Volatile session memory**: Refreshing, closing the tab, or exiting wipes all uploaded images, analysis results, and chatbot histories.

---

## Directory Structure

```
facesense-ai/
├── backend/
│   ├── main.py          # FastAPI app, analyze & chat routes
│   ├── analyzer.py      # Face math, PIL color analysis, landmark coords
│   └── requirements.txt # Python packages (FastAPI, PIL, NumPy)
├── frontend/
│   ├── src/
│   │   ├── app/         # Layout & pages
│   │   └── components/  # LandingPage, UploadPage, ScanningScreen, Dashboard
│   └── package.json     # Next.js and Tailwind CSS setup
└── run-dev.bat          # Unified launch script
```

---

## How to Run

### Quick Start (Windows)
Simply double-click the **`run-dev.bat`** file in the root directory. 

This will automatically:
1. Verify Node.js and Python.
2. Setup a Python virtual environment in `backend/venv` and install backend packages.
3. Start the FastAPI backend on `http://127.0.0.1:8000`.
4. Run the Next.js dev server on `http://localhost:3000`.
5. Open your browser and navigate to `http://localhost:3000`.

### Manual Setup

#### 1. Backend Service
```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Frontend App
```bash
cd frontend
npm install
npm run dev
```

---

## Optional: Gemini LLM Integration
By default, the chatbot uses a rule-based expert system tailored to the user's scan. To enable the LLM-powered chatbot, set a `GEMINI_API_KEY` environment variable in the backend environment (e.g., inside `backend/venv` or your system environment variables) before launching:

```bash
set GEMINI_API_KEY=your_key_here
```
When configured, the backend will call the Gemini API directly to generate custom, conversational styling responses.
