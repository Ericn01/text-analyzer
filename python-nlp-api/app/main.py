from fastapi import FastAPI, HTTPException
from analysis import EnhancedNLPAnalyzer

app = FastAPI()

@app.post("/analyze")
def analyze_text(payload):
    if payload.metadata.word_count < 50:
        raise HTTPException(status_code=400, detail="File too short for NLP analysis (minimum 50 words).")
    
    nlp = EnhancedNLPAnalyzer()
    results = nlp.analyze_text(payload)
    return results



