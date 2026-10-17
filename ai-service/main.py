import os
import random
import hashlib
import base64
from io import BytesIO
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"

app = FastAPI(
    title="CivicPulse AI Microservice",
    description="AI-powered civic issue analysis engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Data models ──────────────────────────────────────────────────────────────

class TextAnalysisRequest(BaseModel):
    description: str
    title: str
    location: Optional[str] = ""
    category: Optional[str] = ""

class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    location: Optional[str] = ""
    existing_issues: Optional[List[dict]] = []

class VerificationRequest(BaseModel):
    issue_id: str
    before_description: str
    after_description: Optional[str] = ""
    before_image_base64: Optional[str] = None
    after_image_base64: Optional[str] = None

class PriorityRequest(BaseModel):
    title: str
    description: str
    category: str
    location: Optional[str] = ""
    reported_count: Optional[int] = 1
    days_open: Optional[int] = 0

# ── Mock AI helpers ───────────────────────────────────────────────────────────

CATEGORIES = [
    "Pothole", "Garbage", "Drainage", "Streetlight",
    "Water Leakage", "Road Damage", "Fallen Tree",
    "Broken Footpath", "Traffic Signal", "Encroachment"
]

DEPARTMENTS = {
    "Pothole": "Roads & Infrastructure",
    "Garbage": "Sanitation Department",
    "Drainage": "Water & Sewage Board",
    "Streetlight": "Electricity Department",
    "Water Leakage": "Water & Sewage Board",
    "Road Damage": "Roads & Infrastructure",
    "Fallen Tree": "Parks & Environment",
    "Broken Footpath": "Roads & Infrastructure",
    "Traffic Signal": "Traffic Management Cell",
    "Encroachment": "Urban Planning Department",
}

SEVERITY_KEYWORDS = {
    "critical": ["dangerous", "accident", "injury", "flood", "collapse", "severe", "urgent", "emergency"],
    "high": ["major", "large", "many", "overflow", "deep", "broken", "damage"],
    "medium": ["moderate", "several", "partial", "leaking", "flickering"],
    "low": ["minor", "small", "slight", "occasional"],
}

AI_INSIGHTS = [
    "High clustering of reports detected in the northeast quadrant — suggest targeted inspection drive.",
    "Streetlight failures often precede increase in road accidents — escalation recommended.",
    "Drainage issues spike during monsoon — predictive maintenance advised for Q3.",
    "Water leakage reports correlate with aging pipeline zones — infrastructure audit suggested.",
    "Garbage accumulation peaks on weekends — adjust collection schedule accordingly.",
    "Pothole reports cluster near school zones — priority safety intervention needed.",
    "Response time for Roads & Infrastructure has improved by 18% this month.",
    "SLA breach risk detected for 7 open issues older than 10 days.",
]


def _seed(text: str) -> int:
    return int(hashlib.md5(text.encode()).hexdigest(), 16) % 1000


def _detect_category(title: str, description: str) -> str:
    combined = (title + " " + description).lower()
    for cat in CATEGORIES:
        if cat.lower().split()[0] in combined:
            return cat
    keyword_map = {
        "hole": "Pothole", "pit": "Pothole",
        "waste": "Garbage", "trash": "Garbage", "litter": "Garbage",
        "drain": "Drainage", "sewer": "Drainage", "flood": "Drainage",
        "light": "Streetlight", "lamp": "Streetlight",
        "water": "Water Leakage", "pipe": "Water Leakage",
        "road": "Road Damage", "crack": "Road Damage",
        "tree": "Fallen Tree", "branch": "Fallen Tree",
        "footpath": "Broken Footpath", "pavement": "Broken Footpath",
        "signal": "Traffic Signal", "traffic": "Traffic Signal",
    }
    for kw, cat in keyword_map.items():
        if kw in combined:
            return cat
    return "Other"


def _detect_severity(description: str) -> str:
    desc_lower = description.lower()
    for level, keywords in SEVERITY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return level
    return "medium"


def _priority_score(title: str, description: str, category: str,
                    reported_count: int = 1, days_open: int = 0) -> int:
    s = _seed(title + description)
    base = 30 + (s % 40)
    severity = _detect_severity(description)
    severity_bonus = {"critical": 30, "high": 20, "medium": 10, "low": 0}[severity]
    report_bonus = min(reported_count * 2, 15)
    age_bonus = min(days_open, 10)
    score = min(100, base + severity_bonus + report_bonus + age_bonus)
    return score


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "mock_mode": MOCK_MODE, "version": "1.0.0"}


