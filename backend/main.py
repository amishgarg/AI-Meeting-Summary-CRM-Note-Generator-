# main.py (Updated with a more robust prompt)

import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

# --- Configuration ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_APP_PASSWORD = os.getenv("SENDER_APP_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")

genai.configure(api_key=GOOGLE_API_KEY)

# --- Pydantic Models for Structured Data ---
class Objection(BaseModel):
    point: str
    resolution: Optional[str] = None

class MeetingAnalysis(BaseModel):
    summary: str = Field(description="A concise summary of the meeting.")
    objections: List[Objection] = Field(description="List of client objections or pain points and their resolutions.")
    action_items: List[str] = Field(description="A list of clear action items or next steps.")

# --- FastAPI App Initialization ---
app = FastAPI(
    title="AI Meeting Summary (Google Gemini)",
    description="An API to summarize meeting transcripts and extract key insights using Gemini.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI Helper Function ---
def analyze_transcript_with_gemini(transcript: str) -> MeetingAnalysis:
    model = genai.GenerativeModel('gemini-1.5-flash')
    generation_config = genai.types.GenerationConfig(response_mime_type="application/json")
    
    # --- UPDATED PROMPT ---
    prompt = f"""
    You are an expert assistant. Your task is to analyze the following meeting transcript and provide a response ONLY in a valid JSON format.

    The JSON object MUST have these exact top-level keys: "summary", "objections", "action_items".
    - "summary": A concise summary of the meeting.
    - "objections": A list of objects, where each object has a "point" and a "resolution". If no objections are found, this MUST be an empty list: [].
    - "action_items": A list of strings. If no action items are found, this MUST be an empty list: [].

    It is critical that the final output is ONLY the JSON object and that all keys are present.

    Here is the transcript:
    ---
    {transcript}
    ---
    """

    try:
        response = model.generate_content(prompt, generation_config=generation_config)
        return json.loads(response.text)
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze transcript with AI model.")

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"status": "Google Gemini API backend is running."}

@app.post("/api/v1/process/transcript", response_model=MeetingAnalysis)
async def process_transcript(file: UploadFile = File(...)):
    if file.content_type != "text/plain":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .txt file.")
    contents = await file.read()
    transcript = contents.decode("utf-8")
    return analyze_transcript_with_gemini(transcript)

@app.post("/api/v1/email/summary")
async def email_summary(analysis: MeetingAnalysis):
    if not all([SENDER_EMAIL, SENDER_APP_PASSWORD, RECEIVER_EMAIL]):
        raise HTTPException(status_code=500, detail="Email credentials are not configured on the server.")
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "AI-Generated Meeting Summary"
    message["From"] = SENDER_EMAIL
    message["To"] = RECEIVER_EMAIL

    html = f"""
    <html>
    <body>
        <h2>Meeting Summary</h2>
        <p>{analysis.summary}</p>
        <h2>Objections & Pain Points</h2>
        <ul>
            {"".join(f"<li><b>Objection:</b> {obj.point}<br><b>Resolution:</b> {obj.resolution or 'N/A'}</li>" for obj in analysis.objections)}
        </ul>
        <h2>Action Items</h2>
        <ul>
            {"".join(f"<li>{item}</li>" for item in analysis.action_items)}
        </ul>
    </body>
    </html>
    """
    message.attach(MIMEText(html, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, message.as_string())
        server.quit()
        return {"message": "Email sent successfully!"}
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")