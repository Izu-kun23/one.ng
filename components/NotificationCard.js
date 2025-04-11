import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NotificationCard = ({ title, message, time, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon || "notifications"} size={30} color="#3498db" style={styles.icon} />

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#777",
    marginTop: 3,
  },
  time: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 5,
  },
});

export default NotificationCard;