'''
Example response for the NextJS backend after file parsing is complete: 
    {
        "metadata": {
            "filename": "example.docx",
            "filetype": "docx",
            "language": "en",               
            "char_count": 12345,
            "word_count": 2345
        },
        "structure": {
            "headings": 6,
            "lists": 3,
            "bold_instances": 15,
            "italic_instances": 10,
            "links": 2,
            "images": 1,
            "tables": 0,
            "footnotes": 2
        },
        "text_blocks": [
            {
            "type": "heading",
            "text": "The Rise of Renewable Energy",
            "level": 1
            },
            {
            "type": "paragraph",
            "text": "In recent years, renewable energy sources have gained popularity..."
            },
            {
            "type": "list",
            "items": ["Solar power", "Wind power", "Hydroelectric energy"]
            },
            {
            "type": "footnote",
            "text": "Source: International Energy Agency, 2022."
            }
        ]
    }
    We send data in this format to the models to perform further analysis.

    POTENTIAL MODELS and LIBRARIES TO USE: 
        textstat (reading difficulty), spaCy (overview, parts_of_speech), sentences, YAKE (keywords, topic_modeling), HuggingFace Transformers (sentiment_score)
        hugging face --> look specifically at distilbert-base-uncased-finetuned-sst-2-english
        nltk, collections 
'''

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class InputData(BaseModel):
    text: str

@app.post("/analyze")
def analyze_text(data: InputData):
    return {
        "sentiment_score": 0.82,
        "reading_level": "Grade 9"
    }


