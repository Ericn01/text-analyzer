"use client";
import { useState } from "react";
import {
    SentimentAnalysis,
    KeywordExtraction,
    TopicModeling,
    LanguagePatterns,
} from "@/types/advancedAnalytics";
import { SectionHeader } from "./Results";

type AdvancedFeaturesProps = {
    sentiment: SentimentAnalysis;
    keywords: KeywordExtraction;
    topics: TopicModeling;
    language: LanguagePatterns;
};

const AccordionItem = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
            <button
                className="w-full text-lg text-left bg-[#f8f9ff] px-5 py-4 font-semibold hover:bg-[#eef2ff] transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
            </button>
            {isOpen && <div className="p-4 bg-white">{children}</div>}
        </div>
    );
};

const SentimentSection = ({ data }: { data: SentimentAnalysis }) => (
    <div className="space-y-2">
        <p><strong>Overall Sentiment:</strong> {data.overall_sentiment.label} ({(data.overall_sentiment.score * 100).toFixed(1)}%)</p>
        <p><strong>Confidence:</strong> {(data.overall_sentiment.confidence * 100).toFixed(1)}%</p>
        <p><strong>Description:</strong> {data.description}</p>

        <h4 className="font-semibold mt-4">Distribution:</h4>
        <ul className="list-disc pl-5">
        {Object.entries(data.sentiment_distribution).map(([type, val]) => (
            <li key={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)} — {val.percentage}% ({val.sentences} sentences)
            </li>
        ))}
        </ul>

        <h4 className="font-semibold mt-4">Emotional Tone:</h4>
        <ul className="grid grid-cols-2 gap-x-6 list-disc pl-5">
        {Object.entries(data.emotional_tone).map(([emotion, val]) => (
            <li key={emotion}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}: {(val * 100).toFixed(1)}%</li>
        ))}
        </ul>
    </div>
);

const KeywordsSection = ({ data }: { data: KeywordExtraction }) => (
    <div className="space-y-4">
        <div>
        <h4 className="font-semibold">Top Keywords:</h4>
        <ul className="list-disc pl-5">
            {data.keywords.map((kw, i) => (
            <li key={i}>
                {kw.word} (Score: {kw.score}, Frequency: {kw.frequency})
            </li>
            ))}
        </ul>
        </div>

        <div>
        <h4 className="font-semibold">Key Phrases:</h4>
        <ul className="list-disc pl-5">
            {data.key_phrases.map((phrase, i) => (
            <li key={i}>
                {phrase.phrase} (Frequency: {phrase.frequency})
            </li>
            ))}
        </ul>
        </div>

        <div>
        <h4 className="font-semibold">Named Entities:</h4>
        <ul className="list-disc pl-5">
            {data.named_entities.map((entity, i) => (
            <li key={i}>
                {entity.entity} — {entity.type} (Frequency: {entity.frequency})
            </li>
            ))}
        </ul>
        </div>
    </div>
);

const TopicsSection = ({ data }: { data: TopicModeling }) => (
    <div className="space-y-4">
        <div>
        <h4 className="font-semibold">Primary Topics:</h4>
        <ul className="list-disc pl-5 space-y-2">
            {data.primary_topics.map(topic => (
            <li key={topic.id}>
                <strong>{topic.name}</strong> — {topic.percentage}%<br />
                <span className="text-sm text-gray-700">Keywords: {topic.keywords.join(", ")}</span><br />
                <span className="text-sm text-gray-700">Description: {topic.description}</span>
            </li>
            ))}
        </ul>
        </div>

        <div>
        <h4 className="font-semibold">Topic Evolution:</h4>
        <ul className="list-disc pl-5">
            {data.topic_evolution.map((evo, i) => (
            <li key={i}>
                <strong>{evo.topic}</strong> — Paragraphs {evo.paragraph_range} (Intensity: {(evo.intensity * 100).toFixed(0)}%)
            </li>
            ))}
        </ul>
        </div>

        <p><strong>Coherence Score:</strong> {data.topic_coherence_score}</p>
    </div>
);

const LanguagePatternsSection = ({ data }: { data: LanguagePatterns }) => (
    <div className="space-y-4">
        <div>
        <h4 className="font-semibold">Complexity Metrics:</h4>
        <ul className="list-disc pl-5">
            <li>Average Syllables per Word: {data.complexity_metrics.average_syllables_per_word}</li>
            <li>Polysyllabic Words: {data.complexity_metrics.polysyllabic_words}</li>
            <li>Technical Terms: {data.complexity_metrics.technical_terms}</li>
            <li>Passive Voice Usage: {data.complexity_metrics.passive_voice_percentage}%</li>
        </ul>
        </div>

        <div>
        <h4 className="font-semibold">Stylistic Features:</h4>
        <ul className="list-disc pl-5">
            <li>Formal Language Score: {data.stylistic_features.formal_language_score}</li>
            <li>Academic Tone Score: {data.stylistic_features.academic_tone_score}</li>
            <li>Objectivity Score: {data.stylistic_features.objectivity_score}</li>
            <li>Clarity Score: {data.stylistic_features.clarity_score}</li>
        </ul>
        </div>
    </div>
);

const ModelFeatures = ({
    sentiment,
    keywords,
    topics,
    language,
}: AdvancedFeaturesProps) => {
    return (
        <article className="max-w-4xl mx-auto mt-10 px-4">
            <SectionHeader sectionName="Advanced Features" />

            <AccordionItem title="Sentiment Analysis">
                <SentimentSection data={sentiment} />
            </AccordionItem>

            <AccordionItem title="Keyword Extraction">
                <KeywordsSection data={keywords} />
            </AccordionItem>

            <AccordionItem title="Topic Modeling">
                <TopicsSection data={topics} />
            </AccordionItem>

            <AccordionItem title="Language Patterns">
                <LanguagePatternsSection data={language} />
            </AccordionItem>
            </article>
    );
};

export default ModelFeatures;
