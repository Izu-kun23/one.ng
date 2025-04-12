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
  import {
    collection,
    getDocs,
    onSnapshot,
    deleteDoc,
    doc,
    setDoc,
    getDoc,
  } from "firebase/firestore";
  import Fire from "../../Fire";
  import Header from "../../components/Header3";
  import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
  
  const ArchivedShops = ({ navigation }) => {
    const [archivedShops, setArchivedShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
  
    useEffect(() => {
      const fetchArchivedShops = async () => {
        setLoading(true);
        try {
          const archivedCollectionRef = collection(Fire.shared.firestore, "archived_shops");
          const querySnapshot = await getDocs(archivedCollectionRef);
          const fetchedArchivedShops = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setArchivedShops(fetchedArchivedShops);
        } catch (error) {
          console.error("Error fetching archived shops:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchArchivedShops();
  
      const unsubscribe = onSnapshot(collection(Fire.shared.firestore, "archived_shops"), (snapshot) => {
        const updatedArchivedShops = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArchivedShops(updatedArchivedShops);
      });
  
      return () => unsubscribe();
    }, []);
  
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        const archivedCollectionRef = collection(Fire.shared.firestore, "archived_shops");
        const querySnapshot = await getDocs(archivedCollectionRef);
        const refreshedShops = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArchivedShops(refreshedShops);
      } catch (error) {
        console.error("Error refreshing archived shops:", error);
      } finally {
        setRefreshing(false);
      }
    }, []);
  
    const handleUnarchiveShop = async (shopId) => {
      Alert.alert("Unarchive Shop", "Move this shop back to active shops?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unarchive",
          onPress: async () => {
            try {
              const shopRef = doc(Fire.shared.firestore, "archived_shops", shopId);
              const shopSnap = await getDoc(shopRef);
  
              if (shopSnap.exists()) {
                // Move shop back to active shops
                await setDoc(doc(Fire.shared.firestore, "shops", shopId), shopSnap.data());
  
                // Remove from archive
                await deleteDoc(shopRef);
  
                // Update UI
                setArchivedShops((prevShops) => prevShops.filter((shop) => shop.id !== shopId));
              }
            } catch (error) {
              console.error("Error unarchiving shop:", error);
            }
          },
        },
      ]);
    };
  
    const renderArchivedShop = ({ item }) => (
      <Swipeable
        renderRightActions={() => (
          <View style={styles.swipeActions}>
            <TouchableOpacity style={styles.unarchiveButton} onPress={() => handleUnarchiveShop(item.id)}>
              <Text style={styles.unarchiveButtonText}>Unarchive</Text>
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
  
            {item.location && (
              <View style={styles.locationContainer}>
                <Entypo name="location-pin" size={16} color="#386F4F" />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            )}
          </View>
        </View>
      </Swipeable>
    );
  
    return (
      <GestureHandlerRootView style={styles.container}>
        <Header title="Archived Shops" navigation={navigation} />
  
        {loading ? (
          <ActivityIndicator size="large" color="#386F4F" style={styles.loader} />
        ) : (
          <FlatList
            data={archivedShops}
            keyExtractor={(item) => item.id}
            renderItem={renderArchivedShop}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={<Text style={styles.emptyText}>No archived shops available.</Text>}
          />
        )}
      </GestureHandlerRootView>
    );
  };
  
  export default ArchivedShops;
  
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
      elevation: 3 
    },
    shopImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
    shopInfo: { flex: 1 },
    shopName: { fontSize: 21, fontWeight: "bold", color: "#333" },
    locationContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
    locationText: { fontSize: 12, color: "#666" },
    emptyText: { textAlign: "center", fontSize: 16, color: "#888", marginTop: 20 },
  
    swipeActions: { flexDirection: "row" },
    unarchiveButton: {
      backgroundColor: "green",
      justifyContent: "center",
      alignItems: "center",
      width: 100,
      borderRadius: 10,
      marginVertical: 5,
      height: "85%",
      marginRight: 5,
    },
    unarchiveButtonText: { color: "#fff", fontWeight: "bold" },
  });