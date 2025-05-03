import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';

import Header3 from '../../components/Header3';
import Fire from '../../Fire';

const Basket = ({ navigation }) => {
  const [basket, setBasket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getTotalPrice = () => {
    return basket.reduce((sum, item) => {
      const price = Number(item.price) || 0; // Ensure price is a number
      const qty = Number(item.quantity) || 1; // Ensure quantity is a number
      return sum + price * qty;
    }, 0);
  };

  const fetchBasketItems = async () => {
    try {
      const items = await Fire.shared.getBasketItems();
      setBasket(items);
    } catch (error) {
      console.error('Error loading basket items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await Fire.shared.removeBasketItem(id);
      fetchBasketItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    Alert.alert("Checkout", "Proceeding to payment...");
    navigation.navigate("Checkout", { items: basket });

  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBasketItems();
  };

  const renderItem = ({ item }) => {
    const imageUrl = item.image || 'https://via.placeholder.com/150'; // Fallback if no image is available

    return (
      <View style={styles.itemCard}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.itemImage}
          onError={() => console.warn('Image failed to load:', imageUrl)} // Log if image fails to load
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          <Text style={styles.itemPrice}>
            ₦{(item.price * item.quantity).toLocaleString('en-NG')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchBasketItems();
  }, []);

  return (
    <View style={styles.container}>
      <Header3 onBack={() => navigation.goBack()} title="Your Basket" />

      <FlatList
        data={basket}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>Your basket is empty.</Text>
          )
        }
      />

      {basket.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>
            Total: ₦{getTotalPrice().toLocaleString('en-NG')}
          </Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Basket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Softer background
    paddingHorizontal: 10,
    paddingTop: 7,
  },
  list: {
    paddingBottom: 30,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#777',
    marginVertical: 3,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C8D56',
  },
  removeText: {
    fontSize: 13,
    color: '#E05A47',
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    paddingTop: 16,
    marginTop: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -3 },
    elevation: 6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    textAlign: 'right',
    marginBottom: 12,
  },
  checkoutButton: {
    backgroundColor: '#386F4F',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    marginBottom: 5,
    elevation: 2,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 60,
    fontSize: 16,
    fontStyle: 'italic',
  },
});