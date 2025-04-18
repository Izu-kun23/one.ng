import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Header4.js
const Header4 = ({ searchText, setSearchText }) => {
  const [showSearch, setShowSearch] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: showSearch ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [showSearch]);

  const inputOpacity = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Default Header */}
      <View style={styles.defaultHeader}>
        <TouchableOpacity onPress={() => setShowSearch(true)}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/one.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity>
          <Ionicons name="basket-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Overlay */}
      <Animated.View
        style={[
          styles.searchOverlay,
          {
            opacity: inputOpacity,
            width: "100%",
          },
        ]}
        pointerEvents={showSearch ? "auto" : "none"}
      >
        <Ionicons
          name="search"
          size={20}
          color="#333"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={showSearch} // ✅ Only autoFocus when search is active
        />
        <TouchableOpacity onPress={() => setShowSearch(false)}>
          <Ionicons name="close" size={22} color="#333" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Header4;
const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingBottom: 1,
    paddingHorizontal: 16,
    backgroundColor: "#386F4F",
    height: 110,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  defaultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    height: 90,
    maxWidth: 300,
    flexShrink: 1,
    resizeMode: "contain",
  },
  searchOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#F1F1F1",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});
