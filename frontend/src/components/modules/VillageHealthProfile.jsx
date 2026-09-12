import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { 
  AlertOctagon, 
  ArrowLeft,
  Building,
  Activity,
  Heart,
  TrendingDown,
  Info,
  Sparkles
} from 'lucide-react';

export const VillageHealthProfile = () => {
  const { activeVillage, setActiveTab } = useLocation();

  if (!activeVillage) {
    return (
      <div className="p-6">
        <LoadingSkeleton type="cards" count={3} />
      </div>
    );
  }

  const scores = activeVillage.scores || {
    infrastructure: 50,
    serviceAvailability: 50,
    utilization: 50,
    healthOutcome: 50,
    hes: 50
  };

  const majorGaps = activeVillage.majorGaps || [];
  const recommendedInterventions = activeVillage.recommendedInterventions || [];
  const whyRecommendations = activeVillage.whyRecommendations || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview Dashboard</span>
        </button>
      </div>

      {/* VILLAGE HEADER & RISK BANNER */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Village Intelligence Profile
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeVillage.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {activeVillage.districtName} District • {activeVillage.stateName}
            </p>
          </div>

          {/* Large Risk Badge */}
          <div className="flex items-center space-x-4 bg-red-50 border border-red-200 p-4 rounded-xl">
            <div className="text-right">
              <span className="text-2xl font-black text-red-600 block leading-none">
                {activeVillage.riskScore} <span className="text-xs font-bold text-red-500">/ 100</span>
              </span>
              <span className="text-xs font-extrabold text-red-700 tracking-wider uppercase mt-1 block">
                {activeVillage.riskLevel} RISK
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* AI Explanation Box */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <div className="flex items-start space-x-2 text-xs text-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">AI Risk Assessment Explanation</span>
              <blockquote className="text-slate-700 leading-relaxed font-medium">
                "{activeVillage.aiExplanation}"
              </blockquote>
            </div>
          </div>
        </div>

      </section>

      {/* VILLAGE HEALTH SCORES & EFFECTIVENESS */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Village Healthcare Score Breakdown
          </h3>
          <p className="text-xs text-slate-600">
            Evaluating performance across the four primary healthcare pillars
          </p>
        </div>

        {/* 4 Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Pillar 1: Infrastructure */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase">
              <span>Infrastructure</span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {scores.infrastructure}%
            </div>
            <div className="text-[11px] text-emerald-700 font-medium space-y-0.5 pt-1 border-t border-slate-200">
              <p>✓ PHC available</p>
              <p>✓ Doctors available</p>
            </div>
          </div>

          {/* Pillar 2: Service Availability */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase">
              <span>Service Availability</span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">
              {scores.serviceAvailability}%
            </div>
            <div className="text-[11px] text-amber-700 font-medium space-y-0.5 pt-1 border-t border-slate-200">
              <p>⚠️ Medicine availability below target</p>
            </div>
          </div>

          {/* Pillar 3: Healthcare Utilization */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase">
              <span>Healthcare Utilization</span>
              <TrendingDown className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-red-600">
              {scores.utilization}%
            </div>
            <div className="text-[11px] text-red-700 font-medium space-y-0.5 pt-1 border-t border-slate-200">
              <p>⚠️ Low PHC utilization</p>
            </div>
          </div>

          {/* Pillar 4: Health Outcomes */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase">
              <span>Health Outcomes</span>
              <Heart className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {scores.healthOutcome}%
            </div>
            <div className="text-[11px] text-red-700 font-medium space-y-0.5 pt-1 border-t border-slate-200">
              <p>⚠️ Malnutrition risk increasing</p>
            </div>
          </div>

        </div>

        {/* Overall Healthcare Effectiveness Indicator */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Overall Healthcare Effectiveness
            </h4>
            <p className="text-xs text-slate-400">
              Aggregated index combining readiness, delivery, and community utilization
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-48 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${scores.hes}%` }}
              ></div>
            </div>
            <span className="text-2xl font-black text-white">
              {scores.hes} <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </span>
          </div>
        </div>

      </section>

      {/* HEALTHCARE GAP ANALYSIS */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Major Healthcare Gaps
          </h3>
          <p className="text-xs text-slate-600">
            Ranked priority gaps requiring operational response
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {majorGaps.map((gap) => (
            <div 
              key={gap.id}
              className={`p-4 rounded-xl border space-y-2 ${
                gap.severity === 'Critical' 
                  ? 'bg-red-50/60 border-red-200' 
                  : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${gap.severity === 'Critical' ? 'bg-red-600' : 'bg-amber-500'}`}></span>
                  <h4 className="text-xs font-bold text-slate-900">{gap.title}</h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  gap.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {gap.indicator}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {gap.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI RECOMMENDATION SECTION */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Recommended Interventions
          </h3>
          <p className="text-xs text-slate-600">
            What should be done first?
          </p>
        </div>

        {/* Ranked Intervention Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedInterventions.map((rec) => (
            <div key={rec.num} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {rec.num} — {rec.title}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  rec.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  Priority: {rec.priority}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Reason:</span>
                  <p className="text-slate-600">{rec.reason}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">Expected Objective:</span>
                  <p className="text-slate-900 font-semibold">{rec.objective}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explainable AI Section */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Why these recommendations?</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Contributing indicators extracted from ML feature attribution models:
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
            {whyRecommendations.map((factor, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-white p-2 rounded border border-slate-200">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

      </section>

    </div>
  );
};
