import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Header = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Drawer Menu Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Header Title */}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    header: {
      width: "100%",
      height: 110,
      backgroundColor: "#fff",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      elevation: 3,
      shadowColor: "#000",
      paddingTop: 23,
      paddingBottom: 3,
      paddingRight: 25,
     
    },
    backButton: {
      padding: 8,
    },
    backIcon: {
      width: 30,
      height: 30,
      resizeMode: "contain",
    },
    headerTitle: {
      color: "#333",
      fontSize: 19,
      fontWeight: "bold",
      textAlign: "center",
      flex: 1,
      paddingRight: 29,
    },

  });
  

export default Header;