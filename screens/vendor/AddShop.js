import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import Fire from "../../Fire";
import Header from "../../components/Header3";

const AddShop = () => {
  const navigation = useNavigation();

  const [shopName, setShopName] = useState("");
  const [about, setAbout] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [shopImages, setShopImages] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Food");
  const [categories, setCategories] = useState([
    { label: "Food", value: "Food" },
    { label: "Clothing", value: "Clothing" },
    { label: "Tech and Gadgets", value: "Tech and Gadgets" },
    { label: "Beauty and Cosmetics", value: "Beauty and Cosmetics" },
    { label: "Home and Living", value: "Home and Living" },
    { label: "Health and Wellness", value: "Health and Wellness" },
    { label: "Sports and Fitness", value: "Sports and Fitness" },
    { label: "Books and Stationery", value: "Books and Stationery" },
    { label: "Toys and Games", value: "Toys and Games" },
    { label: "Automotive", value: "Automotive" },
    { label: "Others", value: "Others" },
  ]);

  // Pick multiple images, limit to 6, show previews
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      selectionLimit: 6,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      setShopImages((prev) => [...prev, ...selected].slice(0, 6)); // Limit to 6 images max
    }
  };

  const handleSubmit = async () => {
    if (!shopName || !about || !street || !city) {
      Alert.alert("Missing Information", "Please fill all the required fields.");
      return;
    }

    if (shopImages.length < 3) {
      Alert.alert("Minimum Images Required", "Please upload at least 3 images.");
      return;
    }

    setLoading(true);

    try {
      await Fire.shared.addShop({
        shopName,
        about,
        street,
        city,
        category,
        shopImages,
        vendorName,
        isOpen,
      });

      Alert.alert("Success", "Your shop has been successfully added!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not add shop. Please try again.");
      console.error("❌ Error adding shop:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Header title="Add Shop" onBackPress={() => navigation.goBack()} />

      <FlatList
        contentContainerStyle={styles.content}
        data={[1]} // dummy data to render FlatList
        renderItem={() => (
          <>
            {/* Image Picker (6 boxes) */}
            <View style={styles.imageContainer}>
              {[...Array(6)].map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.imageBox, shopImages[index] && styles.imageBoxFilled]}
                  onPress={() => pickImages()}
                >
                  {shopImages[index] ? (
                    <Image source={{ uri: shopImages[index] }} style={styles.imagePreview} />
                  ) : (
                    <Text style={styles.imageText}>+ Add Image</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Shop Name */}
            <TextInput
              style={styles.input}
              placeholder="Shop Name *"
              value={shopName}
              onChangeText={setShopName}
            />

            {/* About Shop */}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="About the Shop *"
              value={about}
              onChangeText={setAbout}
              multiline
            />

            {/* Location */}
            <TextInput
              style={styles.input}
              placeholder="Street Address *"
              value={street}
              onChangeText={setStreet}
            />
            <TextInput
              style={styles.input}
              placeholder="City *"
              value={city}
              onChangeText={setCity}
            />

            {/* Category Dropdown */}
            <DropDownPicker
              open={open}
              value={category}
              items={categories}
              setOpen={setOpen}
              setValue={setCategory}
              setItems={setCategories}
              placeholder="Select a Category"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />

            {/* Vendor Name (Optional) */}
            <TextInput
              style={styles.input}
              placeholder="Vendor Name (Optional)"
              value={vendorName}
              onChangeText={setVendorName}
            />

            {/* Shop Status */}
            <View style={styles.row}>
              <Text style={styles.label}>Shop Status:</Text>
              <View style={styles.statusContainer}>
                <Text style={{ marginRight: 10 }}>
                  {isOpen ? "Open" : "Closed"}
                </Text>
                <Switch value={isOpen} onValueChange={setIsOpen} />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading || shopImages.length < 3}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Shop</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </KeyboardAvoidingView>
  );
};

export default AddShop;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 15,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 15,
  },
  imageBox: {
    width: "28%",
    height: 80,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBoxFilled: {
    backgroundColor: "#D0D0D0",
  },
  imageText: {
    color: "#666",
    fontSize: 16,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  input: {
    backgroundColor: "#F7F7F7",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
  },
  dropdown: {
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#386F4F",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});