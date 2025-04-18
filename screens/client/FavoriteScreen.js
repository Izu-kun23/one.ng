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
        {
          title: "Favorite Shops",
          data: shopData.filter(Boolean),
        },
        {
          title: "Favorite Products",
          data: productData.filter(Boolean),
        },
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
      <Text style={styles.itemName}>{item.name}</Text>
      {item.type === "shop" ? (
        <Text style={styles.itemDescription}>{item.about}</Text>
      ) : (
        <Text style={styles.itemPrice}>₦{item.price}</Text>
      )}
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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    paddingTop: 64,
    paddingBottom: 14,
    backgroundColor: "#386F4F",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
  },
  itemImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: "#000",
    marginTop: 5,
    fontWeight: "bold",
  },
});

export default FavoriteScreen;