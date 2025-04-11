import React, { useState } from "react";
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from "react-native-dropdown-picker";
import Fire from "../../Fire";  // Import Fire class
import Header from "../../components/Header3";  // Import your Header3 component

const AddShop = () => {
  const navigation = useNavigation(); 

  const [shopName, setShopName] = useState("");
  const [about, setAbout] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [shopImage, setShopImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Food");
  const [categories, setCategories] = useState([
    { label: "Food", value: "Food" },
    { label: "Clothing", value: "Clothing" },
    { label: "Coffee", value: "Coffee" },
    { label: "Tech", value: "Tech" },
  ]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setShopImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!shopName || !about || !street || !city || !shopImage) {
      Alert.alert("Missing Information", "Please fill all required fields.");
      return;
    }

    setLoading(true); // Start loading state

    try {
      await Fire.shared.addShop({
        shopName,
        about,
        street,
        city,
        category,
        shopImage,
        vendorName,
      });

      Alert.alert("Success", "Your shop has been successfully added!");
      navigation.goBack(); // Navigate back to previous screen
    } catch (error) {
      Alert.alert("Error", "Could not add shop. Please try again.");
      console.error("❌ Error adding shop:", error);
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Custom Header */}
      <Header title="Add Shop" onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {shopImage ? (
            <Image source={{ uri: shopImage }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>+ Upload Shop Image</Text>
          )}
        </TouchableOpacity>

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

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Shop</Text>
          )}
        </TouchableOpacity>
      </View>
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
    flex: 1,
    padding: 15,
  },
  imagePicker: {
    width: "100%",
    height: 150,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imageText: {
    color: "#666",
    fontSize: 16,
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