import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ProductModal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
        <Ionicons name="close" size={30} color="#000" />
      </TouchableOpacity>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price}</Text>
      <Text style={styles.stock}>In stock: {product.stock}</Text>
    </View>
  );
};

export default ProductModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  image: {
    width: 250,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    color: '#228B22',
    marginTop: 8,
  },
  stock: {
    fontSize: 16,
    color: '#555',
    marginTop: 6,
  },
});