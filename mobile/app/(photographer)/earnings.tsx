import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react-native';
import { snapnowApi } from '../../src/api/snapnowApi';

export default function PhotographerEarningsScreen() {
  const { data: earnings, isLoading } = useQuery({
    queryKey: ['photographer-earnings'],
    queryFn: () => snapnowApi.getEarnings(),
  });

  const totalEarnings = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const heldEarnings = earnings?.filter(e => e.status === 'held').reduce((sum, e) => sum + e.amount, 0) || 0;
  const availableEarnings = earnings?.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0) || 0;
  const paidEarnings = earnings?.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0) || 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'held': return <Clock size={16} color="#f59e0b" />;
      case 'pending': return <TrendingUp size={16} color="#22c55e" />;
      case 'paid': return <CheckCircle size={16} color="#6366f1" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'held': return '#f59e0b';
      case 'pending': return '#22c55e';
      case 'paid': return '#6366f1';
      default: return '#9ca3af';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.totalCard}>
          <DollarSign size={32} color="#6366f1" />
          <Text style={styles.totalLabel}>Total Earned</Text>
          <Text style={styles.totalAmount}>£{totalEarnings}</Text>
        </View>

        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownCard}>
            <Clock size={20} color="#f59e0b" />
            <Text style={styles.breakdownLabel}>Held</Text>
            <Text style={styles.breakdownAmount}>£{heldEarnings}</Text>
          </View>
          <View style={styles.breakdownCard}>
            <TrendingUp size={20} color="#22c55e" />
            <Text style={styles.breakdownLabel}>Available</Text>
            <Text style={styles.breakdownAmount}>£{availableEarnings}</Text>
          </View>
          <View style={styles.breakdownCard}>
            <CheckCircle size={20} color="#6366f1" />
            <Text style={styles.breakdownLabel}>Paid Out</Text>
            <Text style={styles.breakdownAmount}>£{paidEarnings}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
          ) : !earnings?.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No earnings yet</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {earnings.map((earning) => (
                <View key={earning.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    {getStatusIcon(earning.status)}
                    <View>
                      <Text style={styles.transactionTitle}>Booking #{earning.bookingId}</Text>
                      <Text style={styles.transactionDate}>{formatDate(earning.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>£{earning.amount}</Text>
                    <Text style={[styles.transactionStatus, { color: getStatusColor(earning.status) }]}>
                      {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 20, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  content: { flex: 1, padding: 20 },
  totalCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: 20,
    padding: 32,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  totalLabel: { fontSize: 14, color: '#9ca3af', marginTop: 12 },
  totalAmount: { fontSize: 48, fontWeight: '700', color: '#fff', marginTop: 4 },
  breakdownGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  breakdownCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  breakdownLabel: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  breakdownAmount: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 4 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 16 },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  transactionsList: { gap: 12 },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  transactionTitle: { fontSize: 14, fontWeight: '500', color: '#fff' },
  transactionDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: '600', color: '#fff' },
  transactionStatus: { fontSize: 12, marginTop: 2 },
});
