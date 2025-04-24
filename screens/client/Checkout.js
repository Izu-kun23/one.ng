import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import Header3 from '../../components/Header3';
import Fire from '../../Fire';

const generateOrderNumber = () => {
  const random1 = Math.floor(1000 + Math.random() * 9000);
  const random2 = Math.floor(100000 + Math.random() * 900000);
  const random3 = Math.floor(10 + Math.random() * 90);
  return `ORD-${random1}-${random2}-${random3}`;
};

const sendOrderConfirmationEmail = async (orderData) => {
  try {
    console.log('Sending email for order:', orderData);

    const response = await fetch('http://192.168.0.152:3000/send-order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: orderData.billing.email,
        name: orderData.billing.name,
        orderNumber: orderData.orderNumber,
        items: orderData.items,
        total: orderData.total,
        shipping: orderData.shipping,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Email sent successfully:', data);
    } else {
      console.error('Error sending email:', data);
      Alert.alert('Error', 'Failed to send confirmation email');
    }
  } catch (error) {
    console.error('Error in sending email:', error);
    Alert.alert('Error', 'Failed to send confirmation email');
  }
};

const Checkout = ({ route, navigation }) => {
  const { items } = route.params;
  const [shipping, setShipping] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
  });

  const [billing, setBilling] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    email: '',
    name: '', // Add name field to billing state
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTotalPrice = () => {
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    const shippingFields = Object.values(shipping).every(Boolean);
    const billingFields = Object.values(billing).every(Boolean);
  
    if (!shippingFields || !billingFields) {
      Alert.alert("Incomplete Info", "Please fill out all shipping and billing address fields.");
      return;
    }
  
    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      items,
      shipping,
      billing,
      total: getTotalPrice(),
      placedAt: new Date().toISOString(),
    };
  
    setLoading(true);
    try {
      const orderId = await Fire.shared.addOrder(orderData); // Order is placed here
      setOrderNumber(orderNumber);
      setOrderDetails(orderData.items);
      setOrderPlaced(true);
      setModalVisible(true); // Show the modal with confirmation

      // Send confirmation email after order is placed
      await sendOrderConfirmationEmail(orderData);

      // Clear basket
      await Fire.shared.clearBasket();

      // Delay navigation to CustomerOrders after modal is shown
      setTimeout(() => {
        navigation.navigate('CustomerOrders', { orderId, orderNumber });
      }, 2000); // Delay navigation by 2 seconds to show modal first
    } catch (error) {
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/100' }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        <Text style={styles.itemPrice}>₦{(item.price * item.quantity).toLocaleString('en-NG')}</Text>
      </View>
    </View>
  );

  const renderAddressFields = (label, values, setValues) => (
    <View>
      <Text style={styles.sectionTitle}>{label} Address</Text>
      {["address1", "address2", "city", "state", "country"].map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field.replace(/\b\w/g, l => l.toUpperCase()).replace(/\d/g, '')}
          value={values[field]}
          onChangeText={(text) => setValues({ ...values, [field]: text })}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Header3 onBack={() => navigation.goBack()} title="Checkout" />

        <Text style={styles.sectionTitle}>Order Summary</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        <Text style={styles.total}>Total: ₦{getTotalPrice().toLocaleString('en-NG')}</Text>

        {renderAddressFields("Shipping", shipping, setShipping)}

        {/* Billing Address Fields */}
        <View>
          <Text style={styles.sectionTitle}>Billing Address</Text>
          {["name", "address1", "address2", "city", "state", "country"].map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={field.replace(/\b\w/g, l => l.toUpperCase()).replace(/\d/g, '')}
              value={billing[field]}
              onChangeText={(text) => setBilling({ ...billing, [field]: text })}
            />
          ))}
          {/* Email Input Field */}
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={billing.email}
            onChangeText={(text) => setBilling({ ...billing, email: text })}
          />
        </View>

        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
          <Text style={styles.btnText}>Place Order</Text>
        </TouchableOpacity>

        {/* Modal with success animation */}
        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>

              <LottieView
                source={require('../../assets/animation/checkmark.json')}
                autoPlay
                loop={false}
                style={styles.checkmark}
              />
              <Text style={styles.successText}>Thanks for your order!</Text>
              <Text style={styles.orderNumber}>Order Number: {orderNumber}</Text>

              <FlatList
                data={orderDetails}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    padding: 10,
    paddingHorizontal: 25,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
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
  total: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 18,
    marginHorizontal: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  placeOrderBtn: {
    backgroundColor: '#386F4F',
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkmark: {
    width: 100,
    height: 100,
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
  },
  orderNumber: {
    fontSize: 16,
    color: '#666',
    marginTop: 6,
    marginBottom: 10,
  },
  closeIcon: {
    alignSelf: 'flex-end', 
    marginBottom: -10,
  },
});