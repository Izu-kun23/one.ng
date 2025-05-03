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
    const filtered = ordersList.filter(order => {
      const isDelivered = order.status === 'Delivered';
      return showPast ? isDelivered : !isDelivered;
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
        {/* Status and Order Number */}
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Order Date */}
        <Text style={styles.orderDate}>
          {date.toLocaleDateString('en-NG')} at {date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {/* Product Details */}
        <FlatList
          data={item.items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 10 }}
          scrollEnabled={false}
        />

        {/* Divider and Total */}
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
    backgroundColor: '#F9FAFB',
  },
  toggleContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    marginTop: 12, // Added margin for separation between products
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4, // Added margin for better spacing
    color: '#1F2937',
  },
  details: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2, // Added margin for spacing between quantity and price
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    color: '#059669',
    marginTop: 12, // Increased margin to give space before total amount
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 12, // Adjusted margin for a cleaner look
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 16,
  },
  homeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    margin: 58,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});