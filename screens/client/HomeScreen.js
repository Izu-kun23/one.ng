import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import Fire from "../../Fire";
import Header4 from "../../components/Header4";
import Skeleton from "react-native-reanimated-skeleton";

// Constants
const categories = [
  "All", "Clothing", "Food", "Books and Stationery", "Tech and Gadgets",
  "Beauty and Cosmetics", "Health and Wellness", "Automotive", "Home and Living",
  "Toys and Games", "Sports and Fitness",
];
const defaultVendorImage = "https://via.placeholder.com/300x200.png?text=Vendor";
const defaultProductImage = "https://via.placeholder.com/200x200.png?text=Product";

const truncate = (text, maxLength = 60) =>
  text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [savedShops, setSavedShops] = useState(new Set());
  const [savedProducts, setSavedProducts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [shopSnapshot, productSnapshot] = await Promise.all([
        getDocs(collection(Fire.shared.firestore, "shops")),
        getDocs(collection(Fire.shared.firestore, "products")),
      ]);

      setShops(shopSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setProducts(productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedFavorites = useCallback(async () => {
    try {
      const shopFavs = await Fire.shared.getFavoritesByType("shop");
      const productFavs = await Fire.shared.getFavoritesByType("product");
      setSavedShops(new Set(shopFavs.map((fav) => fav.itemId)));
      setSavedProducts(new Set(productFavs.map((fav) => fav.itemId)));
    } catch (err) {
      console.error("❌ Error fetching favorites:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchSavedFavorites();
  }, [fetchData, fetchSavedFavorites]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await fetchSavedFavorites();
    setRefreshing(false);
  };

  const toggleSaveShop = async (shopId, vendorId) => {
    const isFavorited = savedShops.has(shopId);
    try {
      if (isFavorited) {
        await Fire.shared.removeFavorite({ itemId: shopId, type: "shop" });
        Alert.alert("Removed", "Shop removed from favorites.");
      } else {
        await Fire.shared.addFavorite({ itemId: shopId, vendorId, type: "shop" });
        Alert.alert("Saved", "Shop added to favorites!");
      }

      setSavedShops((prev) => {
        const updated = new Set(prev);
        isFavorited ? updated.delete(shopId) : updated.add(shopId);
        return updated;
      });
    } catch (err) {
      console.log("Error toggling shop favorite:", err);
    }
  };

  const toggleSaveProduct = async (productId, vendorId) => {
    const isFavorited = savedProducts.has(productId);
    try {
      if (isFavorited) {
        await Fire.shared.removeFavorite({ itemId: productId, type: "product" });
        Alert.alert("Removed", "Product removed from favorites.");
      } else {
        await Fire.shared.addFavorite({ itemId: productId, vendorId, type: "product" });
        Alert.alert("Saved", "Product added to favorites!");
      }

      setSavedProducts((prev) => {
        const updated = new Set(prev);
        isFavorited ? updated.delete(productId) : updated.add(productId);
        return updated;
      });
    } catch (err) {
      console.log("Error toggling product favorite:", err);
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter(
      (shop) =>
        (selectedCategory === "All" || shop.category?.toLowerCase() === selectedCategory.toLowerCase()) &&
        shop.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [shops, selectedCategory, searchText]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        (selectedCategory === "All" || product.category?.toLowerCase() === selectedCategory.toLowerCase()) &&
        product.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [products, selectedCategory, searchText]);

  return (
    <View style={styles.container}>
      <Header4 searchText={searchText} setSearchText={setSearchText} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryBox,
                selectedCategory === category && styles.categoryBoxSelected,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Shops</Text>
        {loading ? (
          <Skeleton duration={1000} count={5} style={styles.skeletonShop} />
        ) : (
          <FlatList
            data={filteredShops}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.vendorCard, { width: 250, marginRight: 10 }]}
                onPress={() =>
                  navigation.navigate("VendorDetail", { vendor: item })
                }
              >
                <Image
                  source={{ uri: item.images?.[0] || defaultVendorImage }}
                  style={styles.vendorImage}
                />
                <TouchableOpacity
                  style={styles.saveIcon}
                  onPress={() => toggleSaveShop(item.id, item.vendorId)}
                >
                  <Ionicons
                    name={savedShops.has(item.id) ? "bookmark" : "bookmark-outline"}
                    size={22}
                    color={savedShops.has(item.id) ? "#386F4F" : "#888"}
                  />
                </TouchableOpacity>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{item.name}</Text>
                  <View style={styles.statusRow}>
                    <Text
                      style={[
                        styles.statusBadge,
                        { backgroundColor: item.isOpen ? "#4CAF50" : "#D32F2F" },
                      ]}
                    >
                      {item.isOpen ? "Open" : "Closed"}
                    </Text>
                  </View>
                  <Text style={styles.vendorDescription}>{truncate(item.about)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <Text style={styles.sectionTitle}>Products</Text>
        {loading ? (
          <Skeleton duration={1000} count={5} style={styles.skeletonProduct} />
        ) : (
          <FlatList
            data={filteredProducts}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.vendorCard, { width: 180, marginRight: 10 }]}
                onPress={() =>
                  navigation.navigate("ProductDetail", { product: item })
                }
              >
                <Image
                  source={{ uri: item.images?.[0] || defaultProductImage }}
                  style={{ width: "100%", height: 150 }}
                />
                <TouchableOpacity
                  style={styles.saveIcon}
                  onPress={() => toggleSaveProduct(item.id, item.vendorId)}
                >
                  <Ionicons
                    name={savedProducts.has(item.id) ? "heart" : "heart-outline"}
                    size={20}
                    color={savedProducts.has(item.id) ? "#D1495B" : "#888"}
                  />
                </TouchableOpacity>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{truncate(item.name)}</Text>
                  <Text style={styles.vendorDescription}>
                    ₦{Number(item.price).toLocaleString("en-NG")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 20 },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    elevation: 3,
  },
  categoryBoxSelected: {
    backgroundColor: "#386F4F",
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  categoryText: {
    color: "#444",
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    color: "#1E293B",
  },
  vendorCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  vendorImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  saveIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ffffffee",
    borderRadius: 24,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  vendorInfo: {
    padding: 14,
    backgroundColor: "#fff",
  },
  vendorName: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 6,
    color: "#111827",
  },
  vendorDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusBadge: {
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  skeletonShop: { height: 200, marginHorizontal: 16, marginBottom: 12, borderRadius: 16 },
  skeletonProduct: { height: 160, marginHorizontal: 16, marginBottom: 12, borderRadius: 16 },
});