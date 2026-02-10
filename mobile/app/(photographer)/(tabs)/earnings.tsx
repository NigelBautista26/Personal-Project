import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { 
  DollarSign, 
  Lock, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Info, 
  Upload,
  Calendar,
} from 'lucide-react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { snapnowApi } from '../../../src/api/snapnowApi';

const PRIMARY_COLOR = '#2563eb';

export default function PhotographerEarningsScreen() {
  const { photographerProfile } = useAuth();

  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['photographer-earnings', photographerProfile?.id],
    queryFn: () => snapnowApi.getPhotographerEarnings(photographerProfile!.id.toString()),
    enabled: !!photographerProfile?.id,
  });

  const earningsArray = Array.isArray(earnings) ? earnings : [];

  const totalEarnings = earningsArray.reduce((sum, e) => sum + (parseFloat(e.netAmount) || e.amount || 0), 0);
  const heldEarnings = earningsArray
    .filter(e => e.status === 'held')
    .reduce((sum, e) => sum + (parseFloat(e.netAmount) || e.amount || 0), 0);
  const availableEarnings = earningsArray
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + (parseFloat(e.netAmount) || e.amount || 0), 0);
  const paidEarnings = earningsArray
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + (parseFloat(e.netAmount) || e.amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'held':
        return (
          <View style={[styles.statusBadge, styles.heldBadge]}>
            <Lock size={12} color="#f59e0b" />
            <Text style={[styles.statusBadgeText, { color: '#f59e0b' }]}>Held</Text>
          </View>
        );
      case 'pending':
        return (
          <View style={[styles.statusBadge, styles.availableBadge]}>
            <Clock size={12} color="#22c55e" />
            <Text style={[styles.statusBadgeText, { color: '#22c55e' }]}>Available</Text>
          </View>
        );
      case 'paid':
        return (
          <View style={[styles.statusBadge, styles.paidBadge]}>
            <CheckCircle size={12} color="#3b82f6" />
            <Text style={[styles.statusBadgeText, { color: '#3b82f6' }]}>Paid</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings & Stats</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {earningsLoading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Available Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceIcon}>
                <DollarSign size={64} color="rgba(37,99,235,0.1)" />
              </View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(availableEarnings)}</Text>
              <View style={styles.balanceButtons}>
                <TouchableOpacity style={styles.withdrawButton}>
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.historyButton}>
                  <Text style={styles.historyButtonText}>History</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment on Hold Alert */}
            {heldEarnings > 0 && (
              <View style={styles.holdAlert}>
                <View style={styles.holdAlertIcon}>
                  <Lock size={20} color="#f59e0b" />
                </View>
                <View style={styles.holdAlertContent}>
                  <View style={styles.holdAlertHeader}>
                    <Text style={styles.holdAlertTitle}>Payment on Hold</Text>
                    <Text style={styles.holdAlertAmount}>{formatCurrency(heldEarnings)}</Text>
                  </View>
                  <Text style={styles.holdAlertText}>
                    This amount will be released once you upload the photos for your completed sessions.
                  </Text>
                  <TouchableOpacity 
                    style={styles.uploadPhotosButton}
                    onPress={() => router.push('/(photographer)/bookings')}
                  >
                    <Upload size={14} color="#f59e0b" />
                    <Text style={styles.uploadPhotosText}>Upload Photos</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCircle}>
                <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                  <DollarSign size={16} color="#22c55e" />
                </View>
                <Text style={styles.statCircleLabel}>Total Earned</Text>
                <Text style={styles.statCircleValue}>{formatCurrency(totalEarnings)}</Text>
              </View>
              <View style={styles.statCircle}>
                <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                  <Lock size={16} color="#f59e0b" />
                </View>
                <Text style={styles.statCircleLabel}>Held</Text>
                <Text style={styles.statCircleValue}>{formatCurrency(heldEarnings)}</Text>
              </View>
              <View style={styles.statCircle}>
                <View style={[styles.statCircleIcon, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                  <CheckCircle size={16} color="#3b82f6" />
                </View>
                <Text style={styles.statCircleLabel}>Paid Out</Text>
                <Text style={styles.statCircleValue}>{formatCurrency(paidEarnings)}</Text>
              </View>
            </View>

            {/* How Payments Work */}
            <View style={styles.infoCard}>
              <Info size={20} color={PRIMARY_COLOR} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>How payments work</Text>
                <Text style={styles.infoText}>
                  SnapNow takes a <Text style={styles.infoBold}>20% commission</Text> on each booking. Your payment is held until you upload photos, then it becomes available for withdrawal.
                </Text>
              </View>
            </View>

            {/* Recent Earnings */}
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color={PRIMARY_COLOR} />
                <Text style={styles.sectionTitle}>Recent Earnings</Text>
              </View>

              {earningsArray.length === 0 ? (
                <View style={styles.emptyState}>
                  <DollarSign size={40} color="#6b7280" />
                  <Text style={styles.emptyText}>
                    No earnings yet. Complete your first booking to start earning!
                  </Text>
                </View>
              ) : (
                <View style={styles.earningsList}>
                  {earningsArray.slice(0, 10).map((earning) => (
                    <View key={earning.id} style={styles.earningCard}>
                      <View style={styles.earningLeft}>
                        {getStatusBadge(earning.status)}
                        <View style={styles.earningDate}>
                          <Calendar size={12} color="#9ca3af" />
                          <Text style={styles.earningDateText}>
                            {formatDate(earning.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.earningRight}>
                        <Text style={styles.earningAmount}>
                          {formatCurrency(parseFloat(earning.netAmount) || earning.amount)}
                        </Text>
                        {earning.grossAmount && (
                          <Text style={styles.earningBreakdown}>
                            {formatCurrency(parseFloat(earning.grossAmount))}{' '}
                            <Text style={styles.earningFee}>
                              (-{formatCurrency(parseFloat(earning.platformFee))})
                            </Text>
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 12,
    gap: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

  content: { flex: 1, paddingHorizontal: 20 },

  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 24,
  },
  balanceLabel: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },
  balanceAmount: { fontSize: 40, fontWeight: '700', color: '#fff', marginBottom: 16 },
  balanceButtons: { flexDirection: 'row', gap: 12 },
  withdrawButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawButtonText: { fontSize: 14, fontWeight: '700', color: '#000' },
  historyButton: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  holdAlert: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    marginBottom: 16,
  },
  holdAlertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245,158,11,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  holdAlertContent: { flex: 1 },
  holdAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  holdAlertTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  holdAlertAmount: { fontSize: 14, fontWeight: '700', color: '#f59e0b' },
  holdAlertText: { fontSize: 12, color: '#9ca3af', lineHeight: 18 },
  uploadPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
  },
  uploadPhotosText: { fontSize: 13, fontWeight: '600', color: '#f59e0b' },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCircle: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statCircleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCircleLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  statCircleValue: { fontSize: 14, fontWeight: '700', color: '#fff' },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)',
    marginBottom: 20,
    gap: 12,
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#9ca3af', lineHeight: 18 },
  infoBold: { fontWeight: '700', color: '#fff' },

  recentSection: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },

  emptyState: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 12 },

  earningsList: { gap: 12 },
  earningCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  earningLeft: {},
  earningDate: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  earningDateText: { fontSize: 12, color: '#9ca3af' },
  earningRight: { alignItems: 'flex-end' },
  earningAmount: { fontSize: 18, fontWeight: '700', color: PRIMARY_COLOR },
  earningBreakdown: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  earningFee: { color: 'rgba(239,68,68,0.7)' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  heldBadge: { backgroundColor: 'rgba(245,158,11,0.2)' },
  availableBadge: { backgroundColor: 'rgba(34,197,94,0.2)' },
  paidBadge: { backgroundColor: 'rgba(59,130,246,0.2)' },
});
