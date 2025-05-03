import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddProducts from "./AddProducts";
import Fire from "../../Fire";
import { useNavigation, useRoute } from "@react-navigation/native";
import Modal from "react-native-modal";

const { width } = Dimensions.get("window");

const VendorProducts = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { shopId } = route.params || {};

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const vendorId = Fire.shared.uid;
      if (vendorId && shopId) {
        const vendorProducts = await Fire.shared.getVendorProducts(
          vendorId,
          shopId
        );
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

  const formatPrice = (price) => price.toLocaleString("en-NG");

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₦{formatPrice(item.price)}</Text>
        <Text style={styles.stock}>Stock: {item.stock}</Text>
      </View>
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate("EditProducts", { product: item })}
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>You have no products yet.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.heroSection}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>My Products</Text>
          <TouchableOpacity
            onPress={() => setShowAddProduct(true)}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      )}

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

      {/* Responsive Product Detail Modal with Boost */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        swipeDirection="down"
        onSwipeComplete={closeModal}
        style={styles.bottomModal}
        propagateSwipe={true}
      >
        <View style={[styles.bottomSheet, { maxHeight: "80%" }]}>
          <View style={styles.dragHandle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {selectedProduct && (
              <>
                <Image
                  source={{ uri: selectedProduct.images[0] }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalPrice}>
                  ₦{formatPrice(selectedProduct.price)}
                </Text>
                <Text style={styles.modalStock}>
                  In Stock: {selectedProduct.stock}
                </Text>
                <TouchableOpacity
                  style={styles.boostButton}
                  onPress={() => {
                    closeModal();
                    navigation.navigate("VendorBoost", {
                      product: selectedProduct,
                    });
                  }}
                >
                  <Ionicons name="flash" size={20} color="#fff" />
                  <Text style={styles.boostText}>Boost</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Swipe-Up Add Product Modal */}
      <Modal
        isVisible={showAddProduct}
        onBackdropPress={() => setShowAddProduct(false)}
        swipeDirection="down"
        onSwipeComplete={() => setShowAddProduct(false)}
        style={styles.bottomModal}
      >
        <View style={[styles.bottomSheet, { height: "90%" }]}>
          <View style={styles.dragHandle} />
          <AddProducts
            shopId={shopId}
            onClose={() => {
              setShowAddProduct(false);
              fetchProducts(); // Refresh products list
            }}
          />
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
  heroSection: {
    height: 110,
    backgroundColor: "#10B981",
    justifyContent: "flex-end",
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  backButton: {
    padding: 6,
  },
  addBtn: {
    backgroundColor: "#059669",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
    borderRadius: 16,
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
    backgroundColor: "#10B981",
    paddingVertical: 8,
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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
  loading: {
    paddingTop: 50,
    alignItems: "center",
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
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
    textAlign: "center",
  },
  modalPrice: {
    fontSize: 16,
    color: "#228B22",
    marginBottom: 6,
    textAlign: "center",
  },
  modalStock: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  boostButton: {
    marginTop: 20,
    backgroundColor: "#facc15",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  boostText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});