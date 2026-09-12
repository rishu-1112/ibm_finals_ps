import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchLocations } from '../api/locations';
import { fetchDashboardMetrics } from '../api/dashboard';
import { fetchVillages, fetchVillageById } from '../api/villages';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  // Location Hierarchy State
  const [states, setStates] = useState([
    {
      id: 'JH',
      name: 'Jharkhand',
      districts: [
        { id: 'JH-RNC', name: 'Ranchi' },
        { id: 'JH-WSB', name: 'West Singhbhum' },
        { id: 'JH-KNT', name: 'Khunti' }
      ]
    }
  ]);
  const [selectedStateId, setSelectedStateId] = useState('JH');
  const [selectedDistrictId, setSelectedDistrictId] = useState('JH-RNC');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  
  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVillageId, setSelectedVillageId] = useState('VIL-CHANDIPUR');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);

  // Dynamic API Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [villagesList, setVillagesList] = useState([]);
  const [activeVillageDetails, setActiveVillageDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulation State for "What-If" Planning
  const [simulationParams, setSimulationParams] = useState({
    doctorDelta: 1,
    anmDelta: 1,
    medicineBoost: 50,
    mmuFrequency: 'Weekly'
  });

  // Fetch Location Hierarchy on initial load
  const loadLocations = useCallback(async () => {
    try {
      const data = await fetchLocations();
      if (data && data.length > 0) {
        setStates(data);
      }
    } catch (err) {
      console.warn('Using default locations due to connection issue:', err.message);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  // Current State & District Derived Objects
  const currentState = useMemo(() => {
    return states.find(s => s.id === selectedStateId) || states[0];
  }, [states, selectedStateId]);

  const currentDistrict = useMemo(() => {
    if (!currentState || !currentState.districts) {
      return { id: 'JH-RNC', name: 'Ranchi' };
    }
    return currentState.districts.find(d => d.id === selectedDistrictId) || currentState.districts[0];
  }, [currentState, selectedDistrictId]);

  // Main Data Refresh Callback
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, villRes] = await Promise.all([
        fetchDashboardMetrics(selectedDistrictId, selectedBlock),
        fetchVillages({
          districtId: selectedDistrictId,
          block: selectedBlock,
          riskFilter,
          search: searchQuery
        })
      ]);

      setDashboardData(dashRes);
      const list = Array.isArray(villRes) ? villRes : (villRes?.data || []);
      setVillagesList(list);

      // Auto-select first village in district if current selection is not in list
      if (list.length > 0) {
        const found = list.find(v => v.id === selectedVillageId);
        if (!found) {
          setSelectedVillageId(list[0].id);
        }
      }
    } catch (err) {
      console.error('API Error in LocationContext:', err);
      setError(err.message || 'Failed to connect to GramSwasthya AI backend server.');
    } finally {
      setLoading(false);
    }
  }, [selectedDistrictId, selectedBlock, riskFilter, searchQuery, selectedVillageId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Fetch Active Village Details when selectedVillageId changes
  useEffect(() => {
    if (!selectedVillageId) return;

    let isMounted = true;
    fetchVillageById(selectedVillageId)
      .then(res => {
        const details = res?.data || res;
        if (isMounted && details && (details.id || details.village?.id)) {
          setActiveVillageDetails(details);
        }
      })
      .catch(err => {
        console.warn('Failed to fetch specific village details from backend:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedVillageId]);

  // Filtered villages
  const filteredVillages = useMemo(() => {
    return villagesList;
  }, [villagesList]);

  // Active village object (fallback to details or first village)
  const activeVillage = useMemo(() => {
    if (activeVillageDetails && activeVillageDetails.id === selectedVillageId) {
      return activeVillageDetails;
    }
    return villagesList.find(v => v.id === selectedVillageId) || villagesList[0] || null;
  }, [activeVillageDetails, selectedVillageId, villagesList]);

  // District Aggregated Metrics
  const districtMetrics = useMemo(() => {
    if (!dashboardData) {
      return {
        overview: {
          districtName: currentDistrict.name,
          stateName: currentState.name,
          totalVillagesAnalyzed: 0,
          healthcareEffectiveness: 0,
          highRiskVillagesCount: 0,
          criticalVillagesCount: 0,
          healthcareGapsCount: 0,
          lastAnalyzed: 'September 2026'
        },
        totalVillages: 0,
        criticalCount: 0,
        highCount: 0,
        gaps: [],
        infraVsHes: []
      };
    }
    return {
      overview: dashboardData.overview || {},
      totalVillages: dashboardData.totalVillages || dashboardData.overview?.totalVillagesAnalyzed || villagesList.length || 0,
      criticalCount: dashboardData.criticalVillages || dashboardData.overview?.criticalVillagesCount || 0,
      highCount: dashboardData.highRiskVillages || dashboardData.overview?.highRiskVillagesCount || 0,
      averageHealthcareEffectiveness: dashboardData.averageHealthcareEffectiveness || dashboardData.overview?.healthcareEffectiveness || 0,
      topPriorityVillages: dashboardData.topPriorityVillages || [],
      topHealthcareGaps: dashboardData.topHealthcareGaps || dashboardData.gaps || [],
      gaps: dashboardData.gaps || [],
      infraVsHes: dashboardData.infraVsHes || [],
      villages: villagesList
    };
  }, [dashboardData, currentDistrict, currentState, villagesList]);

  // Calculate Simulated HES & Risk for Active Village
  const simulatedVillageMetrics = useMemo(() => {
    if (!activeVillage || !activeVillage.scores) return null;

    const baseHes = activeVillage.scores.hes || 50;
    const baseRisk = activeVillage.riskScore || 50;

    const doctorImpact = simulationParams.doctorDelta * 12;
    const anmImpact = simulationParams.anmDelta * 8;
    const medImpact = Math.round((simulationParams.medicineBoost / 100) * 15);
    const mmuImpact = simulationParams.mmuFrequency === 'Weekly' ? 10 : simulationParams.mmuFrequency === 'Bi-weekly' ? 5 : 0;

    const totalHesBoost = doctorImpact + anmImpact + medImpact + mmuImpact;
    const simulatedHes = Math.min(98, Math.max(10, baseHes + totalHesBoost));

    const totalRiskDrop = Math.round(totalHesBoost * 0.85);
    const simulatedRisk = Math.max(5, baseRisk - totalRiskDrop);

    let simulatedRiskLevel = 'Low';
    if (simulatedRisk >= 85) simulatedRiskLevel = 'Critical';
    else if (simulatedRisk >= 65) simulatedRiskLevel = 'High';
    else if (simulatedRisk >= 35) simulatedRiskLevel = 'Moderate';

    return {
      baseHes,
      simulatedHes,
      hesDelta: simulatedHes - baseHes,
      baseRisk,
      simulatedRisk,
      riskDelta: simulatedRisk - baseRisk,
      simulatedRiskLevel
    };
  }, [activeVillage, simulationParams]);

  // Handler functions
  const handleStateChange = (stateId) => {
    setSelectedStateId(stateId);
    const targetState = states.find(s => s.id === stateId);
    if (targetState && targetState.districts && targetState.districts.length > 0) {
      setSelectedDistrictId(targetState.districts[0].id);
    }
    setSelectedBlock('ALL');
  };

  const openVillageDrawer = (villageId) => {
    if (villageId) setSelectedVillageId(villageId);
    setIsDrawerOpen(true);
  };

  return (
    <LocationContext.Provider value={{
      states,
      selectedStateId,
      selectedDistrictId,
      selectedBlock,
      currentState,
      currentDistrict,
      filteredVillages,
      activeVillage,
      districtMetrics,
      activeTab,
      setActiveTab,
      selectedVillageId,
      setSelectedVillageId,
      isDrawerOpen,
      setIsDrawerOpen,
      openVillageDrawer,
      riskFilter,
      setRiskFilter,
      searchQuery,
      setSearchQuery,
      isDarkMode,
      setIsDarkMode,
      handleStateChange,
      setSelectedDistrictId,
      setSelectedBlock,
      simulationParams,
      setSimulationParams,
      simulatedVillageMetrics,
      isActionPlanModalOpen,
      setIsActionPlanModalOpen,
      loading,
      error,
      refreshData
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
