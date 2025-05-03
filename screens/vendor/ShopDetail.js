import React, { useState, useRef } from "react";
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
  Animated,
} from "react-native";
import Header from "../../components/Header3";

const { width } = Dimensions.get("window");

const VendorShopDetail = ({ route, navigation }) => {
  const { shop } = route.params;
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

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

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <Header title="Shop Details" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Hero Section with Swipable Images */}
        <View style={styles.heroImageContainer}>
          {shop.images && shop.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {shop.images.map((imgUri, index) => (
                  <Image
                    key={index}
                    source={{ uri: imgUri }}
                    style={styles.heroImage}
                  />
                ))}
              </ScrollView>

              {/* Pagination Dots */}
              <View style={styles.pagination}>
                {shop.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === activeIndex ? styles.activeDot : null,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View
              style={[styles.heroImage, { justifyContent: "center", alignItems: "center" }]}
            >
              <Text style={{ color: "#999", fontSize: 16 }}>No Image</Text>
            </View>
          )}
        </View>

        {/* Card Section with all info */}
        <View style={styles.card}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopCategory}>
            {shop.category ? `Category: ${shop.category}` : "Uncategorized"}
          </Text>

          <Text style={styles.description}>
            {shop.about || "This vendor has not added a description yet."}
          </Text>

          {shop.location && (
            <TouchableOpacity onPress={openMap}>
              <Text style={styles.location}>📍 {shop.location}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate("VendorProducts", { shopId: shop.id })}
          >
            <Text style={styles.viewButtonText}>View Your Products</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default VendorShopDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  heroImageContainer: {
    width,
    height: 280,
    backgroundColor: "#eee",
  },
  heroImage: {
    width,
    height: 280,
    resizeMode: "cover",
  },
  pagination: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#10B981",
    width: 10,
    height: 10,
  },
  card: {
    marginTop: -5,
    backgroundColor: "#fff",
    marginHorizontal: 14,
    padding: 20,
    paddingHorizontal: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  shopName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  shopCategory: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 15,
    textAlign: "center",
  },
  location: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "500",
    textAlign: "center",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});