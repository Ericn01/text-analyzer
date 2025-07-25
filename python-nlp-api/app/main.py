from fastapi import FastAPI, HTTPException
from analysis import NLPAnalyzer
from pydantic import BaseModel
import uvicorn

class TextRequest(BaseModel):
    text: str

app = FastAPI()

@app.post("/analyze")
def analyze_text(req: TextRequest):
    if len(req.text) < 100:
        raise HTTPException(status_code=400, detail="File too short for NLP analysis (minimum 100 words).")
    
    nlp = NLPAnalyzer()
    results = nlp.analyze_text(req.text)
    return results

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)