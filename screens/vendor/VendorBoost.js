import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const VendorBoost = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;

  const [days, setDays] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // or "amount"
  const [discountValue, setDiscountValue] = useState("");
  const [newPrice, setNewPrice] = useState(product.price);
  const [highlightFeature, setHighlightFeature] = useState(false); // sample extra promo feature

  useEffect(() => {
    calculateDiscount();
  }, [discountValue, discountType]);

  const calculateDiscount = () => {
    const price = parseFloat(product.price);
    const discount = parseFloat(discountValue);

    if (discountType === "percentage") {
      if (!isNaN(discount) && discount > 0 && discount <= 100) {
        const discounted = price - (price * discount) / 100;
        setNewPrice(discounted.toFixed(2));
      } else {
        setNewPrice(price);
      }
    } else if (discountType === "amount") {
      if (!isNaN(discount) && discount >= 0 && discount < price) {
        const discounted = price - discount;
        setNewPrice(discounted.toFixed(2));
      } else {
        setNewPrice(price);
      }
    }
  };

  const handleBoost = () => {
    if (!days || !discountValue) {
      return Alert.alert("Missing Fields", "Please enter all boost details.");
    }

    // Ideally send this info to your backend here
    Alert.alert("Success", "Your product has been boosted!");

    navigation.goBack(); // or navigate elsewhere
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Boost: {product.name}</Text>

      <Text style={styles.label}>Boost Duration (in days):</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={days}
        onChangeText={setDays}
        placeholder="e.g. 7"
      />

      <Text style={styles.label}>Discount Type:</Text>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            discountType === "percentage" && styles.activeSwitch,
          ]}
          onPress={() => setDiscountType("percentage")}
        >
          <Text style={styles.switchText}>%</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchButton,
            discountType === "amount" && styles.activeSwitch,
          ]}
          onPress={() => setDiscountType("amount")}
        >
          <Text style={styles.switchText}>₦</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>
        Discount {discountType === "percentage" ? "(%)" : "(₦)"}:
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={discountValue}
        onChangeText={setDiscountValue}
        placeholder={`Enter ${discountType === "percentage" ? "percentage" : "amount"}`}
      />

      <Text style={styles.label}>New Price:</Text>
      <Text style={styles.newPrice}>₦{newPrice}</Text>

      {/* Optional extra feature */}
      <Text style={styles.label}>Highlight Product:</Text>
      <TouchableOpacity
        style={[
          styles.highlightToggle,
          highlightFeature && { backgroundColor: "#10B981" },
        ]}
        onPress={() => setHighlightFeature((prev) => !prev)}
      >
        <Text style={styles.highlightText}>
          {highlightFeature ? "Enabled" : "Disabled"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.boostButton} onPress={handleBoost}>
        <Text style={styles.boostButtonText}>Boost Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default VendorBoost;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  switchContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
  },
  switchButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eee",
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeSwitch: {
    backgroundColor: "#10B981",
  },
  switchText: {
    fontWeight: "bold",
    color: "#fff",
  },
  newPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
    marginTop: 6,
  },
  boostButton: {
    backgroundColor: "#facc15",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  boostButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  highlightToggle: {
    padding: 12,
    backgroundColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  highlightText: {
    fontWeight: "bold",
    color: "#fff",
  },
});