"use client";
import { useState } from "react";
import { KeywordExtraction } from "../../../../types/advancedAnalytics";
import { chartColors, createPieOptions } from "@/lib/utils/chartStyles";
import { createBarOptions } from "@/lib/utils/chartStyles";
import { Bar, Doughnut } from "react-chartjs-2";

const KeywordsSection = ({ data } : { data: KeywordExtraction}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const namedEntitiesNoNumbers = data.named_entities.filter(entity => isNaN(parseInt(entity.entity)));

  // Prepare chart data
  const keywordsChartData = {
    labels: data.keywords.slice(0, 6).map(kw => kw.word),
    datasets: [{
      data: data.keywords.slice(0, 6).map(kw => kw.score),
      backgroundColor: chartColors.primary.blue.bg,
      borderColor: chartColors.primary.blue.border,
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    }]
  };

  const phrasesChartData = {
    labels: data.key_phrases.slice(0, 5).map(p => p.phrase),
    datasets: [{
      data: data.key_phrases.slice(0, 5).map(p => p.frequency),
      backgroundColor: chartColors.multiColor.backgrounds,
      borderColor: chartColors.multiColor.borders,
      borderWidth: 2
    }]
  };

  const entitiesChartData = {
    labels: namedEntitiesNoNumbers.slice(0, 6).map(e => e.entity),
    datasets: [{
      data: namedEntitiesNoNumbers.slice(0, 6).map(e => e.frequency),
      backgroundColor: chartColors.primary.green.bg,
      borderColor: chartColors.primary.green.border,
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    }]
  };

    const TabButton = ({ id, label, active, onClick }) => (
        <button
        onClick={() => onClick(id)}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            active
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        >
        {label}
        </button>
    );

    const StatCard = ({ title, value, subtitle, color = 'blue' }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
            <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`w-3 h-3 bg-${color}-500 rounded-full`}></div>
        </div>
        </div>
    );

    const ListItem = ({ children, badge }) => (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-150">
        <span className="text-gray-700">{children}</span>
        {badge && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {badge}
            </span>
        )}
        </div>
    );

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Content Analysis Results</h3>
        <div className="flex gap-2">
          <TabButton 
            id="overview" 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="details" 
            label="Details" 
            active={activeTab === 'details'} 
            onClick={setActiveTab} 
          />
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Keywords" 
              value={data.keywords.length} 
              subtitle="Identified terms"
              color="blue"
            />
            <StatCard 
              title="Key Phrases" 
              value={data.key_phrases.length} 
              subtitle="Important phrases"
              color="green"
            />
            <StatCard 
              title="Named Entities" 
              value={namedEntitiesNoNumbers.length} 
              subtitle="Recognized entities"
              color="purple"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Keywords Chart */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div style={{ height: '300px' }}>
                <Bar 
                  data={keywordsChartData} 
                  options={createBarOptions('Top Keywords by Score', 'Relevance Score')} 
                />
              </div>
            </div>

            {/* Key Phrases Chart */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div style={{ height: '300px' }}>
                <Doughnut 
                  data={phrasesChartData} 
                  options={createPieOptions('Key Phrases Distribution')} 
                />
              </div>
            </div>
          </div>

          {/* Entities Chart */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div style={{ height: '300px' }}>
              <Bar 
                data={entitiesChartData} 
                options={createBarOptions('Named Entities Frequency', 'Frequency Count')} 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Keywords List */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Top Keywords
            </h4>
            <div className="space-y-2">
              {data.keywords.slice(0, 8).map((kw, i) => (
                <ListItem key={i} badge={`${(kw.score * 100).toFixed(0)}%`}>
                  <div>
                    <div className="font-medium">{kw.word}</div>
                    <div className="text-sm text-gray-500">Frequency: {kw.frequency}</div>
                  </div>
                </ListItem>
              ))}
            </div>
          </div>

          {/* Key Phrases List */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Key Phrases
            </h4>
            <div className="space-y-2">
              {data.key_phrases.slice(0, 8).map((phrase, i) => (
                <ListItem key={i} badge={phrase.frequency}>
                  <div className="font-medium">{phrase.phrase}</div>
                </ListItem>
              ))}
            </div>
          </div>

          {/* Named Entities List */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Named Entities
            </h4>
            <div className="space-y-2">
              {namedEntitiesNoNumbers.slice(0, 8).map((entity, i) => (
                <ListItem key={i} badge={entity.frequency}>
                  <div>
                    <div className="font-medium">{entity.entity}</div>
                    <div className="text-sm text-gray-500">{entity.type}</div>
                  </div>
                </ListItem>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordsSection;