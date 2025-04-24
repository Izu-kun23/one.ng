import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import Header3 from '../../components/Header3';
import Fire from '../../Fire';

const CustomerOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPastOrders, setShowPastOrders] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await Fire.shared.getOrders();
      if (ordersData && ordersData.length > 0) {
        const sorted = ordersData.sort((a, b) => {
          const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt);
          const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt);
          return dateB - dateA;
        });
        setOrders(sorted);
        filterOrders(sorted, showPastOrders);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = (ordersList, showPast) => {
    const now = new Date();
    const filtered = ordersList.filter(order => {
      const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt);
      return showPast ? orderDate < now : orderDate <= now;
    });
    setFilteredOrders(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const togglePastOrders = () => {
    const newState = !showPastOrders;
    setShowPastOrders(newState);
    filterOrders(orders, newState);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#F5BA1D', color: '#fff' };
      case 'Processing':
        return { backgroundColor: '#F5BA1D', color: '#fff' };
      case 'Shipped':
        return { backgroundColor: '#1988EA', color: '#fff' };
      case 'Delivered':
        return { backgroundColor: 'green', color: '#fff' };
      default:
        return { backgroundColor: '#ccc', color: '#333' };
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1 }}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.details}>Qty: {item.quantity}</Text>
        <Text style={styles.details}>₦{(item.price * item.quantity).toLocaleString('en-NG')}</Text>
      </View>
    </View>
  );

  const renderOrder = ({ item }) => {
    const date = new Date(item.createdAt?.toDate?.() || item.createdAt);
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status || 'Unknown'}
            </Text>
          </View>
        </View>

        <Text style={styles.orderDate}>
          {date.toLocaleDateString('en-NG')} at {date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
        </Text>

        <FlatList
          data={item.items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 10 }}
          scrollEnabled={false}
        />

        <View style={styles.divider} />
        <Text style={styles.total}>Total: ₦{item.total?.toLocaleString('en-NG') || '0'}</Text>
      </View>
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders(orders, showPastOrders);
  }, [showPastOrders]);

  return (
    <View style={styles.container}>
      <Header3 onBack={() => navigation.goBack()} title="Your Orders" />

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={togglePastOrders}
          style={[
            styles.toggleButton,
            showPastOrders && styles.toggleActive,
          ]}
        >
          <Text style={styles.toggleText}>
            {showPastOrders ? 'Show Recent Orders' : 'Show Past Orders'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.emptyText}>Loading your orders...</Text>
      ) : filteredOrders.length === 0 ? (
        <Text style={styles.emptyText}>No orders to display.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderNumber.toString()}
          renderItem={renderOrder}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* ✅ Go to Home Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Main')}
        style={styles.homeButton}
      >
        <Text style={styles.homeButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomerOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  toggleContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  toggleActive: {
    backgroundColor: '#386F4F',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    marginTop: 6,
    fontSize: 13,
    color: '#888',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    color: '#222',
  },
  details: {
    fontSize: 13,
    color: '#666',
  },
  total: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#228B22',
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  homeButton: {
    backgroundColor: '#386F4F',
    paddingVertical: 15,
    margin: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});