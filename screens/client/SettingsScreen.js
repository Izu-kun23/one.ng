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
    Fire.shared.signOut();
    this.setState({ user: {} });
    this.props.navigation.navigate("Auth");
  };

  toggleTheme = () => {
    this.setState((prev) => ({ isDarkTheme: !prev.isDarkTheme }));
  };

  toggleNotifications = () => {
    this.setState((prev) => ({
      notificationsEnabled: !prev.notificationsEnabled,
    }));
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
            <Image
              source={
                user.avatar
                  ? { uri: user.avatar }
                  : require("../../assets/tempAvatar.jpg")
              }
              style={styles.avatar}
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
    backgroundColor: "#f9f9f9",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: verticalScale(16),
    backgroundColor: "#fff",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  avatar: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    marginBottom: verticalScale(6),
  },
  name: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#333",
  },
  editProfileButton: {
    marginTop: verticalScale(4),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(15),
    borderColor: "#ccc",
    borderWidth: 1,
  },
  editProfileText: {
    color: "#333",
    fontSize: RFValue(12),
    fontWeight: "500",
  },
  cardContainer: {
    paddingHorizontal: scale(12),
    marginTop: verticalScale(14),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: scale(6),
    marginBottom: verticalScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(8),
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  lastCardItem: {
    borderBottomWidth: 0,
  },
  cardText: {
    fontSize: RFValue(14),
    color: "#333",
    fontWeight: "500",
  },
  deleteText: {
    color: "#E74C3C",
    fontWeight: "600",
    fontSize: RFValue(14),
  },
  icon: {
    marginRight: scale(6),
  },
  vendorButton: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(16),
    marginHorizontal: scale(70),
    borderRadius: scale(6),
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  vendorText: {
    color: "#000",
    fontSize: RFValue(14),
    fontWeight: "600",
    marginLeft: scale(4),
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#386F4F",
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(10),
    marginHorizontal: scale(70),
    borderRadius: scale(6),
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: RFValue(14),
    fontWeight: "600",
    marginLeft: scale(4),
  },
});