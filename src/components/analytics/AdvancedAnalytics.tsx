"use client";
import { useState } from "react";
import {
    SentimentAnalysis,
    KeywordExtraction,
    TopicModeling,
    LanguagePatterns,
    NLPReadingLevel,
    ProcessedTextStats
} from "../../../types/advancedAnalytics";
import { SectionHeader } from "./Results";
import TextStats from "./TextStats";
import SentimentSection from "./nlpComponents/SentimentAnalysis";
import KeywordsSection from "./nlpComponents/KeywordsSection";

type AdvancedFeaturesProps = {
    sentiment: SentimentAnalysis;
    keywords: KeywordExtraction;
    topics: TopicModeling;
    language: LanguagePatterns;
    readability: NLPReadingLevel;
    textStats: ProcessedTextStats | undefined;
};

const AccordionItem = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border border-gray-300 rounded-lg mb-4 overflow-hidden `}>
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

const ReadabilitySection = ({data} : {data : NLPReadingLevel}) => {
    const {difficulty_score, description, method} = data;
    return (
        <div className="space-y-4">
            <div>
            <h4 className="font-semibold">Readability Data:</h4>
            <ul className="list-disc pl-5">
                <li>NLP Reading Difficulty Score: {difficulty_score}</li>
                <li>Description: {description}</li>
                <li> {method} </li>
            </ul>
            </div>
        </div>
    );
}

const ModelFeatures = ({
    sentiment,
    keywords,
    topics,
    language,
    readability,
    textStats
}: AdvancedFeaturesProps) => {
    return (
        <article id="advanced" className="max-w-4xl mx-auto mt-10 px-4">
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

            <AccordionItem title="Text Readability Analysis">
                <ReadabilitySection data={readability} />
            </AccordionItem>

            {textStats && (
                <TextStats stats={textStats} />
            )}
        </article>
    );
};

export default ModelFeatures;
