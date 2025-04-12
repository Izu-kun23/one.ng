import React from "react";
import { View, ScrollView, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../../components/Header3";

const VendorShopDetail = ({ route, navigation }) => {
  const { shop } = route.params;

  return (
    <View style={styles.container}>
      <Header title="Shop Details" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Shop Image */}
        {shop.image && <Image style={styles.image} source={{ uri: shop.image }} />}

        {/* Shop Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.price}>Category: {shop.category || "N/A"}</Text>

          <Text style={styles.description}>{shop.about || "No description provided."}</Text>

          {shop.location && (
            <Text style={styles.location}>
              📍 {shop.location}
            </Text>
          )}
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditShop", { shop })}
        >
          <Text style={styles.editButtonText}>Edit Shop Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default VendorShopDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContainer: {
    padding: 20,
  },
  image: {
    width: "100%",
    aspectRatio: 1.2, 
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: "cover",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  shopName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
  },
  price: {
    fontSize: 18,
    color: "#999",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 15,
  },
  location: {
    fontSize: 16,
    color: "#386F4F",
    textAlign: "center",
    fontWeight: "500",
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#228B22",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});