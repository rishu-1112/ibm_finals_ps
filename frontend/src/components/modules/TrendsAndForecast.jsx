import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export const TrendsAndForecast = () => {
  const [selectedMetric, setSelectedMetric] = useState('Malnutrition');

  const metricsList = [
    { id: 'Malnutrition', name: 'Malnutrition', unit: '%', color: '#dc2626' },
    { id: 'Immunization', name: 'Immunization', unit: '%', color: '#ea580c' },
    { id: 'PHC Utilization', name: 'PHC Utilization', unit: '%', color: '#d97706' },
    { id: 'Medicine Availability', name: 'Medicine Availability', unit: '%', color: '#0284c7' },
    { id: 'Maternal Health', name: 'Maternal Health', unit: '%', color: '#16a34a' }
  ];

  // Data for Q1 -> Q2 -> Q3 -> Q4 (AI Predicted Risk Zone)
  const trendDataMap = {
    'Malnutrition': [
      { quarter: 'Q1', value: 14, isPredicted: false },
      { quarter: 'Q2', value: 16, isPredicted: false },
      { quarter: 'Q3', value: 18, isPredicted: false },
      { quarter: 'Q4 (AI Predicted)', value: 24, isPredicted: true }
    ],
    'Immunization': [
      { quarter: 'Q1', value: 75, isPredicted: false },
      { quarter: 'Q2', value: 70, isPredicted: false },
      { quarter: 'Q3', value: 64, isPredicted: false },
      { quarter: 'Q4 (AI Predicted)', value: 58, isPredicted: true }
    ],
    'PHC Utilization': [
      { quarter: 'Q1', value: 52, isPredicted: false },
      { quarter: 'Q2', value: 48, isPredicted: false },
      { quarter: 'Q3', value: 42, isPredicted: false },
      { quarter: 'Q4 (AI Predicted)', value: 35, isPredicted: true }
    ],
    'Medicine Availability': [
      { quarter: 'Q1', value: 72, isPredicted: false },
      { quarter: 'Q2', value: 65, isPredicted: false },
      { quarter: 'Q3', value: 58, isPredicted: false },
      { quarter: 'Q4 (AI Predicted)', value: 50, isPredicted: true }
    ],
    'Maternal Health': [
      { quarter: 'Q1', value: 65, isPredicted: false },
      { quarter: 'Q2', value: 68, isPredicted: false },
      { quarter: 'Q3', value: 71, isPredicted: false },
      { quarter: 'Q4 (AI Predicted)', value: 74, isPredicted: true }
    ]
  };

  const currentMetricObj = metricsList.find(m => m.id === selectedMetric) || metricsList[0];
  const chartData = trendDataMap[selectedMetric] || trendDataMap['Malnutrition'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Health Trends & AI Forecast
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          Quarterly trajectory analysis with predictive forecast zones
        </p>
      </div>

      {/* Metric Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {metricsList.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMetric(m.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === m.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Line Chart Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {currentMetricObj.name} Trend
            </h3>
            <p className="text-xs text-slate-500">
              Q1 → Q2 → Q3 → Q4 Forecast ({selectedMetric === 'Malnutrition' ? '18% increasing to 24%' : 'Historical vs AI Forecast'})
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>AI Predicted Risk Zone</span>
          </div>
        </div>

        {/* Recharts LineChart */}
        <div className="h-[360px] bg-slate-50 border border-slate-200 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="quarter" 
                tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
              />
              <YAxis 
                unit="%" 
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#475569' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs space-y-1">
                        <p className="font-bold text-slate-900">{data.quarter}</p>
                        <p className="text-slate-600">
                          {currentMetricObj.name}: <strong className="text-slate-900">{data.value}%</strong>
                        </p>
                        {data.isPredicted && (
                          <span className="inline-block text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            AI Predicted Risk Zone
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Shaded AI Predicted Risk Zone for Q4 */}
              <ReferenceArea x1="Q3" x2="Q4 (AI Predicted)" fill="#fee2e2" fillOpacity={0.5} />
              
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={currentMetricObj.color} 
                strokeWidth={3} 
                dot={{ r: 6, fill: currentMetricObj.color }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};
