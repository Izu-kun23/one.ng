import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Entypo } from "@expo/vector-icons";
import Header from "../../components/Header2";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import Fire from "../../Fire";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const VendorShop = ({ navigation }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const shopsCollectionRef = collection(Fire.shared.firestore, "shops");
        const querySnapshot = await getDocs(shopsCollectionRef);
        const fetchedShops = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShops(fetchedShops);
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();

    const unsubscribe = onSnapshot(
      collection(Fire.shared.firestore, "shops"),
      (snapshot) => {
        const updatedShops = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShops(updatedShops);
      }
    );

    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const shopsCollectionRef = collection(Fire.shared.firestore, "shops");
      const querySnapshot = await getDocs(shopsCollectionRef);
      const refreshedShops = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShops(refreshedShops);
    } catch (error) {
      console.error("Error refreshing shops:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleDeleteShop = async (shopId) => {
    Alert.alert(
      "Delete Shop",
      "Are you sure you want to delete this shop? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(Fire.shared.firestore, "shops", shopId));
              setShops(shops.filter((shop) => shop.id !== shopId));
              console.log(`✅ Shop with ID ${shopId} deleted!`);
            } catch (error) {
              console.error("❌ Error deleting shop:", error);
            }
          },
        },
      ]
    );
  };

  const handleArchiveShop = async (shopId) => {
    Alert.alert("Archive Shop", "Are you sure you want to archive this shop?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        onPress: async () => {
          try {
            const shopRef = doc(Fire.shared.firestore, "shops", shopId);
            const shopSnap = await getDoc(shopRef);

            if (shopSnap.exists()) {
              const shopData = shopSnap.data();

              // Move to "archived_shops" collection
              await setDoc(
                doc(Fire.shared.firestore, "archived_shops", shopId),
                shopData
              );

              // Remove from "shops" collection
              await deleteDoc(shopRef);

              setShops(shops.filter((shop) => shop.id !== shopId));
              console.log(`✅ Shop with ID ${shopId} archived!`);
            }
          } catch (error) {
            console.error("❌ Error archiving shop:", error);
          }
        },
      },
    ]);
  };

  const renderShop = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <View style={styles.swipeActions}>
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={() => handleArchiveShop(item.id)}
          >
            <Text style={styles.archiveButtonText}>Archive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteShop(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      <View style={styles.shopCard}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.shopImage} />
        ) : (
          <View style={styles.shopImage} />
        )}

        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.name}</Text>
          <Text style={styles.shopDescription}>{item.description}</Text>

          {item.about && <Text style={styles.shopAbout}>{item.about}</Text>}

          {item.location && (
            <View style={styles.locationContainer}>
              <Entypo name="location-pin" size={16} color="#386F4F" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => console.log("More options for:", item.name)}
        >
          <Entypo
            name="dots-three-vertical"
            size={20}
            color="#666"
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Header title="My Shops" navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color="#386F4F" style={styles.loader} />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={renderShop}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No shops available.</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddShop")}
      >
        <Text style={styles.addButtonText}>+ Add Shop</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
};

export default VendorShop;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  loader: { marginTop: 50 },
  shopCard: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    elevation: 3,
  },
  shopImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 21, fontWeight: "bold", color: "#333" },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  locationText: { fontSize: 12, color: "#666" },
  shopAbout: { fontSize: 16, color: "#444", marginTop: 1, marginBottom: 9 },
  menuIcon: { paddingHorizontal: 10 },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#386F4F",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  swipeActions: { flexDirection: "row" },
  archiveButton: {
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 10,
    marginVertical: 5,
    height: "85%",
    marginRight: 5,
  },
  archiveButtonText: { color: "#fff", fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 10,
    marginVertical: 5,
    height: "85%",
    marginRight: 5,
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold" },
});
