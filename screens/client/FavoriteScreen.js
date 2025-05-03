import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import Fire from "../../Fire";
import { doc, getDoc } from "firebase/firestore";

const defaultImage = "https://via.placeholder.com/150x150.png?text=No+Image";

const FavoriteScreen = () => {
  const [sections, setSections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      setRefreshing(true);

      const shopFavs = await Fire.shared.getFavoritesByType("shop");
      const productFavs = await Fire.shared.getFavoritesByType("product");

      const shopData = await Promise.all(
        shopFavs.map(async (fav) => {
          const ref = doc(Fire.shared.firestore, "shops", fav.itemId);
          const snap = await getDoc(ref);
          return snap.exists() ? { id: snap.id, type: "shop", ...snap.data() } : null;
        })
      );

      const productData = await Promise.all(
        productFavs.map(async (fav) => {
          const ref = doc(Fire.shared.firestore, "products", fav.itemId);
          const snap = await getDoc(ref);
          return snap.exists() ? { id: snap.id, type: "product", ...snap.data() } : null;
        })
      );

      setSections([
        { title: "Favorite Shops", data: shopData.filter(Boolean) },
        { title: "Favorite Products", data: productData.filter(Boolean) },
      ]);
    } catch (error) {
      console.error("❌ Error refreshing favorites:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image
        source={{ uri: item.images?.[0] || defaultImage }}
        style={styles.itemImage}
      />
      <View style={styles.textContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.type === "product" && (
          <Text style={styles.itemPrice}>₦{Number(item.price).toLocaleString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No favorites yet.</Text>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchFavorites} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", // Light gray background for a soft feel
  },
  header: {
    paddingTop: 64,
    paddingBottom: 20,
    backgroundColor: "#386F4F", // Soft blue header
    alignItems: "center",
    justifyContent: "center",
   
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#FFFFFF", // Soft white text
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 12,
    color: "#495057", // Darker gray for readability
  },
  emptyText: {
    textAlign: "center",
    color: "#868E96",
    fontSize: 16,
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16, // Rounded corners for soft UI
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    overflow: "hidden", // Prevents image overflow from rounded corners
  },
  itemImage: {
    width: "100%",
    height: 180,
    borderRadius: 16, // Rounded image corners
    resizeMode: "cover",
  },
  textContent: {
    marginTop: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#343A40", // Slightly muted color for text
  },
  itemPrice: {
    fontSize: 15,
    color: "#28A745", // Soft green price color
    fontWeight: "600",
    marginTop: 6,
  },
});

export default FavoriteScreen;