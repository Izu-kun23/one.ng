import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import Fire from "../../Fire";
import Header from "../../components/Header";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import NotificationCard from "../../components/NotificationCard"; // Import Notification Card

export default class VendorHome extends React.Component {
  state = {
    vendor: {},
    showAllNotifications: false, // State to toggle notifications
  };

  unsubscribe = null;

  componentDidMount() {
    const vendorId = this.props.uid || Fire.shared.uid;

    if (!vendorId) {
      console.error("🔥 Vendor ID is undefined!");
      return;
    }

    const vendorRef = doc(Fire.shared.firestore, "vendors", vendorId);

    this.unsubscribe = onSnapshot(vendorRef, (docSnap) => {
      if (docSnap.exists()) {
        this.setState({ vendor: docSnap.data() });
      } else {
        console.log("🚨 No such vendor in Firestore!");
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
    this.setState({ vendor: {} });
    this.props.navigation.navigate("VendorLogin");
  };

  toggleNotifications = () => {
    this.setState((prevState) => ({
      showAllNotifications: !prevState.showAllNotifications,
    }));
  };

  render() {
    const { vendor, showAllNotifications } = this.state;
    const { navigation } = this.props;

    const analytics = {
      customers: 120,
      sales: 5000,
      messages: 35,
      earnings: 1200,
    };

    // Sample Notifications
    const notifications = [
      { title: "New Order Received", message: "You have a new order from John Doe.", time: "2 mins ago", icon: "cart" },
      { title: "Payment Received", message: "You received $50 from Sarah.", time: "1 hour ago", icon: "wallet" },
      { title: "Delivery Scheduled", message: "Your order is out for delivery.", time: "3 hours ago", icon: "bicycle" },
      { title: "New Review", message: "Someone left a review on your store.", time: "Yesterday", icon: "star" },
    ];

    // Show only 2 by default
    const displayedNotifications = showAllNotifications ? notifications : notifications.slice(0, 2);

    return (
      <LinearGradient colors={["#F2F2F2", "#F2F2F2"]} style={styles.container}>
        {/* Header */}
        <Header title="" navigation={navigation} avatar={vendor.avatar} />

        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            Welcome Back, {vendor.name || "Vendor"}!
          </Text>
        </View>

        {/* Analytics Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Ionicons name="people" size={30} color="#386F4F" />
              <Text style={styles.cardTitle}>Customers</Text>
              <Text style={styles.cardValue}>{analytics.customers}</Text>
            </View>
            <View style={styles.card}>
              <Ionicons name="analytics" size={30} color="#386F4F" />
              <Text style={styles.cardTitle}>Statistics</Text>
              <Text style={styles.cardValue}>${analytics.sales}</Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Ionicons name="pricetags" size={30} color="#386F4F" />
              <Text style={styles.cardTitle}>Businesses</Text>
              <Text style={styles.cardValue}>{analytics.messages}</Text>
            </View>
            <View style={styles.card}>
              <Ionicons name="alert-outline" size={30} color="red" />
              <Text style={styles.cardTitle}>Requests</Text>
              <Text style={styles.cardValue}>${analytics.earnings}</Text>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.notificationsHeader}>
          <Text style={styles.notificationsTitle}>Notifications</Text>
          {notifications.length > 2 && (
            <TouchableOpacity onPress={this.toggleNotifications}>
              <Text style={styles.viewAllText}>
                {showAllNotifications ? "View Less" : "View All"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {displayedNotifications.map((notif, index) => (
            <NotificationCard
              key={index}
              title={notif.title}
              message={notif.message}
              time={notif.time}
              icon={notif.icon}
            />
          ))}
        </ScrollView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  greetingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  cardsContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 15,
    width: "45%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3498db",
    marginTop: 5,
  },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    height: 45,
  },
  notificationsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "bold",
  },
  viewLessText: {
    fontSize: 16,
    color: "red", // This ensures the "View Less" text is red
    fontWeight: "bold",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});