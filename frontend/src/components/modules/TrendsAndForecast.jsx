import React, { useState, useEffect } from 'react';
import { fetchTrends } from '../../api/trends';
import { ErrorMessage } from '../common/ErrorMessage';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceArea
} from 'recharts';
import { AlertTriangle } from 'lucide-react';

export const TrendsAndForecast = () => {
  const [selectedMetric, setSelectedMetric] = useState('Malnutrition');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const metricsList = [
    { id: 'Malnutrition', name: 'Malnutrition', unit: '%', color: '#dc2626' },
    { id: 'Immunization', name: 'Immunization', unit: '%', color: '#ea580c' },
    { id: 'PHC Utilization', name: 'PHC Utilization', unit: '%', color: '#d97706' },
    { id: 'Medicine Availability', name: 'Medicine Availability', unit: '%', color: '#0284c7' },
    { id: 'Maternal Health', name: 'Maternal Health', unit: '%', color: '#16a34a' }
  ];

  const loadTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTrends(selectedMetric);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setChartData(list);
    } catch (err) {
      setError(err.message || 'Failed to load trend data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, [selectedMetric]);

  const currentMetricObj = metricsList.find(m => m.id === selectedMetric) || metricsList[0];

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

      {error && <ErrorMessage message={error} onRetry={loadTrends} />}

      {/* Line Chart Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {currentMetricObj.name} Trend
            </h3>
            <p className="text-xs text-slate-500">
              Q1 → Q2 → Q3 → Q4 Forecast (Historical vs AI Forecast)
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
