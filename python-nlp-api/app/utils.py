import textstat
from textblob import TextBlob

def basic_sentiment(text):
    return round(TextBlob(text).sentiment.polarity, 3)

def calculate_readability(text):
    return textstat.flesch_reading_ease(text)

def extract_keywords(text, top_n=10):
    # Placeholder: replace with RAKE, YAKE, or custom TF-IDF
    words = [w for w in text.split() if len(w) > 4]
    return list(set(words))[:top_n]
