import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_URL } from '@/constants/api';
import { AuthContext } from '@/app/_layout';

type ScanRecord = {
  patientId: string;
  patientName?: string;
  timestamp?: string;
  imagePath?: string;
  diagnosis: string;
  confidence: number;
  probabilities?: { benign?: number; malignant?: number; normal?: number };
  medicalHistory?: string;
  doctorNotes?: string;
};

export default function ReportIndex() {
  const { isAuthenticated } = useContext(AuthContext);
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchRecords();
  }, [isAuthenticated]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecords().finally(() => setRefreshing(false));
  }, []);

  const fetchRecords = async () => {
    setError(null);
    setLoading(!refreshing);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch');
      setRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(r =>
      (r.patientName || '').toLowerCase().includes(q) ||
      (r.diagnosis || '').toLowerCase().includes(q) ||
      (r.patientId || '').toLowerCase().includes(q)
    );
  }, [records, search]);

  const renderItem = ({ item }: { item: ScanRecord }) => {
    const date = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';
    const imgUri = item.imagePath ? `${API_URL}/${item.imagePath}`.replace(/\\/g, '/') : undefined;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={async () => {
          try {
            const payload = {
              patientId: item.patientId,
              patientName: item.patientName || 'Unknown',
              diagnosis: item.diagnosis,
              confidence: String(Math.round((item.confidence || 0) * 100)),
              timestamp: item.timestamp || new Date().toISOString(),
              medicalHistory: item.medicalHistory || '',
              doctorNotes: item.doctorNotes || '',
            };
            await AsyncStorage.setItem('reportData', JSON.stringify(payload));
            router.push('/(reports)/report-editor');
          } catch (e) {
            // silently fail
          }
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.patientName}>{item.patientName || 'Unknown'}</Text>
          <Text style={styles.timestamp}>{date}</Text>
        </View>
        <View style={styles.cardBody}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Ionicons name="image-outline" size={24} color="#94a3b8" />
            </View>
          )}
          <View style={styles.resultBlock}>
            <View style={styles.row}>
              <Text style={styles.diagnosis}>{item.diagnosis}</Text>
              <View style={styles.chip}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#a7f3d0" />
                <Text style={styles.chipText}>{Math.round(item.confidence * 100)}%</Text>
              </View>
            </View>
            {item.probabilities && (
              <View style={styles.probRow}>
                {['benign','malignant','normal'].map(k => (
                  <View key={k} style={styles.probItem}>
                    <Text style={styles.probLabel}>{k}</Text>
                    <Text style={styles.probValue}>{Math.round(((item.probabilities as any)[k] || 0) * 100)}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#1a2a6c", "#2a4858", "#000000"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by patient, diagnosis, ID"
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={fetchRecords}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1a73e8"]} tintColor="#1a73e8" />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No reports found</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  editorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a73e8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editorText: { color: 'white', fontWeight: '600' },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, color: 'white' },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  patientName: { color: 'white', fontWeight: '700' },
  timestamp: { color: '#94a3b8' },
  cardBody: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.2)' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  resultBlock: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diagnosis: { color: 'white', fontSize: 16, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.15)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  chipText: { color: '#a7f3d0', fontSize: 12, fontWeight: '700' },
  probRow: { flexDirection: 'row', marginTop: 8, gap: 12 },
  probItem: { },
  probLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'capitalize' },
  probValue: { color: 'white', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: 'white', marginTop: 12 },
  errorText: { color: '#ef4444', marginTop: 12 },
  retry: { marginTop: 12, backgroundColor: '#1a73e8', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  retryText: { color: 'white', fontWeight: '600' },
  emptyText: { color: '#94a3b8', marginTop: 12 },
});