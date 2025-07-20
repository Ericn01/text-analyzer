import textstat
from textblob import TextBlob
import spacy
from collections import Counter

nlp = spacy.load("en_core_web_sm")

def nlp_analysis(text):
    return nlp(text)

def basic_sentiment(text):
    return round(TextBlob(text).sentiment.polarity, 3)

def extract_keywords(doc):
    words = [token.lemma_.lower() for token in doc if token.is_alpha and not token.is_stop]
    freq = Counter(words)
    return dict(freq.most_common(10))

def extract_entities(doc):
    entity_types = ['PERSON', 'ORG', 'GPE', 'PRODUCT']
    entities = [ent.text for ent in doc.ents if ent.label_ in entity_types]
    return dict(Counter(entities).most_common(5))

def extract_pos_distribution(doc):
    pos_counts = Counter([token.pos_ for token in doc])
    total = sum(pos_counts.values())
    return {pos: round(count / total, 3) for pos, count in pos_counts.items()}

