import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Animated,
} from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import Fire from "../../Fire";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header4 from "../../components/Header4";
import { scale, verticalScale } from "react-native-size-matters";
import { RFValue } from "react-native-responsive-fontsize";

export default class SettingsScreen extends React.Component {
  state = {
    user: {},
    isDarkTheme: false,
    notificationsEnabled: true,
    imageOpacity: new Animated.Value(0), // Initial opacity for fade-in effect
  };

  unsubscribe = null;

  componentDidMount() {
    const userId = this.props.uid || Fire.shared.uid;
    if (!userId) return;

    const userRef = doc(Fire.shared.firestore, "users", userId);
    this.unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        this.setState({ user: docSnap.data() });
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  handleLogout = () => {
    Fire.shared.signOut(); // Your custom logout logic
  
    this.setState({ user: {} });
  
    this.props.navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }], // Ensure the name matches exactly from your root navigator
    });
  };

  toggleTheme = () => {
    this.setState((prev) => ({ isDarkTheme: !prev.isDarkTheme }));
  };

  toggleNotifications = () => {
    this.setState((prev) => ({
      notificationsEnabled: !prev.notificationsEnabled,
    }));
  };

  // Function to animate image opacity when it loads
  handleImageLoad = () => {
    Animated.timing(this.state.imageOpacity, {
      toValue: 1, // Fade in fully
      duration: 500, // 500ms fade-in duration
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  };

  render() {
    const { user, isDarkTheme, notificationsEnabled } = this.state;

    return (
      <View style={styles.container}>
        <Header4 />
        <ScrollView
          contentContainerStyle={{ paddingBottom: verticalScale(30) }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={styles.profileHeader}>
            <Animated.Image
              source={
                user.avatar
                  ? { uri: user.avatar }
                  : require("../../assets/tempAvatar.jpg")
              }
              style={[styles.avatar, { opacity: this.state.imageOpacity }]} // Animated opacity
              onLoad={this.handleImageLoad} // Trigger fade-in effect when the image is loaded
            />
            <Text style={styles.name}>{user.name || "User Name"}</Text>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => this.props.navigation.navigate("EditProfile")}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardItem}>
                <Ionicons name="moon-outline" size={scale(18)} color="#333" style={styles.icon} />
                <Text style={styles.cardText}>Dark Theme</Text>
                <View style={{ flex: 1 }} />
                <Switch
                  value={isDarkTheme}
                  onValueChange={this.toggleTheme}
                  trackColor={{ false: "#ccc", true: "#386F4F" }}
                  thumbColor={Platform.OS === "android" ? "#fff" : undefined}
                />
              </View>
              <View style={[styles.cardItem, styles.lastCardItem]}>
                <Ionicons name="notifications-circle-outline" size={scale(18)} color="#333" style={styles.icon} />
                <Text style={styles.cardText}>Push Notifications</Text>
                <View style={{ flex: 1 }} />
                <Switch
                  value={notificationsEnabled}
                  onValueChange={this.toggleNotifications}
                  trackColor={{ false: "#ccc", true: "#386F4F" }}
                  thumbColor={Platform.OS === "android" ? "#fff" : undefined}
                />
              </View>
            </View>

            {/* Legal Section */}
            <View style={styles.card}>
              <TouchableOpacity style={styles.cardItem}>
                <Ionicons name="shield-checkmark-outline" size={scale(18)} color="#333" style={styles.icon} />
                <Text style={styles.cardText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cardItem}>
                <Ionicons name="document-text-outline" size={scale(18)} color="#333" style={styles.icon} />
                <Text style={styles.cardText}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cardItem, styles.lastCardItem]}>
                <Ionicons name="trash-outline" size={scale(18)} color="#E74C3C" style={styles.icon} />
                <Text style={styles.deleteText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Customer Orders Button */}
          <TouchableOpacity
            style={styles.customerOrdersButton}
            onPress={() => this.props.navigation.navigate("CustomerOrders")}
          >
            <Ionicons name="cart-outline" size={scale(18)} color="#000" style={styles.icon} />
            <Text style={styles.customerOrdersText}>Orders</Text>
          </TouchableOpacity>

          {/* Bottom Buttons */}
          <TouchableOpacity
            style={styles.vendorButton}
            onPress={() => this.props.navigation.navigate("Vendor")}
          >
            <Ionicons name="briefcase-outline" size={scale(18)} color="#000" style={styles.icon} />
            <Text style={styles.vendorText}>Switch to Vendor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
            <Ionicons name="log-out-outline" size={scale(18)} color="#fff" style={styles.icon} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA", // light grayish background
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: verticalScale(20),
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB", // Tailwind's gray-200
    borderBottomWidth: 1,
  },
  avatar: {
    width: scale(84),
    height: scale(84),
    borderRadius: scale(42),
    marginBottom: verticalScale(8),
  },
  name: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#111827", // Tailwind's gray-900
  },
  editProfileButton: {
    marginTop: verticalScale(6),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: scale(999), // Fully rounded
    borderColor: "#D1D5DB", // Tailwind's gray-300
    borderWidth: 1,
    backgroundColor: "#F9FAFB",
  },
  editProfileText: {
    color: "#111827",
    fontSize: RFValue(12),
    fontWeight: "500",
  },
  cardContainer: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(20),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  lastCardItem: {
    borderBottomWidth: 0,
  },
  cardText: {
    fontSize: RFValue(14),
    color: "#374151", // Tailwind gray-700
    fontWeight: "500",
  },
  deleteText: {
    color: "#EF4444", // Tailwind red-500
    fontWeight: "600",
    fontSize: RFValue(14),
  },
  icon: {
    marginRight: scale(8),
  },
  customerOrdersButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(20),
    marginHorizontal: scale(80),
    borderRadius: scale(10),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  customerOrdersText: {
    color: "#111827",
    fontSize: RFValue(14),
    fontWeight: "600",
    marginLeft: scale(6),
  },
  vendorButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(14),
    marginHorizontal: scale(80),
    borderRadius: scale(10),
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  vendorText: {
    color: "#111827",
    fontSize: RFValue(14),
    fontWeight: "600",
    marginLeft: scale(6),
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#16A34A", // Tailwind green-600
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(12),
    marginHorizontal: scale(80),
    borderRadius: scale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: RFValue(14),
    fontWeight: "600",
    marginLeft: scale(6),
  },
});