@app.post("/api/ai/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """Classify uploaded image and extract issue details."""
    contents = await file.read()
    seed_val = _seed(file.filename or "image")
    category = CATEGORIES[seed_val % len(CATEGORIES)]
    severity = ["low", "medium", "high", "critical"][seed_val % 4]
    confidence = round(0.70 + (seed_val % 28) / 100, 2)
    return {
        "category": category,
        "severity": severity,
        "confidence": confidence,
        "department": DEPARTMENTS.get(category, "General Administration"),
        "description_suggestion": (
            f"AI detected a {severity} severity {category.lower()} issue. "
            f"Immediate attention {'required' if severity in ['high', 'critical'] else 'recommended'}."
        ),
        "priority_score": _priority_score("", category, category),
        "objects_detected": [category, "road", "infrastructure"],
        "mock": True,
    }


@app.post("/api/ai/analyze-text")
async def analyze_text(req: TextAnalysisRequest):
    """Analyze issue text and return structured AI insights."""
    category = req.category if req.category and req.category != "Other" else _detect_category(req.title, req.description)
    severity = _detect_severity(req.description)
    score = _priority_score(req.title, req.description, category)
    dept = DEPARTMENTS.get(category, "General Administration")
    spam_seed = _seed(req.description)
    spam_score = round((spam_seed % 15) / 100, 2)
    return {
        "detected_category": category,
        "severity": severity,
        "priority_score": score,
        "department_recommendation": dept,
        "spam_probability": spam_score,
        "is_spam": spam_score > 0.10,
        "language_detected": "en",
        "sentiment": "negative" if score > 50 else "neutral",
        "keywords": req.description.lower().split()[:5],
        "suggested_title": f"{severity.title()} {category} Issue – {req.location or 'Location Unknown'}",
        "confidence": round(0.75 + (score % 20) / 100, 2),
        "mock": True,
    }


@app.post("/api/ai/check-duplicate")
async def check_duplicate(req: DuplicateCheckRequest):
    """Check if a new report is duplicate of existing issues."""
    duplicates = []
    for issue in (req.existing_issues or []):
        sim_seed = _seed(req.title + str(issue.get("title", "")))
        similarity = round(0.1 + (sim_seed % 60) / 100, 2)
        if similarity > 0.65:
            duplicates.append({
                "issue_id": issue.get("_id", issue.get("id", "unknown")),
                "title": issue.get("title", ""),
                "similarity_score": similarity,
            })
    is_duplicate = len(duplicates) > 0
    return {
        "is_duplicate": is_duplicate,
        "duplicate_probability": round(max([d["similarity_score"] for d in duplicates], default=0), 2),
        "similar_issues": duplicates[:3],
        "recommendation": "merge" if is_duplicate else "create",
        "mock": True,
    }


@app.post("/api/ai/calculate-priority")
async def calculate_priority(req: PriorityRequest):
    """Calculate AI-based priority score for an issue."""
    score = _priority_score(req.title, req.description, req.category,
                            req.reported_count, req.days_open)
    severity = _detect_severity(req.description)
    level = (
        "critical" if score >= 80 else
        "high" if score >= 60 else
        "medium" if score >= 40 else
        "low"
    )
    return {
        "priority_score": score,
        "priority_level": level,
        "severity": severity,
        "estimated_resolution_days": {"critical": 1, "high": 3, "medium": 7, "low": 14}[level],
        "sla_deadline_hours": {"critical": 24, "high": 72, "medium": 168, "low": 336}[level],
        "factors": {
            "severity_weight": 0.4,
            "frequency_weight": 0.3,
            "location_weight": 0.2,
            "age_weight": 0.1,
        },
        "mock": True,
    }


@app.post("/api/ai/verify-resolution")
async def verify_resolution(req: VerificationRequest):
    """Verify if a civic issue has been resolved using before/after comparison."""
    seed_val = _seed(req.issue_id + req.after_description)
    resolved = seed_val % 3 != 0
    confidence = round(0.60 + (seed_val % 35) / 100, 2)
    return {
        "is_resolved": resolved,
        "confidence": confidence,
        "resolution_quality": ["poor", "acceptable", "good", "excellent"][seed_val % 4],
        "verification_notes": (
            "AI analysis confirms issue has been addressed. Visual comparison shows significant improvement."
            if resolved else
            "AI analysis indicates the issue may not be fully resolved. Further inspection recommended."
        ),
        "trust_score": round(confidence * 0.9, 2),
        "mock": True,
    }


@app.get("/api/ai/insights")
async def get_insights(limit: int = 5):
    """Return AI-generated predictive civic insights."""
    selected = random.sample(AI_INSIGHTS, min(limit, len(AI_INSIGHTS)))
    return {
        "insights": [
            {
                "id": i + 1,
                "text": insight,
                "category": random.choice(CATEGORIES),
                "confidence": round(0.70 + random.random() * 0.25, 2),
                "generated_at": "2024-01-15T10:00:00Z",
            }
            for i, insight in enumerate(selected)
        ],
        "total": len(selected),
        "mock": True,
    }


@app.post("/api/ai/detect-language")
async def detect_language(req: TextAnalysisRequest):
    """Detect language of submitted text."""
    tamil_chars = any('\u0B80' <= c <= '\u0BFF' for c in req.description)
    hindi_chars = any('\u0900' <= c <= '\u097F' for c in req.description)
    lang = "ta" if tamil_chars else "hi" if hindi_chars else "en"
    lang_names = {"en": "English", "ta": "Tamil", "hi": "Hindi"}
    return {
        "language_code": lang,
        "language_name": lang_names.get(lang, "English"),
        "confidence": 0.95,
        "mock": True,
    }
