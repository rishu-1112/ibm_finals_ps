import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { fetchAIRiskPredictions } from '../../api/risk';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ErrorMessage } from '../common/ErrorMessage';
import L from 'leaflet';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceArea
} from 'recharts';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight
} from 'lucide-react';

export const OverviewDashboard = () => {
  const { 
    filteredVillages, 
    setSelectedVillageId, 
    setActiveTab, 
    currentDistrict,
    districtMetrics,
    loading,
    error,
    refreshData
  } = useLocation();

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [aiPredictions, setAiPredictions] = useState([]);
  const [selectedMapVillage, setSelectedMapVillage] = useState(filteredVillages[0] || null);

  // Fetch AI Early-Warning Signals from backend
  useEffect(() => {
    let isMounted = true;
    fetchAIRiskPredictions()
      .then(res => {
        if (isMounted && res.earlyWarnings) {
          setAiPredictions(res.earlyWarnings);
        }
      })
      .catch(err => {
        console.warn('Failed to load AI predictions:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [23.400, 85.350],
        zoom: 10,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }
  }, []);

  // Sync village markers on map
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current) return;

    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    if (filteredVillages.length === 0) return;

    const bounds = L.latLngBounds([]);

    filteredVillages.forEach((village) => {
      bounds.extend([village.lat, village.lng]);

      const isCritical = village.riskLevel === 'Critical';
      const isHigh = village.riskLevel === 'High';
      const isModerate = village.riskLevel === 'Moderate';

      const colorClass = isCritical ? '#dc2626' : isHigh ? '#ea580c' : isModerate ? '#d97706' : '#16a34a';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${isCritical ? `<div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(220, 38, 38, 0.25); animation: ping 1.8s infinite;"></div>` : ''}
            <div style="width: 16px; height: 16px; border-radius: 50%; background: ${colorClass}; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.25);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([village.lat, village.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; width: 220px; padding: 2px;">
          <div style="font-[10px]; font-weight: 700; color: #64748b; text-transform: uppercase;">Village</div>
          <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">${village.name}</div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
            <span style="color: #475569;">Risk Score:</span>
            <span style="font-weight: 800; color: ${colorClass}; bg-red-50; padding: 1px 6px; border-radius: 4px;">${village.riskScore} / 100</span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
            <span style="color: #475569;">Status:</span>
            <span style="font-weight: 700; color: ${colorClass};">${village.riskLevel}</span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 12px;">
            <span style="color: #475569;">Top Gap:</span>
            <span style="font-weight: 600; color: #1e293b;">${village.topGap}</span>
          </div>

          <button 
            id="btn-inspect-${village.id}"
            style="width: 100%; background: #16a34a; color: #ffffff; font-size: 12px; font-weight: 700; border: none; border-radius: 6px; padding: 8px 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
          >
            View Village Intelligence →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedMapVillage(village);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${village.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedVillageId(village.id);
            setActiveTab('village');
          };
        }
      });

      markersGroup.addLayer(marker);
    });

    if (filteredVillages.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    }
  }, [filteredVillages, setSelectedVillageId, setActiveTab]);

  const overview = districtMetrics.overview || {};
  const gaps = districtMetrics.gaps || [];
  const infraVsHes = districtMetrics.infraVsHes || [];

  // Ranked priority villages from filtered villages
  const priorityVillages = [...filteredVillages]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshData} />;
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* SECTION: MAIN DASHBOARD HEADER & 4 KPI CARDS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            District Health Overview
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {currentDistrict.name} District • {overview.totalVillagesAnalyzed || filteredVillages.length} villages analyzed
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton type="cards" count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Healthcare Effectiveness */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Healthcare Effectiveness
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">
                  {overview.healthcareEffectiveness || 64} <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {overview.effectivenessLabel || 'District Average'}
                </span>
              </div>
            </div>

            {/* Card 2: High-Risk Villages */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                High-Risk Villages
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-600">
                  {overview.highRiskVillagesCount || filteredVillages.filter(v => v.riskLevel === 'High').length}
                </span>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {overview.highRiskTrend || 'Active Monitor'}
                </span>
              </div>
            </div>

            {/* Card 3: Critical Villages */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Critical Villages
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-red-600">
                  {overview.criticalVillagesCount || filteredVillages.filter(v => v.riskLevel === 'Critical').length}
                </span>
                <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                  {overview.criticalLabel || 'Immediate attention'}
                </span>
              </div>
            </div>

            {/* Card 4: Healthcare Gaps */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Healthcare Gaps
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">
                  {overview.healthcareGapsCount || 37}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {overview.gapsLabel || 'Across analyzed villages'}
                </span>
              </div>
            </div>

          </div>
        )}
      </section>

      {/* SECTION: HEALTH RISK MAP */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Rural Healthcare Risk Map
          </h3>
          <p className="text-xs text-slate-600">
            Identify villages requiring immediate attention
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map Container */}
          <div className="lg:col-span-7 space-y-2">
            <div className="bg-slate-100 border border-slate-200 rounded-xl h-[420px] relative overflow-hidden">
              <div ref={mapRef} className="w-full h-full rounded-xl z-10"></div>
              
              {/* Floating Map Legend */}
              <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg p-2 flex items-center space-x-3 text-xs font-semibold shadow-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Low Risk</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Moderate</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                  <span>High</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <span>Critical</span>
                </span>
              </div>
            </div>
          </div>

          {/* Beside Map: Priority Villages List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Priority Villages
              </h4>
              <span className="text-[11px] text-slate-500">Ranked by risk score</span>
            </div>

            <div className="space-y-2">
              {priorityVillages.map((pv, idx) => (
                <div
                  key={pv.id}
                  onClick={() => {
                    setSelectedVillageId(pv.id);
                    setActiveTab('village');
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    pv.riskLevel === 'Critical'
                      ? 'bg-red-50/50 border-red-200 hover:border-red-300 ring-1 ring-red-300'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-400 w-4">
                      {idx + 1}.
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        {pv.name}
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        Top Gap: {pv.topGap}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      pv.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {pv.riskScore} {pv.riskLevel}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('interventions')}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>View Full Priority Ranking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </section>

      {/* SECTION: INFRASTRUCTURE vs HEALTHCARE EFFECTIVENESS */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Infrastructure vs Healthcare Effectiveness
          </h3>
          <p className="text-xs text-slate-600">
            Identify villages where healthcare infrastructure exists but outcomes remain poor.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Scatter Plot Chart */}
          <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="infra" 
                  name="Healthcare Infrastructure" 
                  unit="%" 
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Healthcare Infrastructure (%)', position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 11 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="hes" 
                  name="Healthcare Effectiveness" 
                  unit="%" 
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Healthcare Effectiveness (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#475569', fontSize: 11 }}
                />
                
                <ReferenceArea x1={50} x2={100} y1={0} y2={60} fill="#fef2f2" fillOpacity={0.6} stroke="#fca5a5" strokeDasharray="3 3" />
                
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs space-y-1">
                          <p className="font-bold text-slate-900">{data.name}</p>
                          <p className="text-slate-600">Infrastructure: <strong className="text-slate-900">{data.infra}%</strong></p>
                          <p className="text-slate-600">Effectiveness: <strong className="text-slate-900">{data.hes}%</strong></p>
                          <p className="text-red-600 font-semibold">{data.zone}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Scatter name="Villages" data={infraVsHes} fill="#16a34a">
                  {infraVsHes.map((entry, index) => (
                    <cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Chandipur' ? '#dc2626' : entry.zone === 'Hidden Healthcare Gaps' ? '#ea580c' : '#16a34a'} 
                      r={entry.name === 'Chandipur' ? 8 : 6}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Quadrants Legend & Insight Callout */}
          <div className="lg:col-span-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900 block">Model Villages</span>
                <span className="text-[10px] text-emerald-700">High infra + High effectiveness</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-900 block">Developing</span>
                <span className="text-[10px] text-blue-700">Low infra + High effectiveness</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                <span className="font-bold text-slate-900 block">Infrastructure Gap</span>
                <span className="text-[10px] text-slate-600">Low infra + Low effectiveness</span>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 ring-1 ring-red-300">
                <span className="font-bold text-red-900 block">Hidden Gaps ⚠️</span>
                <span className="text-[10px] text-red-700">High infra + Low effectiveness</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold text-amber-800 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Key Paradox Insight</span>
              </div>
              <blockquote className="italic font-medium text-slate-800 pt-1">
                "Villages with adequate healthcare infrastructure show below-average effectiveness due to low service utilization."
              </blockquote>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: DISTRICT HEALTH GAPS & AI RISK PREDICTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DISTRICT HEALTH GAPS */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Where is the healthcare system breaking?
            </h3>
            <p className="text-xs text-slate-600">
              District indicator performance vs target standards
            </p>
          </div>

          <div className="space-y-4">
            {gaps.map((gap) => (
              <div key={gap.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{gap.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-900 font-extrabold">{gap.value}%</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      gap.statusType === 'positive' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {gap.status}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      gap.statusType === 'positive' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${gap.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI RISK PREDICTION */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Early-Warning Signals
              </h3>
              <p className="text-xs text-slate-600">
                Predict problems before they become critical.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4">
              {aiPredictions.map((pred) => (
                <div key={pred.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{pred.category}</h5>
                    <div className="flex items-center space-x-3 text-xs mt-1">
                      <span className="text-slate-600">Current: <strong className="text-slate-900">{pred.current}</strong></span>
                      <span className="text-slate-600">Predicted: <strong className="text-slate-900">{pred.predicted}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-semibold">
                    <span className={`flex items-center space-x-1 ${
                      pred.trendDirection === 'up' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {pred.trendDirection === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{pred.trend}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      pred.riskLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      Risk: {pred.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100">
            Prediction based on historical health indicators and service-utilization trends.
          </p>

        </section>

      </div>

      {/* SECTION: DATA TRANSPARENCY & FOOTER */}
      <section className="bg-slate-900 text-white rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        <div>
          <h4 className="font-bold text-slate-200">Data Transparency & Governance</h4>
          <p className="text-slate-400 text-[11px]">
            Data Sources: Rural Health Statistics • HMIS • NFHS / DLHS / AHS • Anganwadi Data
          </p>
        </div>

        <div className="flex items-center space-x-4 text-slate-300 font-medium">
          <span>Last analyzed: <strong>September 2026</strong></span>
          <span className="text-slate-600">•</span>
          <span>Coverage: <strong>{overview.totalVillagesAnalyzed || 184} villages</strong></span>
        </div>
      </section>

    </div>
  );
};
