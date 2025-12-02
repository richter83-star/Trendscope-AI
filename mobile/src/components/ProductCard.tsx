import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TrendBadge } from './TrendBadge';

export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  salesRank: number;
  rating: number;
  reviewCount: number;
  trendScore: number;
  trendLabel: string;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>${product.currentPrice.toFixed(2)}</Text>
        <TrendBadge score={product.trendScore} label={product.trendLabel} />
        <View style={styles.stats}>
          <Text style={styles.statText}>BSR: {product.salesRank}</Text>
          <Text style={styles.statText}>⭐ {product.rating.toFixed(1)} ({product.reviewCount})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  image: { width: 120, height: 120 },
  content: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statText: { color: '#4B5563', fontSize: 12 },
});
