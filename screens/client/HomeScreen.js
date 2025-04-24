import React, { useEffect, useState } from "react";
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
import Fire from "../../Fire";
import { collection, getDocs } from "firebase/firestore";
import Header4 from "../../components/Header4";
import Skeleton from "react-native-reanimated-skeleton"; // Import Skeleton loader

const categories = [
  "All",
  "Clothing",
  "Food",
  "Books and Stationery",
  "Tech and Gadgets",
  "Beauty and Cosmetics",
  "Health and Wellness",
  "Automotive",
  "Home and Living",
  "Toys and Games",
  "Sports and Fitness",
];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [savedShops, setSavedShops] = useState(new Set());
  const [savedProducts, setSavedProducts] = useState(new Set());
  const [loading, setLoading] = useState(true); // State to track loading
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing
  const navigation = useNavigation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        const shopSnapshot = await getDocs(
          collection(Fire.shared.firestore, "shops")
        );
        const productSnapshot = await getDocs(
          collection(Fire.shared.firestore, "products")
        );

        const shopList = shopSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const productList = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setShops(shopList);
        setProducts(productList);
      } catch (err) {
        console.log("❌ Error fetching data:", err);
      } finally {
        setLoading(false); // End loading
      }
    };

    const fetchSavedFavorites = async () => {
      try {
        const shopFavs = await Fire.shared.getFavoritesByType("shop");
        const productFavs = await Fire.shared.getFavoritesByType("product");
        setSavedShops(new Set(shopFavs.map((fav) => fav.itemId)));
        setSavedProducts(new Set(productFavs.map((fav) => fav.itemId)));
      } catch (err) {
        console.error("❌ Error fetching saved favorites:", err);
      }
    };

    fetchData();
    fetchSavedFavorites();
  }, []);

  const handleCategorySelect = (category) => setSelectedCategory(category);

  const toggleSaveShop = async (shopId, vendorId) => {
    const isFavorited = savedShops.has(shopId);
    try {
      if (isFavorited) {
        await Fire.shared.removeFavorite({ itemId: shopId, type: "shop" });
        Alert.alert("Removed", "Shop removed from favorites.");
      } else {
        await Fire.shared.addFavorite({
          itemId: shopId,
          vendorId,
          type: "shop",
        });
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
        await Fire.shared.removeFavorite({
          itemId: productId,
          type: "product",
        });
        Alert.alert("Removed", "Product removed from favorites.");
      } else {
        await Fire.shared.addFavorite({
          itemId: productId,
          vendorId,
          type: "product",
        });
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

  const filteredShops = shops.filter(
    (shop) =>
      (selectedCategory === "All" || shop.category === selectedCategory) &&
      shop.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "All" || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const defaultVendorImage =
    "https://via.placeholder.com/300x200.png?text=Vendor";
  const defaultProductImage =
    "https://via.placeholder.com/200x200.png?text=Product";

  return (
    <View style={styles.container}>
      <Header4 searchText={searchText} setSearchText={setSearchText} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryBox,
                selectedCategory === category && styles.categoryBoxSelected,
              ]}
              onPress={() => handleCategorySelect(category)}
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

        {/* Shops */}
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
                    name={
                      savedShops.has(item.id) ? "bookmark" : "bookmark-outline"
                    }
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
                        {
                          backgroundColor: item.isOpen ? "#4CAF50" : "#D32F2F",
                        },
                      ]}
                    >
                      {item.isOpen ? "Open" : "Closed"}
                    </Text>
                  </View>
                  <Text style={styles.vendorDescription}>{item.about}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Products */}
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
                    name={
                      savedProducts.has(item.id) ? "heart" : "heart-outline"
                    }
                    size={20}
                    color={savedProducts.has(item.id) ? "#D1495B" : "#888"}
                  />
                </TouchableOpacity>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{item.name}</Text>
                  <Text style={styles.vendorDescription}>₦{item.price}</Text>
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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollContent: { paddingTop: 10, paddingBottom: 20 },
  categoryContainer: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categoryBox: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#D8D9DB",
    minWidth: 70,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBoxSelected: {
    backgroundColor: "#386F4F",
    borderColor: "#386F4F",
  },
  categoryText: { fontSize: 13, color: "#333", textAlign: "center" },
  categoryTextSelected: { color: "#FFF", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginLeft: 16,
    marginBottom: 6,
    color: "#333",
  },
  vendorCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    height: 257,
    paddingBottom: 2,
    marginBottom: 10,
  },
  vendorImage: { width: "100%", height: 150 },
  vendorInfo: { padding: 10 },
  vendorName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  vendorDescription: { fontSize: 14, color: "#555", marginTop: 2 },
  saveIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 3,
  },
  statusRow: {
    marginTop: 6,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  skeletonShop: {
    width: 250,
    height: 250,
    marginRight: 10,
    borderRadius: 10,
    marginBottom: 10, // Add some space to make skeleton visible
  },
  skeletonProduct: {
    width: 180,
    height: 250,
    marginRight: 10,
    borderRadius: 10,
    marginBottom: 10, // Add some space to make skeleton visible
  },
});
