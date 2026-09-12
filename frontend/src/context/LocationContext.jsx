import React, { createContext, useContext, useState, useMemo } from 'react';
import { STATES, VILLAGES_DATABASE, getDistrictMetrics } from '../data/mockData';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  // Default location: Jharkhand -> Ranchi
  const [selectedStateId, setSelectedStateId] = useState('JH');
  const [selectedDistrictId, setSelectedDistrictId] = useState('JH-RNC');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  
  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVillageId, setSelectedVillageId] = useState('VIL-CHANDIPUR'); // Default Chandipur
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Action Plan Modal state
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);

  // Simulation State for "What-If" Planning
  const [simulationParams, setSimulationParams] = useState({
    doctorDelta: 1, // Add 1 doctor
    anmDelta: 1,    // Add 1 ANM
    medicineBoost: 50, // % stock increase
    mmuFrequency: 'Weekly' // MMU frequency
  });

  // Current State object
  const currentState = useMemo(() => {
    return STATES.find(s => s.id === selectedStateId) || STATES[0];
  }, [selectedStateId]);

  // Current District object
  const currentDistrict = useMemo(() => {
    return currentState.districts.find(d => d.id === selectedDistrictId) || currentState.districts[0];
  }, [currentState, selectedDistrictId]);

  // Filtered Villages for selected location & filters
  const filteredVillages = useMemo(() => {
    return VILLAGES_DATABASE.filter(village => {
      const matchDistrict = !selectedDistrictId || village.districtId === selectedDistrictId;
      const matchBlock = selectedBlock === 'ALL' || village.block === selectedBlock;
      const matchRisk = riskFilter === 'ALL' || village.riskLevel === riskFilter;
      const matchSearch = !searchQuery || 
        village.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        village.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
        village.bottleneck.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchDistrict && matchBlock && matchRisk && matchSearch;
    });
  }, [selectedDistrictId, selectedBlock, riskFilter, searchQuery]);

  // Active Village object
  const activeVillage = useMemo(() => {
    return VILLAGES_DATABASE.find(v => v.id === selectedVillageId) || filteredVillages[0] || VILLAGES_DATABASE[0];
  }, [selectedVillageId, filteredVillages]);

  // District Aggregated Metrics
  const districtMetrics = useMemo(() => {
    return getDistrictMetrics(selectedDistrictId);
  }, [selectedDistrictId]);

  // Calculate Simulated HES & Risk for Active Village based on what-if parameters
  const simulatedVillageMetrics = useMemo(() => {
    if (!activeVillage) return null;

    const baseHes = activeVillage.scores.hes;
    const baseRisk = activeVillage.riskScore;

    // Simulation Impact Formula
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
    const targetState = STATES.find(s => s.id === stateId);
    if (targetState && targetState.districts.length > 0) {
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
      states: STATES,
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
      setIsActionPlanModalOpen
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
