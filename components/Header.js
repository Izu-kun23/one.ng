import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native"; // ✅ Import useNavigation

const Header = ({ title, avatar }) => {
  const navigation = useNavigation(); // ✅ Get navigation instance

  useEffect(() => {
    // Set the status bar to dark content when this header is shown
    StatusBar.setBarStyle('dark-content'); 

    // Optionally, reset the status bar when leaving the screen (e.g., for dark mode screens)
    return () => StatusBar.setBarStyle('light-content'); // Reset to light content if needed
  }, []);

  return (
    <View style={styles.header}>
      {/* ✅ Open Drawer on Click */}
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
        <Image source={require("../assets/menu.png")} style={styles.menuIcon} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      {/* Profile Avatar */}
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>?</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 125,
    backgroundColor: "#FFF",  // White background
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: "#000",
    paddingTop: 27,
    paddingBottom: 3,
    paddingRight: 25,
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  headerTitle: {
    color: "#333",
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#B0BEC5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    paddingRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default Header;