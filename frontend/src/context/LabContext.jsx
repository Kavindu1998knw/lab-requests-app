import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const LabContext = createContext(null);

export const LabProvider = ({ children }) => {
  const [samples, setSamples] = useState([]);
  const [stats, setStats] = useState({
    totalSamples: 0,
    pendingAnalysis: 0,
    inProgress: 0,
    completedReports: 0,
    totalRevenue: 0,
    totalAdvance: 0,
    pendingBalance: 0,
  });
  const [dbStatus, setDbStatus] = useState({ isOnline: false, database: 'checking...' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSample, setSelectedSample] = useState(null);
  const [editingSample, setEditingSample] = useState(null);
  const [printSample, setPrintSample] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lab_theme') || 'light';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lab_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const checkStatusAndFetchData = useCallback(async () => {
    setLoading(true);
    try {
      const health = await api.checkHealth();
      setDbStatus(health);

      const samplesRes = await api.getSamples();
      const samplesList = Array.isArray(samplesRes)
        ? samplesRes
        : Array.isArray(samplesRes?.samples)
        ? samplesRes.samples
        : [];
      setSamples(samplesList);

      const statsRes = await api.getStats();
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Error fetching lab data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatusAndFetchData();
    const interval = setInterval(checkStatusAndFetchData, 30000);
    return () => clearInterval(interval);
  }, [checkStatusAndFetchData]);

  const createSample = async (sampleData) => {
    try {
      const res = await api.createSample(sampleData);
      addToast(res.message || 'Sample request submitted successfully!', 'success');
      await checkStatusAndFetchData();
      return { success: true, sample: res.sample };
    } catch (err) {
      addToast(err.message || 'Failed to submit sample request', 'error');
      return { success: false, error: err.message };
    }
  };

  const updateSample = async (id, sampleData) => {
    try {
      const res = await api.updateSample(id, sampleData);
      addToast(res.message || 'Sample updated successfully!', 'success');
      await checkStatusAndFetchData();
      if (selectedSample?.id === id) {
        setSelectedSample(res.sample);
      }
      return { success: true, sample: res.sample };
    } catch (err) {
      addToast(err.message || 'Failed to update sample', 'error');
      return { success: false, error: err.message };
    }
  };

  const deleteSample = async (id, refNo) => {
    try {
      const res = await api.deleteSample(id);
      addToast(`Sample ${refNo || id} deleted successfully`, 'info');
      await checkStatusAndFetchData();
      if (selectedSample?.id === id) {
        setSelectedSample(null);
      }
      return { success: true };
    } catch (err) {
      addToast(err.message || 'Failed to delete sample', 'error');
      return { success: false, error: err.message };
    }
  };

  return (
    <LabContext.Provider
      value={{
        samples,
        stats,
        dbStatus,
        loading,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        selectedSample,
        setSelectedSample,
        editingSample,
        setEditingSample,
        printSample,
        setPrintSample,
        toasts,
        addToast,
        removeToast,
        theme,
        toggleTheme,
        createSample,
        updateSample,
        deleteSample,
        refreshData: checkStatusAndFetchData,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => useContext(LabContext);
