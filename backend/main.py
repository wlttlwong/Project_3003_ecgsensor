# backend/main.py
# BIOF3003 Chatbot

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI(title="BIOF3003 Chatbot API")

# Allow Next.js frontend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: dict # userProfile, currentSession, recentSession, weeklyInsight

client = OpenAI(
    base_url="http://localhost:11434/v1/",
    api_key='ollama'
)

@app.post("/api/chat")
async def chat(request: ChatRequest):

    context = request.context or {}

    full_user_message = f"""
    Here is the current reat data from your app:

    User Profile: {context.get('userProfile', {})}
    Current Session: {context.get('currentSession', {})}
    Recent Sessions: {context.get('recentSessions', [])}
    Weekly Insight: {context.get('weeklyInsight', {})}

    User question: {request.message}
    """

    system_prompt = """
    You are a calm, practical wellness coach for a wearable ECG + heart rate stress detection app.

    You are given real user data every time. Use ONLY this data. Never invent numbers, triggers, or situations.

    Available data:
    - userProfile: age, stressTriggers, goals
    - currentSession: avgHR, avgHRV, stressLevel, durationMinutes
    - recentSessions (if any)
    - weeklyInsight (if any)

    Rules:
    - Be honest and direct. If stressLevel is "low" or no session data, say so.
    - Never assume a trigger unless it is clearly in stressTriggers.
    - Give SHORT, actionable advice (max 120-150 words).
    - Suggest DIFFERENT techniques based on the situation. Rotate between these options:

    Breathing / Relaxation:
    - Box breathing (4-4-4-4)
    - 4-7-8 breathing (use only when stressLevel is high or rising)
    - Physiological sigh (double inhale + long exhale)
    - 2-minute slow breathing (6 breaths per minute)

    Physical / Movement:
    - 5-minute walk or stretch
    - Progressive muscle relaxation (tense & release)
    - Shoulder rolls + neck stretches

    Mental / Quick:
    - 5-4-3-2-1 grounding technique
    - Gratitude list (name 3 things)
    - Cold water on wrists/face
    - Listen to calming music or nature sounds

    - Link advice to the user's goals and current stats. Example: "Your HRV of 50 indicates moderate stress. Since your goal is to release stress, try box breathing for 2 minutes."
    - End with a gentle encouragement and remind: "This is not medical advice. Consult a doctor if needed."

    Always stay supportive and positive.
    """
   
    try:
        completion = client.chat.completions.create(
            model="qwen2.5:7b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            temperature=0.6,
            max_tokens=400
        )
        reply = completion.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating response: {error_msg}")
        return {"error": f"DeepSeek API Error: {error_msg[:300]}"}
    
if __name__ == "__main__":
    import uvicorn
    print("Chatbot running on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
