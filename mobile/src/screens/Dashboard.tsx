import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ProductCard, Product } from '../components/ProductCard';

const mockProducts: Product[] = Array.from({ length: 5 }, (_, i) => ({
  id: `asin-${i + 1}`,
  title: `Trending Product ${i + 1}`,
  imageUrl: 'https://placehold.co/200x200',
  currentPrice: 19.99 + i,
  salesRank: 1200 - i * 15,
  rating: 4.2,
  reviewCount: 320 + i * 10,
  trendScore: 80 - i * 4,
  trendLabel: i === 0 ? 'Hot' : 'Rising',
}));

export const Dashboard: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Trending Now</Text>
      <FlatList
        data={mockProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} onPress={() => {}} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
