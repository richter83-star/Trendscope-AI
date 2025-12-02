import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TrendBadgeProps {
  score: number;
  label: string;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ score, label }) => {
  const getColor = () => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#6B7280';
    return '#EF4444';
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <Text style={styles.badgeText}>{label.toUpperCase()}</Text>
      <Text style={styles.scoreText}>{score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  scoreText: {
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
});
