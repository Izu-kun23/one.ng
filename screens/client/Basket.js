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
    backgroundColor: '#FDFDFD',
    padding: 16,
  },
  list: {
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#228B22',
  },
  removeText: {
    fontSize: 13,
    color: '#D1495B',
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 10,
  },
  total: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: '#386F4F',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 16,
    elevation: 3,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 50,
    fontSize: 16,
  },
});