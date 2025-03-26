import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import Fire from "../Fire";
import Ionicons from "react-native-vector-icons/Ionicons";  // Import Ionicons

export default class ProfileScreen extends React.Component {
  state = {
    user: {},
  };

  unsubscribe = null;

  componentDidMount() {
    const userId = this.props.uid || Fire.shared.uid;

    if (!userId) {
      console.error("🔥 User ID is undefined!");
      return;
    }

    const userRef = doc(Fire.shared.firestore, "users", userId);

    this.unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        this.setState({ user: docSnap.data() });
      } else {
        console.log("🚨 No such user in Firestore!");
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleLogout = () => {
    Fire.shared.signOut();
    this.setState({ user: {} });
    this.props.navigation.navigate("Auth");
  };

  render() {
    const { user } = this.state;

    return (
      <ScrollView style={styles.container}>
        {/* User Profile Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                user.avatar
                  ? { uri: user.avatar }
                  : require("../assets/tempAvatar.jpg")
              }
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>{user.name || "User Name"}</Text>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editProfileButton} onPress={() => this.props.navigation.navigate("EditProfile")}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Cards Section */}
        <View style={styles.cardContainer}>
          {/* First Card: History & Reminders */}
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardItem}>
              <Ionicons name="time-outline" size={20} color="#333" style={styles.icon} />
              <Text style={styles.cardText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardItem, styles.lastCardItem]}>
              <Ionicons name="notifications-outline" size={20} color="#333" style={styles.icon} />
              <Text style={styles.cardText}>Reminders</Text>
            </TouchableOpacity>
          </View>

          {/* Second Card: Privacy, Terms, Delete Account */}
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#333" style={styles.icon} />
              <Text style={styles.cardText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardItem}>
              <Ionicons name="document-text-outline" size={20} color="#333" style={styles.icon} />
              <Text style={styles.cardText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardItem, styles.lastCardItem]}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" style={styles.icon} />
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Buttons */}
        <TouchableOpacity style={styles.vendorButton}>
          <Ionicons name="briefcase-outline" size={20} color="black" style={styles.icon} />
          <Text style={styles.vendorText}>Switch to Vendor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" style={styles.icon} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  profileHeader: {
    marginTop: 64,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    shadowColor: "#151734",
    shadowRadius: 30,
    shadowOpacity: 0.4,
    marginBottom: 15,
  },
  avatar: {
    width: 136,
    height: 136,
    borderRadius: 68,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  editProfileButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#386F4F",
  },
  editProfileText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  lastCardItem: {
    borderBottomWidth: 0, // Remove border for last item
  },
  icon: {
    marginRight: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  deleteText: {
    color: "#E74C3C",
    fontWeight: "600",
  },
  vendorButton: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 13,
    marginTop: 20,
    marginHorizontal: 130,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#386F4F",
    paddingVertical: 13,
    marginTop: 15,
    marginHorizontal: 130,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
});