import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Switch,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import Header from "../../components/Header2";
import Fire from "../../Fire";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";

const VendorProfile = ({ navigation }) => {
  const [vendor, setVendor] = useState(null);
  const [shopCount, setShopCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchVendorData = async () => {
    const uid = Fire.shared.uid;
    if (!uid) return;

    const vendorData = await Fire.shared.getVendorData(uid);
    setVendor(vendorData);

    const unsubscribe = onSnapshot(
      query(
        collection(Fire.shared.firestore, "shops"),
        where("vendorId", "==", uid)
      ),
      (snapshot) => {
        setShopCount(snapshot.docs.length);
      },
      (error) => {
        console.error("Error listening for shops:", error);
      }
    );

    return () => unsubscribe();
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const uid = Fire.shared.uid;
      if (uid) {
        const vendorData = await Fire.shared.getVendorData(uid);
        setVendor(vendorData);

        const snapshot = await Fire.shared.getShops();
        setShopCount(snapshot.length);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (Fire.shared.signOut) {
      Fire.shared.signOut();
      navigation.navigate("VendorLogin");
    } else {
      console.error("SignOut function is not defined!");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" navigation={navigation} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#386F4F"
          />
        }
      >
        {/* Profile */}
        <View style={styles.profileSection}>
          {vendor?.avatar ? (
            <>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image source={{ uri: vendor.avatar }} style={styles.avatar} />
              </TouchableOpacity>
              <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setModalVisible(false)}
                >
                  <View style={styles.fullImageContainer}>
                    <Image
                      source={{ uri: vendor.avatar }}
                      style={styles.fullImage}
                    />
                  </View>
                </Pressable>
              </Modal>
            </>
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.avatarInitial}>
                {vendor?.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{vendor?.name || "Loading..."}</Text>
          <Text style={styles.email}>{vendor?.email}</Text>
        </View>

        {/* Shop stats */}
        <View style={styles.statsBox}>
          <Text style={styles.statsLabel}>Total Shops</Text>
          <Text style={styles.statsValue}>{shopCount}</Text>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.row}>
            <Text style={styles.option}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.option}>History</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.row}>
            <Text style={styles.option}>Version</Text>
            <Text style={styles.optionValue}>1.0.0</Text>
          </View>
        </View>

        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("VendorEditProfile")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.logoutContent}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#ff0000"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default VendorProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  placeholderAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarInitial: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#777",
  },
  statsBox: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
  },
  statsLabel: {
    fontSize: 16,
    color: "#555",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  option: {
    fontSize: 16,
    color: "#444",
  },
  optionArrow: {
    fontSize: 20,
    color: "#aaa",
  },
  optionValue: {
    fontSize: 16,
    color: "#888",
  },
  editBtn: {
    marginTop: 40,
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#228B21",
  },
  editText: {
    color: "#386F4F",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ff0000",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#ff0000",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageContainer: {
    width: 300,
    height: 300,
    borderRadius: 150, // Half of width/height
    overflow: "hidden",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 150, // Match container
    resizeMode: "cover",
  },
});
