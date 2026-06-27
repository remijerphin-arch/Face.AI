from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import urllib.request
from typing import List, Optional
from analyzer import generate_analysis_report

app = FastAPI(title="FaceSense AI Backend", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "FaceSense AI Backend Engine",
        "message": "To view the user interface, please open the port 3000 link in your browser."
    }


class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    analysis: dict

@app.post("/api/analyze")
async def analyze_face(file: UploadFile = File(...)):
    """Analyze uploaded photo and return a comprehensive styling and skin report."""
    # Validate file type
    content_type = file.content_type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    
    # Check extension just in case content_type is generic
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp", ".heic"]
    
    if content_type not in allowed_types and ext not in allowed_exts:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format: {content_type or ext}. Please upload a JPG, PNG, WEBP, or HEIC image."
        )
        
    try:
        image_bytes = await file.read()
        report = generate_analysis_report(image_bytes)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")

def call_gemini_api(api_key: str, system_prompt: str, user_message: str, history_list: list) -> str:
    """Call the real Gemini API using standard urllib.request to avoid extra dependencies."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    # Format contents for Gemini API
    contents = []
    
    # Add history
    for msg in history_list:
        role = "user" if msg.role == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg.content}]
        })
        
    # Add current message
    contents.append({
        "role": "user",
        "parts": [{"text": f"[System: {system_prompt}]\n\nUser Question: {user_message}"}]
    })
    
    data = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }
    
    req_body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print("Gemini API call failed, falling back to local chat engine:", str(e))
        return ""

def generate_local_response(user_msg: str, analysis: dict) -> str:
    """
    Highly detailed local rule-based expert chatbot.
    Uses facial profile details to respond intelligently and contextually.
    """
    msg = user_msg.lower()
    
    face_shape = analysis.get("face_shape", {}).get("name", "Oval")
    skin_score = analysis.get("skin_analysis", {}).get("overall_score", 90)
    skin_metrics = analysis.get("skin_analysis", {}).get("metrics", [])
    hair_analysis = analysis.get("hair_analysis", {})
    undertone = analysis.get("color_analysis", {}).get("undertone", "Neutral")
    
    # Extract skin concern severity
    skin_concerns_str = ""
    for m in skin_metrics:
        if m.get("severity") == "Medium" or m.get("status") == "Moderate":
            skin_concerns_str += f"\n- {m['name']}: {m['desc']} (Recommendation: {m['tips']})"
            
    # Find active skin concerns
    oiliness = next((m for m in skin_metrics if "oiliness" in m["name"].lower() or "sebum" in m["name"].lower()), {})
    hydration = next((m for m in skin_metrics if "hydration" in m["name"].lower()), {})
    acne = next((m for m in skin_metrics if "acne" in m["name"].lower() or "pimples" in m["name"].lower()), {})
    redness = next((m for m in skin_metrics if "redness" in m["name"].lower() or "sensitivity" in m["name"].lower()), {})
    pigment = next((m for m in skin_metrics if "pigmentation" in m["name"].lower() or "spots" in m["name"].lower()), {})
    
    # Intent: Hairstyle
    if any(k in msg for k in ["haircut", "hairstyle", "hair style", "cut my hair"]):
        hairstyles = hair_analysis.get("hairstyles", [])
        top_styles = [h["name"] for h in hairstyles[:3]]
        explanation = analysis.get("face_shape", {}).get("explanation", "")
        
        res = f"Based on your **{face_shape}** face shape, the absolute best hairstyles for you are:\n\n"
        for i, style in enumerate(hairstyles[:4], 1):
            res += f"{i}. **{style['name']}** (Match Score: {style['score']}%)\n"
            res += f"   - *Why it suits*: {style['why']}\n"
            res += f"   - *Maintenance*: {style['maintenance']} | *Difficulty*: {style['difficulty']}\n\n"
        res += f"**Stylist Tip**: {explanation}\n"
        return res
        
    # Intent: Skincare routine / Skin care / Moisturizer / Face wash
    elif any(k in msg for k in ["skin", "routine", "moisturizer", "wash", "skincare", "acne", "pimples"]):
        glow_up = analysis.get("glow_up_plan", {})
        daily = glow_up.get("daily_routine", {})
        
        res = f"Here is your personalized Skincare Routine based on your skin analysis (Skin Score: **{skin_score}/100**):\n\n"
        res += f"☀️ **Morning Routine**:\n{daily.get('morning_skincare', '')}\n\n"
        res += f"🌙 **Night Routine**:\n{daily.get('night_skincare', '')}\n\n"
        
        if skin_concerns_str:
            res += f"⚠️ **Key Areas of Focus**:{skin_concerns_str}\n\n"
        else:
            res += "✨ Your skin is in excellent condition! Maintain hydration and UV protection to keep the skin barrier strong.\n\n"
            
        res += "📦 **Recommended Product Types**:\n"
        for p in glow_up.get("products", []):
            res += f"- **{p['category']}**: *{p['type']}* — {p['why']}\n"
            
        return res
        
    # Intent: Sunscreen
    elif "sunscreen" in msg or "spf" in msg or "sun protect" in msg:
        return "For daily protection, we recommend a **Broad Spectrum SPF 50+ Sunscreen** with a matte or dry-touch finish (especially if you have oiliness in the T-zone). Since UV rays cause 80% of visible aging and skin spots, applying sunscreen is the single most important step in your routine. Apply it every single morning, and reapply if outdoors for extended periods."
        
    # Intent: Beard / Shave
    elif "beard" in msg or "shave" in msg or "stubble" in msg:
        beard_recs = analysis.get("beard_recommendations", [])
        if not beard_recs:
            return "For your face shape, a clean-shaven look or light, structured stubble is highly recommended to show off your facial boundaries."
        
        res = f"Since your face shape is **{face_shape}**, here are our top beard recommendations:\n\n"
        for rec in beard_recs:
            res += f"- **{rec['name']}**: {rec['reason']}\n"
        res += "\nIf you grow a beard, make sure to use a light **Beard Oil** daily to keep the hair soft and the skin underneath hydrated!"
        return res
        
    # Intent: Shirt Color / Wardrobe / Accessories / Watches
    elif any(k in msg for k in ["color", "shirt", "suit", "jacket", "wear", "avoid", "palette"]):
        color_info = analysis.get("color_analysis", {})
        to_wear = ", ".join(color_info.get("colors_to_wear", []))
        to_avoid = ", ".join(color_info.get("colors_to_avoid", []))
        desc = color_info.get("description", "")
        
        res = f"Your skin tone has a **{undertone}** undertone. Here is your style palette:\n\n"
        res += f"🎨 **Colors to Wear**: {to_wear}\n"
        res += f"❌ **Colors to Avoid**: {to_avoid}\n\n"
        res += f"💡 **Style Analysis**: {desc}\n\n"
        res += "🕶️ **Glasses Recommendation**:\n"
        for glasses in analysis.get("glasses_recommendations", []):
            res += f"- **{glasses['name']}**: {glasses['desc']}\n"
            
        return res
        
    # Intent: Accessories / Glasses
    elif any(k in msg for k in ["glasses", "sunglasses", "shades", "frame", "accessories"]):
        res = f"For an **{face_shape}** face shape, the ideal frames are designed to balance your natural proportions. Here are the recommendations:\n\n"
        for glasses in analysis.get("glasses_recommendations", []):
            res += f"- **{glasses['name']}**: {glasses['desc']}\n"
        return res
        
    # Intent: Products / Budget / Recommendations
    elif any(k in msg for k in ["product", "buy", "brand", "recommend product", "budget"]):
        glow_up = analysis.get("glow_up_plan", {})
        res = "For budget-friendly, effective choices, look for products containing active ingredients rather than premium brand names. Here are the recommendations:\n\n"
        for p in glow_up.get("products", []):
            res += f"- **{p['category']}**: *{p['type']}* — {p['why']}\n"
        res += "\n*Affordable brands to search for*: The Ordinary, CeraVe, Cetaphil, La Roche-Posay, or Paula's Choice."
        return res
        
    # Intent: Face Rating / Scores
    elif any(k in msg for k in ["rate", "score", "grade", "rating", "look", "how do i look"]):
        ratings = analysis.get("ratings", {})
        res = f"Your FaceSense AI ratings based on the scan:\n\n"
        res += f"- 🌟 **Overall Appearance Score**: {ratings.get('overall', 90)}/100\n"
        res += f"- 🧴 **Skin Health Score**: {ratings.get('skin', 90)}/100\n"
        res += f"- 👔 **Fashion & Wardrobe Score**: {ratings.get('fashion', 90)}/100\n"
        res += f"- ✂️ **Grooming & Hair Score**: {ratings.get('grooming', 90)}/100\n"
        res += f"- 💪 **Confidence Metric**: {ratings.get('confidence', 90)}/100\n\n"
        res += "To raise these scores, check out your **30-Day Glow-Up Plan** in the dashboard, focusing on hair styling, skincare consistency, and wearing clothes from your recommended personal color palette."
        return res
        
    # Default Fallback
    else:
        return (
            f"As your FaceSense AI Stylist, I've analyzed your face. Your face shape is **{face_shape}** with a **{undertone}** undertone and skin score of **{skin_score}/100**.\n\n"
            "You can ask me questions about:\n"
            "- ✂️ *Hairstyles and beard shapes* that match your face shape.\n"
            "- 🧴 *Skincare routines* and product recommendations for your skin.\n"
            "- 🎨 *Personal color palettes* and outfit colors that suit you.\n"
            "- 🕶️ *Glasses frames* that balance your facial features.\n\n"
            "What styling or skincare advice would you like to focus on next?"
        )

@app.post("/api/chat")
async def chat_assistant(req: ChatRequest):
    """Answer style, grooming, and skin questions contextually using the user's face analysis."""
    # Check for Gemini API key
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    # Construct a detailed context system prompt
    face_shape = req.analysis.get("face_shape", {}).get("name", "Oval")
    skin_score = req.analysis.get("skin_analysis", {}).get("overall_score", 90)
    undertone = req.analysis.get("color_analysis", {}).get("undertone", "Neutral")
    symmetry = req.analysis.get("symmetry", {}).get("percentage", 92)
    jawline = req.analysis.get("jawline", {}).get("sharpness", "88%")
    
    # Formulate a condensed summary of the analysis to keep token count low but high context
    analysis_context = {
        "face_shape": face_shape,
        "skin_score": skin_score,
        "undertone": undertone,
        "facial_symmetry": f"{symmetry}%",
        "jawline_sharpness": jawline,
        "recommended_colors": req.analysis.get("color_analysis", {}).get("colors_to_wear", []),
        "colors_to_avoid": req.analysis.get("color_analysis", {}).get("colors_to_avoid", []),
        "recommended_hairstyles": [h["name"] for h in req.analysis.get("hair_analysis", {}).get("hairstyles", [])[:3]],
        "beard_recommendations": [b["name"] for b in req.analysis.get("beard_recommendations", [])]
    }
    
    system_prompt = (
        f"You are FaceSense AI, a luxurious, premium AI stylist, grooming expert, and skincare dermatologist. "
        f"You are assisting a client who completed their facial scan. "
        f"Client Face Analysis: {json.dumps(analysis_context)}. "
        f"Always be encouraging, minimal, sophisticated (Apple-like), and reference their specific facial characteristics "
        f"in your answers. Suggest clear, actionable grooming, fashion, and skin routines."
    )
    
    if gemini_key:
        response = call_gemini_api(gemini_key, system_prompt, req.message, req.history)
        if response:
            return {"response": response}
            
    # Fallback to local expert rules if API fails or isn't set up
    local_response = generate_local_response(req.message, req.analysis)
    return {"response": local_response}
