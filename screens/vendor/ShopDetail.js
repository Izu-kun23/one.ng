import React from "react";
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Linking,
} from "react-native";
import Header from "../../components/Header3";

const { width } = Dimensions.get("window");

const VendorShopDetail = ({ route, navigation }) => {
  const { shop } = route.params;

  const openMap = () => {
    const lat = shop.coordinates?.latitude || shop.latitude;
    const lng = shop.coordinates?.longitude || shop.longitude;
    const label = encodeURIComponent(shop.name || "Shop Location");

    if (!lat || !lng) {
      alert("Location coordinates not available.");
      return;
    }

    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    });

    Linking.openURL(url).catch((err) =>
      console.error("Failed to open map:", err)
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Shop Details" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Shop Images Carousel */}
        {shop.images && shop.images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageCarousel}
          >
            {shop.images.map((imgUri, index) => (
              <Image
                key={index}
                style={styles.image}
                source={{ uri: imgUri }}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Images</Text>
          </View>
        )}

        {/* Shop Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.price}>Category: {shop.category || "N/A"}</Text>

          <Text style={styles.description}>
            {shop.about || "No description provided."}
          </Text>

          {shop.location && (
            <TouchableOpacity onPress={openMap}>
              <Text style={styles.location}>📍 {shop.location}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate("VendorProducts", { shop })}
        >
          <Text style={styles.viewButtonText}>View your products</Text>
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
  imageCarousel: {
    marginBottom: 20,
  },
  image: {
    width: width - 40,
    height: 250,
    borderRadius: 15,
    marginRight: 15,
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
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
    textDecorationLine: "underline",
  },
  viewButton: {
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
  viewButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});