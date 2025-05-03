import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header2";
import Fire from "../../Fire";
import DropDownPicker from "react-native-dropdown-picker";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [statusValue, setStatusValue] = useState(null);
  const [statusOptions, setStatusOptions] = useState([
    { label: "Processing", value: "Processing" },
    { label: "Shipped", value: "Shipped" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const customerOrders = await Fire.shared.getAllOrdersForVendor(
        Fire.shared.uid
      );

      const updatedOrders = customerOrders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          productName: item.name,
          productImage: item.image,
        })),
      }));

      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setStatusValue(order.status);
    setModalVisible(true);
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => openOrderModal(item)}
    >
      <View style={styles.orderTop}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <Text
          style={[styles.status, styles[`status_${item.status.toLowerCase()}`]]}
        >
          {item.status}
        </Text>
      </View>

      {item.items.map((product, index) => (
        <View key={index} style={styles.productRow}>
          {/* Product Image */}
          <Image
            source={{ uri: product.productImage }}
            style={styles.productImage}
          />
          
          {/* Product Details */}
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.productName}</Text>
            
            <View style={styles.iconRow}>
              <Ionicons name="cash-outline" size={16} color="#333" />
              <Text style={styles.total}>
                ₦{item.total.toLocaleString("en-NG")}
              </Text>
            </View>
            
            <View style={styles.iconRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.date}>
                {new Date(item.placedAt).toLocaleString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.orderBottom}>
        <Text style={styles.total}>
          Total:{" "}
          <Text style={{ fontWeight: "bold" }}>
            ₦{item.total.toLocaleString("en-NG")}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleStatusUpdate = async () => {
    const updatedOrders = orders.map((order) =>
      order.id === selectedOrder.id ? { ...order, status: statusValue } : order
    );
    setOrders(updatedOrders);
    setModalVisible(false);

    try {
      await Fire.shared.updateOrderStatus(selectedOrder.id, statusValue);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Orders" />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>You have no orders yet.</Text>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={20} color="#000" />
            </Pressable>

            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>
                  Order Summary
                </Text>
                <Text style={styles.modalSub}>
                  Order No: {selectedOrder.orderNumber}
                </Text>
                <View style={styles.iconRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.modalText}>
                    {new Date(selectedOrder.placedAt).toLocaleString("en-NG")}
                  </Text>
                </View>
                <View style={styles.iconRow}>
                  <Ionicons name="cash-outline" size={16} color="#444" />
                  <Text style={styles.modalText}>
                    ₦{selectedOrder.total.toLocaleString("en-NG")}
                  </Text>
                </View>

                <Text style={[styles.modalText, { marginTop: 20 }]}>
                  Change Status:
                </Text>
                <DropDownPicker
                  open={statusDropdownOpen}
                  value={statusValue}
                  items={statusOptions}
                  setOpen={setStatusDropdownOpen}
                  setValue={setStatusValue}
                  setItems={setStatusOptions}
                  placeholder="Select new status"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />

                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={handleStatusUpdate}
                >
                  <Text style={styles.updateBtnText}>Update Status</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  list: {
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  status: {
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  status_processing: {
    backgroundColor: "#FFF6E5",
    color: "#FFA500",
  },
  status_shipped: {
    backgroundColor: "#E4F1FF",
    color: "#1D72B8",
  },
  status_delivered: {
    backgroundColor: "#E5F8E5",
    color: "#28A745",
  },
  status_cancelled: {
    backgroundColor: "#FFE5E5",
    color: "#DC3545",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  productDetails: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 19,
    color: "#333",
    marginBottom: 6,
    fontWeight: "bold",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  total: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
    fontWeight: "bold",

  },
  date: {
    fontSize: 13,
    color: "#777",
    marginLeft: 4,
  },
  orderBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 15,
    color: "#555",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#666",
  },
  dropdown: {
    borderColor: "#DDD",
    marginBottom: 12,
    borderRadius: 12,
  },
  dropdownContainer: {
    borderRadius: 12,
  },
  updateBtn: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  updateBtnText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 30,
  },
});