import basic_sentiment from utils.py

def run_nlp_analysis(payload):
    full_text = "\n\n".join([block.text for block in payload.text_blocks])

    # Example metrics
    sentiment = basic_sentiment(full_text)
    reading_level = calculate_readability(full_text)

    return {
        "summary": {
            "sentiment_score": sentiment,
            "reading_level": reading_level,
            "total_words": payload.metadata.word_count,
            "reading_time_minutes": round(payload.metadata.word_count / 200, 2),
        },
        "keywords": extract_keywords(full_text),
        "language": payload.metadata.language or "undetermined"
    }
