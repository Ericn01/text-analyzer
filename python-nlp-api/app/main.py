from fastapi import FastAPI, HTTPException
from analysis import EnhancedNLPAnalyzer
import uvicorn

app = FastAPI()

@app.post("/analyze")
def analyze_text(text):
    if len(text) < 50:
        raise HTTPException(status_code=400, detail="File too short for NLP analysis (minimum 50 words).")
    
    nlp = EnhancedNLPAnalyzer()
    results = nlp.analyze_text(text)
    return results

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)