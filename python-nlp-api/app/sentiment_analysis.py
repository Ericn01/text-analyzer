from transformers import pipeline
import nltk
import text2emotion as te
from typing import List, Dict
import statistics
from collections import defaultdict

# Load sentiment pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

def analyze_sentiment(text: str) -> Dict:
    sentences = nltk.sent_tokenize(text)
    total = len(sentences)

    pos, neu, neg = 0, 0, 0
    sentence_scores = []

    for sentence in sentences:
        result = sentiment_pipeline(sentence)[0]
        label = result['label']
        stars = int(label.split()[0])  # e.g., "4 stars"

        # Convert stars to sentiment
        if stars >= 4:
            pos += 1
            sentiment_score = 1
        elif stars == 3:
            neu += 1
            sentiment_score = 0
        else:
            neg += 1
            sentiment_score = -1

        sentence_scores.append(sentiment_score)

    # Overall Sentiment Score: mean of -1, 0, +1
    avg_score = statistics.mean(sentence_scores)
    percentage_score = (avg_score + 1) * 50  # map from [-1, 1] to [0, 100]

    if avg_score > 0.2:
        label = "Positive"
    elif avg_score < -0.2:
        label = "Negative"
    else:
        label = "Neutral"

    overall = {
        "score": round(avg_score, 2),
        "label": label,
        "percentage": round(percentage_score, 2),
        "confidence": 1.0  # placeholder, since pipeline does not return full text confidence
    }

    sentiment_distribution = {
        "positive": {
            "percentage": round(pos / total * 100, 1),
            "sentences": pos
        },
        "neutral": {
            "percentage": round(neu / total * 100, 1),
            "sentences": neu
        },
        "negative": {
            "percentage": round(neg / total * 100, 1),
            "sentences": neg
        }
    }


    description = f"The text is mostly {label.lower()}, with {sentiment_distribution[label.lower()]['percentage']}% of sentences classified as such."

    return {
        "overall_sentiment": overall,
        "sentiment_distribution": sentiment_distribution,
        "emotional_tone": "happy",
        "description": description
    }


def get_emotion(text):
     # Emotional tone
    emotion_scores = te.get_emotion(text)

    emotional_tone = {
        "joy": round(emotion_scores.get("Happy", 0) * 100, 1),
        "anger": round(emotion_scores.get("Angry", 0) * 100, 1),
        "fear": round(emotion_scores.get("Fear", 0) * 100, 1),
        "sadness": round(emotion_scores.get("Sad", 0) * 100, 1),
        "surprise": round(emotion_scores.get("Surprise", 0) * 100, 1),
        "disgust": 0.0  # Not directly available from text2emotion
    }

text = """

"""

result = analyze_sentiment(text)
print(result)