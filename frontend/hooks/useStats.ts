import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../constants/api';

interface Trend {
  value: number;
  isPositive: boolean;
}

interface Stat {
  value: number | string;
  trend?: Trend;
}

interface Stats {
  total_scans: Stat;
  detected_cases: Stat;
  success_rate: Stat;
  active_patients: Stat;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.STATS}`);
      
      // Format the numbers for display
      const formattedStats = {
        ...response.data,
        total_scans: {
          ...response.data.total_scans,
          value: response.data.total_scans.value.toLocaleString()
        },
        detected_cases: {
          ...response.data.detected_cases,
          value: response.data.detected_cases.value.toLocaleString()
        },
        success_rate: {
          ...response.data.success_rate,
          value: response.data.success_rate.value
        },
        active_patients: {
          ...response.data.active_patients,
          value: response.data.active_patients.value.toLocaleString()
        }
      };
      
      setStats(formattedStats);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
      // Set default values in case of error
      setStats({
        total_scans: { value: '0', trend: { value: 0, isPositive: true } },
        detected_cases: { value: '0', trend: { value: 0, isPositive: true } },
        success_rate: { value: '0' },
        active_patients: { value: '0', trend: { value: 0, isPositive: true } }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchStats };
} 