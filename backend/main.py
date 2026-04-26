# backend/main.py
# BIOF3003 Chatbot

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: dict

client = OpenAI(base_url="http://localhost:11434/v1/", api_key='ollama')

@app.post("/api/chat")
async def chat(request: ChatRequest):
    ctx = request.context or {}
    last = ctx.get('lastSession') or {}
    
    # LEVEL 1: Strict Data Validation
    # If HRV is missing, 0, or None, flag it as NULL
    hrv = last.get('lastAvgHRV')
    is_valid = hrv is not None and str(hrv).isdigit() and int(hrv) > 0
    
    status_flag = "VALID_DATA_AVAILABLE" if is_valid else "NO_SESSION_DATA_EXISTENT"

    full_user_message = f"""
    [SYSTEM CONTROL]
    DATA_STATUS: {status_flag}
    
    [USER PROFILE]
    Name: {ctx.get('userProfile', {}).get('username')}
    Goal: {ctx.get('userProfile', {}).get('goals')}
    
    [SESSION DATA]
    HRV: {hrv if is_valid else 'N/A'}
    Stress Level: {last.get('lastStressLevel') if is_valid else 'N/A'}
    
    [USER MESSAGE]
    {request.message}
    """

    system_prompt = """
    You are a wellness coach. You follow STRICT factual rules:
    
    1. IF DATA_STATUS IS 'NO_SESSION_DATA_EXISTENT':
       - You MUST NOT mention any numbers, HRV values, or stress scores.
       - You MUST NOT say 'I see your HRV is...'.
       - Say: "I don't have your session data yet! Please start a recording session on the dashboard so I can help."
       - Give ONE tip: "Try rolling your shoulders or taking 3 deep breaths."

    2. IF DATA_STATUS IS 'VALID_DATA_AVAILABLE':
       - Use ONLY the provided numbers.
       - If stress is high (>70), suggest Physiological Sigh.
       - If moderate (40-70), suggest Box Breathing.

    3. DO NOT use placeholder numbers like '50ms' or '60bpm' if they are not in the message.
    4. Keep it under 100 words.
    5. End with: "This is not medical advice."
    """

    try:
        completion = client.chat.completions.create(
            model="qwen2.5:7b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_user_message}
            ],
            temperature=0.1, # Lower temperature = less hallucination
        )
        return {"reply": completion.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)