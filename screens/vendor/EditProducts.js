import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import * as ImagePicker from "expo-image-picker";
import Fire from "../../Fire";
import { useNavigation, useRoute } from "@react-navigation/native";

const EditProducts = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;

  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(formatPriceInput(String(product.price || "0")));
  const [stock, setStock] = useState(String(product.stock || ""));
  const [category, setCategory] = useState(product.category || "");
  const [images, setImages] = useState(product.images || []);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [size, setSize] = useState(product.size || "");
  const [gender, setGender] = useState(product.gender || "");
  const [expiryDate, setExpiryDate] = useState(product.expiryDate || "");
  const [author, setAuthor] = useState(product.author || "");
  const [brand, setBrand] = useState(product.brand || "");

  const [openCategory, setOpenCategory] = useState(false);
  const [categoryItems, setCategoryItems] = useState([
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

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selected = result.assets.map((a) => a.uri);
      setNewImages([...newImages, ...selected]);
    }
  };

  const handleRemoveImage = (index, isNew = false) => {
    const updated = isNew ? [...newImages] : [...images];
    updated.splice(index, 1);
    isNew ? setNewImages(updated) : setImages(updated);
  };

  const handleUpdate = async () => {
    if (!name || !price || !stock || !category) {
      Alert.alert("Missing fields", "Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);
      let updatedImages = [...images];

      for (let i = 0; i < newImages.length; i++) {
        const path = `products/${Fire.shared.uid}/${Date.now()}_${i}`;
        const url = await Fire.shared.uploadPhotoAsync(newImages[i], path);
        updatedImages.push(url);
      }

      const parsedPrice = parseFloat(price.replace(/,/g, ""));

      const updatedData = {
        name,
        description,
        price: parsedPrice,
        stock: Number(stock),
        category,
        images: updatedImages,
      };

      if (category === "Clothing") {
        updatedData.size = size;
        updatedData.gender = gender;
      } else if (category === "Food") {
        updatedData.expiryDate = expiryDate;
      } else if (category === "Books and Stationery") {
        updatedData.author = author;
      } else if (
        [
          "Tech and Gadgets",
          "Beauty and Cosmetics",
          "Health and Wellness",
          "Automotive",
          "Home and Living",
          "Toys and Games",
          "Sports and Fitness",
        ].includes(category)
      ) {
        updatedData.brand = brand;
      }

      await Fire.shared.updateProduct(product.id, updatedData);
      setLoading(false);
      Alert.alert("✅ Success", "Product updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert("❌ Error", "Failed to update product.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.header}>Edit Product</Text>
          </View>

          <ScrollView horizontal style={{ marginBottom: 20 }}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageBox}>
                <Image source={{ uri }} style={styles.preview} />
                <TouchableOpacity
                  style={styles.removeIcon}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3333" />
                </TouchableOpacity>
              </View>
            ))}
            {newImages.map((uri, index) => (
              <View key={`new-${index}`} style={styles.imageBox}>
                <Image source={{ uri }} style={styles.preview} />
                <TouchableOpacity
                  style={styles.removeIcon}
                  onPress={() => handleRemoveImage(index, true)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3333" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addMediaButton} onPress={handleImagePick}>
              <Text style={styles.addMediaText}>+ Add Image</Text>
            </TouchableOpacity>
          </ScrollView>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Product Name"
          />
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
          />
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={(val) => setPrice(formatPriceInput(val))}
            placeholder="Price (₦)"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            placeholder="Stock"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Category</Text>
          <DropDownPicker
            open={openCategory}
            value={category}
            items={categoryItems}
            setOpen={setOpenCategory}
            setValue={setCategory}
            setItems={setCategoryItems}
            placeholder="Select a category"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />

          {category === "Clothing" && (
            <>
              <TextInput
                style={styles.input}
                value={size}
                onChangeText={setSize}
                placeholder="Sizes (e.g. S, M, L)"
              />
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="Gender"
              />
            </>
          )}
          {category === "Food" && (
            <TextInput
              style={styles.input}
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="Expiry Date"
            />
          )}
          {category === "Books and Stationery" && (
            <TextInput
              style={styles.input}
              value={author}
              onChangeText={setAuthor}
              placeholder="Author"
            />
          )}
          {[
            "Tech and Gadgets",
            "Beauty and Cosmetics",
            "Health and Wellness",
            "Automotive",
            "Home and Living",
            "Toys and Games",
            "Sports and Fitness",
          ].includes(category) && (
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="Brand"
            />
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#228B22" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
              <Text style={styles.submitText}>Update Product</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

// ✅ Format price to Nigerian style (e.g. 10,000)
function formatPriceInput(value) {
  let numeric = value.replace(/\D/g, "");
  if (!numeric) return "";
  return Number(numeric).toLocaleString("en-NG");
}

export default EditProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  input: {
    backgroundColor: "#F3F3F3",
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#000",
  },
  dropdown: {
    backgroundColor: "#F3F3F3",
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 8,
    zIndex: 1000,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#228B22",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  imageBox: {
    marginRight: 10,
    position: "relative",
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeIcon: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 2,
    elevation: 2,
  },
  addMediaButton: {
    width: 100,
    height: 100,
    backgroundColor: "#EDEDED",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addMediaText: {
    fontSize: 14,
    color: "#666",
  },
});