from app.utils import basic_sentiment, calculate_readability, extract_keywords, nlp_analysis, extract_pos_distribution, extract_entities

def run_nlp_analysis(payload) -> dict:
    full_text = "\n\n".join([block.text for block in payload.text_blocks])

    # Example metrics
    doc = nlp_analysis(full_text)

    return {
        "summary": {
            "sentiment_score": basic_sentiment(full_text),
            "reading_time_minutes": round(len(full_text.split()) / 200, 2),
            "reading_level": calculate_readability(full_text),
            "total_words": payload.metadata.word_count,
            "reading_time_minutes": round(payload.metadata.word_count / 200, 2),
            "keyword_distribution": extract_keywords(doc),
            "common_entities": extract_entities(doc),
            "language_patterns": extract_pos_distribution(doc)
        },
        "structure": payload.structure,
        "filename": payload.metadata.filename
    }
