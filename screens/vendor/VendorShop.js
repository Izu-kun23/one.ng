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
  query,
  where,
} from "firebase/firestore";
import Fire from "../../Fire";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";

const VendorShop = ({ navigation }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const vendorId = Fire.shared.uid;

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const shopsCollectionRef = collection(Fire.shared.firestore, "shops");
        const q = query(shopsCollectionRef, where("vendorId", "==", vendorId));
        const querySnapshot = await getDocs(q);
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

    const q = query(collection(Fire.shared.firestore, "shops"), where("vendorId", "==", vendorId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedShops = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShops(updatedShops);
    });

    return () => unsubscribe();
  }, [vendorId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const shopsCollectionRef = collection(Fire.shared.firestore, "shops");
      const q = query(shopsCollectionRef, where("vendorId", "==", vendorId));
      const querySnapshot = await getDocs(q);
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
  }, [vendorId]);

  const handleDeleteShop = async (shopId) => {
    Alert.alert("Delete Shop", "Are you sure you want to delete this shop? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(Fire.shared.firestore, "shops", shopId));
            setShops((prevShops) => prevShops.filter((shop) => shop.id !== shopId));
          } catch (error) {
            console.error("Error deleting shop:", error);
          }
        },
      },
    ]);
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
              await setDoc(doc(Fire.shared.firestore, "archived_shops", shopId), shopSnap.data());
              await deleteDoc(shopRef);
              setShops((prevShops) => prevShops.filter((shop) => shop.id !== shopId));
            }
          } catch (error) {
            console.error("Error archiving shop:", error);
          }
        },
      },
    ]);
  };

  const renderRightActions = (shopId) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.archiveButton]}
        onPress={() => handleArchiveShop(shopId)}
      >
        <Text style={styles.actionText}>Archive</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => handleDeleteShop(shopId)}
      >
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderShop = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity
        style={styles.shopCard}
        onPress={() => navigation.navigate("ShopDetail", { shop: item })}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.shopImage} />
        ) : (
          <View style={styles.shopImage} />
        )}

        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.name}</Text>
          {item.about && <Text style={styles.shopAbout}>{item.about}</Text>}
          {item.location && (
            <View style={styles.locationContainer}>
              <Entypo name="location-pin" size={16} color="#386F4F" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Header title="My Shops" navigation={navigation} />

      <TouchableOpacity style={styles.archiveButtonContainer} onPress={() => navigation.navigate("ArchivedShops")}>
        <Text style={styles.archiveButtonText}>📂 View Archived Shops</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#386F4F" style={styles.loader} />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={renderShop}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No shops available.</Text>}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddShop")}>
        <Text style={styles.addButtonText}>+ Add Shop</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
};

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
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#386F4F",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginVertical: 5,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "90%",
    borderRadius: 10,
    marginHorizontal: 2,
  },
  archiveButton: {
    backgroundColor: "orange",
  },
  deleteButton: {
    backgroundColor: "red",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  archiveButtonContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  archiveButtonText: { fontSize: 16, color: "#386F4F", fontWeight: "bold" },
});

export default VendorShop;