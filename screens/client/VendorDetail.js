import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Fire from "../../Fire";

const { width } = Dimensions.get("window");
const defaultImage = "https://via.placeholder.com/400x300.png?text=No+Image";
const defaultProductImage = "https://via.placeholder.com/200x200.png?text=Product";

export default function VendorDetail({ route }) {
  const { vendor } = route.params;
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [shopId, setShopId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFullDesc, setShowFullDesc] = useState(false);

  const description = vendor.about || vendor.description || "";

  useEffect(() => {
    if (vendor?.images) setImages(vendor.images);

    const fetchShopId = async () => {
      try {
        const id = vendor?.shopId;
        if (id) {
          setShopId(id);
        } else {
          console.warn("⚠️ Vendor has no shopId attached.");
        }
      } catch (error) {
        console.error("Error getting shopId:", error);
      }
    };

    fetchShopId();
  }, [vendor]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!shopId) return;

      try {
        const fetched = await Fire.shared.getProducts(shopId);
        setProducts(fetched);
      } catch (err) {
        console.error("❌ Failed to load products:", err);
      }
    };

    fetchProducts();
  }, [shopId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (shopId) {
        const refreshedProducts = await Fire.shared.getProducts(shopId);
        setProducts(refreshedProducts);
      }
    } catch (error) {
      console.error("Error refreshing vendor products:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vendor.name}</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                alert("Contact Vendor: " + (vendor.contact || "No contact info available."));
              }}
            >
              <Text style={styles.modalOption}>Contact Vendor</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#386F4F" />
        }
      >
        {/* Swipeable Images */}
        <View>
          <FlatList
            data={images.length > 0 ? images : [defaultImage]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
              );
              setActiveIndex(index);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.vendorImage} />
            )}
          />
          <View style={styles.pagination}>
            {(images.length > 0 ? images : [defaultImage]).map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeIndex === index && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
          >
            <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "products" && styles.activeTab]}
            onPress={() => setActiveTab("products")}
          >
            <Text style={[styles.tabText, activeTab === "products" && styles.activeTabText]}>
              Products
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoHeader}>CATEGORY</Text>
            <Text style={styles.vendorCategory}>{vendor.category}</Text>

            <Text style={styles.infoHeader}>ABOUT US:</Text>
            <Text style={styles.vendorDescription}>
              {showFullDesc || description.length <= 150
                ? description
                : description.slice(0, 99) + "..."}
            </Text>

            {description.length > 99 && (
              <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                <Text style={styles.readMore}>
                  {showFullDesc ? "Read Less " : "Read More "}
                </Text> 
              </TouchableOpacity>
            )}

            <Text style={styles.infoHeader}>LOCATION</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={18} color="#888" />
              <Text style={styles.vendorLocation}>{vendor.location}</Text>
            </View>

            <TouchableOpacity style={styles.applyButton} onPress={() => alert("Apply to this shop")}>
              <Text style={styles.applyButtonText}>Apply to this shop</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "products" && (
          <>
            <Text style={styles.sectionTitle}>Products</Text>
            <FlatList
              data={products}
              horizontal
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productCard}
                  onPress={() => navigation.navigate("ProductDetail", { product: item })}
                >
                  <Image
                    source={{ uri: item.images?.[0] || defaultProductImage }}
                    style={styles.productImage}
                  />
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>₦{item.price}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollContainer: { paddingBottom: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#386F4F",
    height: 100,
    paddingHorizontal: 15,
    paddingTop: 30,
    justifyContent: "space-between",
  },
  backButton: { padding: 5 },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  vendorImage: {
    width: width,
    height: 300,
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#ccc",
  },
  dotActive: {
    backgroundColor: "#386F4F",
  },
  tabSwitcher: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    color: "#555",
  },
  activeTab: {
    backgroundColor: "#386F4F",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -10,
  },
  vendorCategory: {
    fontSize: 16,
    color: "#4E4D4B",
    fontWeight: "bold",
    marginBottom: 7,
  },
  vendorDescription: {
    fontSize: 16,
    color: "#4E4D4B",
    marginBottom: 5,
    fontWeight: "bold",
  },
  readMore: {
    color: "#999",
    marginTop: 5,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  vendorLocation: {
    fontSize: 16,
    color: "#4E4D4B",
    marginLeft: 5,
    fontWeight: "bold",
  },
  applyButton: {
    marginTop: 20,
    backgroundColor: "#386F4F",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 10,
    color: "#333",
  },
  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    marginRight: 10,
    width: 180,
  },
  productImage: {
    width: "100%",
    height: 150,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  productPrice: {
    fontSize: 14,
    color: "#555",
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 35,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    fontSize: 16,
    paddingVertical: 17,
    color: "#386F4F",
    textAlign: "center",
  },
  infoHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "grey",
    marginTop: 13,
    marginBottom: 6,
  },
});