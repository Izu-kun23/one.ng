import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Card = ({ title, children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
      {title && <Text style={styles.cardTitle}>{title}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12, // Curved corners
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    width: 120, // Square shape
    height: 120, // Square shape
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
});

export default Card;