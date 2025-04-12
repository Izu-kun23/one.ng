import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Header from "../../components/Header2";
import Fire from "../../Fire";
import { onSnapshot, collection, query, where } from "firebase/firestore"; // Firestore real-time listener

const VendorProfile = ({ navigation }) => {
  const [vendor, setVendor] = useState(null);
  const [shopCount, setShopCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch vendor data and shops
  useEffect(() => {
    const fetchVendorData = async () => {
      const uid = Fire.shared.uid;
      if (!uid) return;

      // Fetch vendor data
      const vendorData = await Fire.shared.getVendorData(uid);
      setVendor(vendorData);

      // Set up real-time listener for shops by the vendor
      const unsubscribe = onSnapshot(
        query(
          collection(Fire.shared.firestore, "shops"),
          where("vendorId", "==", uid)
        ),
        (snapshot) => {
          setShopCount(snapshot.docs.length); // Update shop count in real-time
        },
        (error) => {
          console.error("Error listening for shops:", error);
        }
      );

      return () => unsubscribe(); // Cleanup the listener when component unmounts
    };

    fetchVendorData();
  }, []);

  // Logout function
  const handleLogout = () => {
    if (Fire.shared.signOut) {
      // Use 'signOut' method from Fire class
      Fire.shared.signOut(); // Call the signOut function
      navigation.navigate("VendorLogin"); // Navigate back to the Login screen
    } else {
      console.error("SignOut function is not defined!");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar & Name */}
        <View style={styles.profileSection}>
          {vendor?.avatar ? (
            <Image source={{ uri: vendor.avatar }} style={styles.avatar} />
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

        {/* Stats */}
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
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout} // Call handleLogout on button press
        >
          <Text style={styles.logoutText}>Logout</Text>
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
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: '#e74c3c', // Red color for logout button
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
