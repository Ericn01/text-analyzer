import re
import math
from collections import Counter, defaultdict
from typing import List, Dict, Any
import yake

class KeywordExtractor:
    def __init__(self):
        self.yake_extractor = yake.KeywordExtractor(
            lan="en", n=3, dedupLim=0.7, top=20
        )

    def extract_keywords(self, text: str, doc) -> Dict[str, Any]:
        spacy_keywords = self._extract_spacy_keywords(doc)
        yake_keywords = self._extract_yake_keywords(text)
        enhanced_entities = self._extract_enhanced_entities(doc)
        advanced_phrases = self._extract_dependency_phrases(doc)
        combined_keywords = self._combine_keyword_results(spacy_keywords, yake_keywords)
        
        return {
            "keywords": combined_keywords[:15],
            "key_phrases": advanced_phrases[:8],
            "named_entities": enhanced_entities[:10]
        }
    
    def _extract_spacy_keywords(self, doc) -> List[Dict[str, Any]]:
        tokens = [token for token in doc if not token.is_stop and not token.is_punct and token.is_alpha and len(token.text) > 2]
        word_freq = Counter()
        word_pos_scores = defaultdict(float)
        for token in tokens:
            lemma = token.lemma_.lower()
            word_freq[lemma] += 1
            if token.pos_ in ['NOUN', 'PROPN']: word_pos_scores[lemma] += 3.0
            elif token.pos_ == 'ADJ': word_pos_scores[lemma] += 2.0
            elif token.pos_ == 'VERB': word_pos_scores[lemma] += 1.5
            else: word_pos_scores[lemma] += 1.0
            if len(token.text) > 7: word_pos_scores[lemma] += 0.5
        keywords = []
        for word, freq in word_freq.most_common(20):
            relevance = (freq * word_pos_scores[word]) / len(tokens)
            keywords.append({
                "word": word, "frequency": freq, "relevance": round(relevance, 4),
                "weight": round(math.log(freq + 1) * word_pos_scores[word], 3),
                "pos_score": round(word_pos_scores[word], 2)
            })
        return keywords
    
    def _extract_yake_keywords(self, text: str) -> List[Dict[str, Any]]:
        try:
            yake_results = self.yake_extractor.extract_keywords(text)

            keywords = []
            for keyword, score in yake_results[:15]:
                if not isinstance(keyword, str):
                    print(f"Skipping non-string keyword: ${keyword}")
                    continue 

                relevance = 1 / (1 + score)
                word = keyword.lower()
                freq = len(re.findall(r'\b' + re.escape(keyword.lower()) + r'\b', text.lower()))
                
                keywords.append({
                    "word": word,
                    "frequency": freq,
                    "relevance": round(relevance, 4),
                    "weight": round(relevance * 10, 3),
                    "yake_score": round(score, 4)
                })
            return keywords
        except Exception as e:
            print(f"YAKE extraction failed: {e}")
            return []
    
    def _combine_keyword_results(self, spacy_keywords: List[Dict], yake_keywords: List[Dict]) -> List[Dict]:
        combined = {}
        for kw in spacy_keywords:
            word = kw['word']
            combined[word] = {"word": word, "frequency": kw['frequency'], "relevance": kw['relevance'],
                            "weight": kw['weight'], "sources": ['spacy'], "spacy_score": kw['relevance']}
        for kw in yake_keywords:
            word = kw['word']
            if word in combined:
                combined[word]['sources'].append('yake')
                combined[word]['yake_score'] = kw['relevance']
                combined[word]['weight'] = (combined[word]['weight'] + kw['weight']) / 2
                combined[word]['relevance'] = (combined[word]['relevance'] + kw['relevance']) / 2
            else:
                combined[word] = {"word": word, "frequency": kw['frequency'], "relevance": kw['relevance'],
                                "weight": kw['weight'], "sources": ['yake'], "yake_score": kw['relevance']}
        for word, data in combined.items():
            if len(data['sources']) > 1:
                data['weight'] *= 1.3
                data['relevance'] *= 1.2
        result = sorted(combined.values(), key=lambda x: x['weight'], reverse=True)
        for item in result:
            item['sources'] = ', '.join(item['sources'])
            if 'spacy_score' not in item: item['spacy_score'] = 0
            if 'yake_score' not in item: item['yake_score'] = 0
        return result
    
    def _extract_dependency_phrases(self, doc) -> List[Dict[str, Any]]:
        phrases = []
        phrase_freq = Counter()
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) >= 2 and not all(token.is_stop for token in chunk):
                phrase = chunk.text.lower().strip()
                if phrase and len(phrase) > 4: phrase_freq[phrase] += 1
        for token in doc:
            if token.pos_ == 'VERB' and not token.is_stop:
                phrase_parts = [token.lemma_.lower()]
                for child in token.children:
                    if child.dep_ in ['dobj', 'pobj', 'attr'] and not child.is_stop:
                        phrase_parts.append(child.lemma_.lower())
                if len(phrase_parts) > 1:
                    phrase = ' '.join(phrase_parts)
                    phrase_freq[phrase] += 1
        for phrase, freq in phrase_freq.most_common(10):
            phrases.append({
                "phrase": phrase, "frequency": freq,
                "relevance": round(freq / len(list(doc.noun_chunks)), 4) if list(doc.noun_chunks) else 0,
                "type": "compound" if len(phrase.split()) > 2 else "simple"
            })
        return phrases
    
    def _extract_enhanced_entities(self, doc) -> List[Dict[str, Any]]:
        entities = []
        entity_freq = Counter()
        entity_contexts = defaultdict(list)
        for ent in doc.ents:
            entity_freq[(ent.text, ent.label_)] += 1
            entity_contexts[ent.text].append(ent.sent.text[:100] + "...")
        for (entity, label), freq in entity_freq.most_common(15):
            confidence = 0.5 + min(0.3, freq * 0.1)
            if label in ['PERSON', 'ORG', 'GPE']: confidence += 0.2
            elif label in ['DATE', 'TIME', 'MONEY', 'PERCENT']: confidence += 0.1
            if entity[0].isupper(): confidence += 0.1
            entities.append({
                "entity": entity, "type": label, "frequency": freq,
                "confidence": round(min(0.95, confidence), 3),
                "contexts": entity_contexts[entity][:2]
            })
        return entities