import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddProducts from "./AddProducts";
import Fire from "../../Fire";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const VendorProducts = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { shopId } = route.params || {};

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const vendorId = Fire.shared.uid;
      if (vendorId && shopId) {
        const vendorProducts = await Fire.shared.getVendorProducts(vendorId, shopId);
        setProducts(vendorProducts);
      } else {
        console.warn("No vendor ID or shop ID found");
      }
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      Alert.alert("Error", "Could not fetch products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [shopId]);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const formatPrice = (price) => {
    return price.toLocaleString("en-NG");
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => openModal(item)}>
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₦{formatPrice(item.price)}</Text>
        <Text style={styles.stock}>Stock: {item.stock}</Text>
      </View>
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() =>
          navigation.navigate("EditProducts", {
            product: item,
          })
        }
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>You have no products yet.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Products</Text>
        <TouchableOpacity style={styles.plusButton} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={26} color="#228B22" />
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      )}

      {/* Product Grid */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={ListEmptyComponent}
      />

      {/* Product Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Image source={{ uri: selectedProduct.images[0] }} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalPrice}>₦{formatPrice(selectedProduct.price)}</Text>
                <Text style={styles.modalStock}>Stock: {selectedProduct.stock}</Text>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.addProductModalContainer}>
          <View style={styles.addProductContent}>
            <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeAddBtn}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <AddProducts />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VendorProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    height: 105,
  },
  backButton: {
    borderRadius: 50,
    padding: 15,
    paddingTop: 32,
    paddingLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    paddingTop: 20,
  },
  plusButton: {
    backgroundColor: "#fff",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    padding: 10,
    marginTop: 18,
  },
  list: {
    padding: 18,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    width: (width - 48) / 2,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  price: {
    fontSize: 14,
    color: "#228B22",
    marginTop: 4,
  },
  stock: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: "#228B22",
    paddingVertical: 8,
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    width: "80%",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  modalPrice: {
    fontSize: 16,
    color: "#228B22",
    marginBottom: 6,
  },
  modalStock: {
    fontSize: 14,
    color: "#666",
  },
  addProductModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  addProductContent: {
    backgroundColor: "#fff",
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  closeAddBtn: {
    alignSelf: "flex-end",
    padding: 16,
  },
  loading: {
    paddingTop: 50,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});