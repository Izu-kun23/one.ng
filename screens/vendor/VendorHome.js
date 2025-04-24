import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LineChart } from 'react-native-chart-kit';
import Header from '../../components/Header';
import Fire from '../../Fire';

const screenWidth = Dimensions.get('window').width;

const weeklyData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{ data: [4000, 5000, 4500, 6000, 7000, 4800, 5300] }],
};

const monthlyData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{ data: [12000, 18000, 15000, 20000, 17000] }],
};

const VendorHome = () => {
  const [chartData, setChartData] = useState(weeklyData);
  const [viewMode, setViewMode] = useState('Weekly');
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(Date.now());
  const [avatar, setAvatar] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [notifications, setNotifications] = useState([]);

  const toggleView = () => {
    if (viewMode === 'Weekly') {
      setChartData(monthlyData);
      setViewMode('Monthly');
    } else {
      setChartData(weeklyData);
      setViewMode('Weekly');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setAnimationKey(Date.now());
      fetchData();
    }, 1500);
  };

  const fetchData = async () => {
    const uid = Fire.shared.uid;
    if (!uid) return;

    try {
      const vendorData = await Fire.shared.getVendorData(uid);
      if (vendorData) {
        setAvatar(vendorData.avatar);
        setVendorName(vendorData.name || '');
      }

      const notifData = await Fire.shared.getVendorNotifications(uid);

      const enriched = await Promise.all(
        notifData.map(async (notif) => {
          const userData = await Fire.shared.getUserData(notif.userId);
          let itemName = '';

          if (notif.type === 'shop') {
            const shopDoc = await Fire.shared.getShopById(notif.itemId);
            itemName = shopDoc?.name || 'a shop';
          } else if (notif.type === 'product') {
            const productDoc = await Fire.shared.getProductById(notif.itemId);
            itemName = productDoc?.name || 'a product';
          }

          return {
            ...notif,
            userName: userData?.name || 'Someone',
            itemName,
          };
        })
      );

      setNotifications(enriched.reverse());
    } catch (err) {
      console.error('❌ Failed to fetch vendor data or notifications:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Overview" avatar={avatar} name={vendorName} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animatable.View
          key={animationKey}
          animation="fadeInUp"
          duration={600}
          useNativeDriver
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardRow}>
            {[
              { title: 'Total Sales', value: '₦150,000' },
              { title: 'Orders', value: '320' },
              { title: 'Pending Orders', value: '15' },
              { title: 'Products', value: '57' },
            ].map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardValue}>{item.value}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={toggleView} style={styles.toggleButton}>
              <Text style={styles.toggleText}>
                Switch to {viewMode === 'Weekly' ? 'Monthly' : 'Weekly'} View
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Sales Overview ({viewMode})</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            fromZero
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
              labelColor: () => '#000',
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#228B22',
              },
            }}
            bezier
            style={styles.chart}
          />

          <Text style={styles.sectionTitle}>Notifications</Text>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>You have no notifications yet.</Text>
          ) : (
            notifications.map((note) => (
              <View key={note.id} style={styles.notification}>
                <Text style={styles.notificationText}>
                  {note.userName} favorited your {note.type}{' '}
                  <Text style={{ fontWeight: 'bold' }}>{note.itemName}</Text>
                </Text>
                <Text style={styles.notificationTime}>
                  {new Date(note.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

export default VendorHome;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  cardRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginRight: 16,
    elevation: 2,
    width: 180,
  },
  cardTitle: { fontSize: 14, color: '#555', marginBottom: 6 },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#228B21' },
  toggleContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  toggleButton: {
    backgroundColor: '#E0F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleText: { color: '#228B22', fontSize: 14, fontWeight: '500' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  chart: { borderRadius: 12, marginHorizontal: 16 },
  notification: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },
  notificationText: { color: '#333', fontSize: 14 },
  notificationTime: { fontSize: 11, color: '#999', marginTop: 4 },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
});