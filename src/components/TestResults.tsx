'use client'

import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const AnalysisResult = () => {
    const [analysis, setAnalysis] = useState<any>(null);
    useEffect(() => {
        const stored = sessionStorage.getItem('analysisResult');
        if (stored) {
            try {
                setAnalysis(JSON.parse(stored));
            } catch (err) {
                console.error('Failed to parse analysis from sessionStorage:', err);
            }
        }
    }, []);

    if (!analysis) return <p className="p-4 text-black">Loading analysis data...</p>;

    const {
        metadata,
        timestamp,
        processingTimeMs,
        analysisId,
        basicAnalysisData,
        nlpAnalysisData,
        filename,
        fileSize
    } = analysis;

    const visual = basicAnalysisData?.visual_analytics || {};

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 text-black/80">
            <h1 className="text-3xl font-bold">📊 Document Analysis Summary</h1>

            <section>
                <h2 className="text-xl font-semibold mb-2">📄 File Info</h2>
                <ul className="list-disc list-inside">
                    <li><strong>Filename:</strong> {filename}</li>
                    <li><strong>Type:</strong> {metadata?.type}</li>
                    <li><strong>Size:</strong> {(fileSize / 1024).toFixed(1)} KB</li>
                    <li><strong>Uploaded:</strong> {new Date(metadata?.uploadedAt).toLocaleString()}</li>
                    <li><strong>Processed In:</strong> {processingTimeMs} ms</li>
                    <li><strong>Timestamp:</strong> {timestamp}</li>
                </ul>
            </section>

            {/* Structure */}
            <section>
                <h2 className="text-xl font-semibold mb-2">📐 Document Structure</h2>
                <ul className="list-disc list-inside">
                    {Object.entries(basicAnalysisData?.basic_analytics?.structure || {}).map(([key, val]) => (
                        <li key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {val}</li>
                    ))}
                </ul>
            </section>

            {/* Readability */}
            <section>
                <h2 className="text-xl font-semibold mb-2">📚 Readability Scores</h2>
                <ul className="list-disc list-inside">
                    {Object.entries(basicAnalysisData?.basic_analytics?.readability || {}).map(([key, val]: any) => (
                        <li key={key}>
                            <strong>{key.replace(/_/g, ' ')}:</strong> {val.score} ({val.description}, {val.percentage}%)
                        </li>
                    ))}
                </ul>
            </section>

            {/* Sentiment */}
            <section>
                <h2 className="text-xl font-semibold mb-2">💬 Sentiment</h2>
                {nlpAnalysisData?.sentiment_analysis && (
                    <>
                        <p><strong>Overall:</strong> {nlpAnalysisData.sentiment_analysis.overall_sentiment.label} ({nlpAnalysisData.sentiment_analysis.overall_sentiment.score})</p>
                        <p><strong>Confidence:</strong> {nlpAnalysisData.sentiment_analysis.overall_sentiment.confidence}</p>
                        <p>{nlpAnalysisData.sentiment_analysis.description}</p>
                    </>
                )}
            </section>

            <section>
                <h2 className="text-xl font-semibold mt-4 mb-2">🗝️ Keywords</h2>
                {(nlpAnalysisData?.keyword_extraction?.keywords || []).map((kw: any) => (
                    <p key={kw.word}><strong>{kw.word}</strong> — freq: {kw.frequency}, rel: {kw.relevance.toFixed(2)}</p>
                ))}
            </section>

            <section>
                <h2 className="text-xl font-semibold mt-4 mb-2">🧠 Topics</h2>
                {(nlpAnalysisData?.topic_modeling?.primary_topics || []).map((topic: any) => (
                    <div key={topic.id}>
                        <p><strong>{topic.name}</strong> ({topic.percentage}%)</p>
                        <p>Keywords: {topic.keywords.join(', ')}</p>
                        <p>Description: {topic.description}</p>
                    </div>
                ))}
            </section>

            <section>
                <h2 className="text-xl font-semibold mt-4 mb-2">🧬 Language Patterns</h2>
                {nlpAnalysisData?.language_patterns?.complexity_metrics && (
                    <>
                        {Object.entries(nlpAnalysisData.language_patterns.complexity_metrics).map(([key, val]) => (
                            <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {val}</p>
                        ))}
                        {Object.entries(nlpAnalysisData.language_patterns.stylistic_features).map(([key, val]) => (
                            <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {val}</p>
                        ))}
                    </>
                )}
            </section>

            {/* Visual Analytics */}
            <section>
                <h2 className="text-xl font-semibold mb-4">🎨 Visual Analytics</h2>

                {/* Word Frequency */}
                {visual?.wordFrequency?.chart_data && (
                    <div>
                        <h3 className="font-semibold mb-2">Top Words</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={visual.wordFrequency.chart_data}>
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Word Length Distribution */}
                {visual?.wordLengthDistribution?.chart_data && (
                    <div>
                        <h3 className="font-semibold mt-6 mb-2">Word Length Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={visual.wordLengthDistribution.chart_data}>
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Sentence Length Trends */}
                {visual?.sentenceLengthTrends?.chart_data && (
                    <div>
                        <h3 className="font-semibold mt-6 mb-2">Sentence Length Trends</h3>
                        <p className="mb-2">Average: {visual.sentenceLengthTrends.average_length}</p>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={visual.sentenceLengthTrends.chart_data}>
                                <XAxis dataKey="x" label={{ value: 'Sentence', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: 'Length', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="y" stroke="#ff7300" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Parts of Speech */}
                {visual?.partsOfSpeech?.chart_data && (
                    <div>
                        <h3 className="font-semibold mt-6 mb-2">Parts of Speech</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={visual.partsOfSpeech.chart_data}
                                    dataKey="value"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {visual.partsOfSpeech.chart_data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AnalysisResult;
