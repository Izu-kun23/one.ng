import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Switch,  // <-- Add Switch component for toggling status
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Fire from "../../Fire";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const EditShop = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { shop } = route.params;

  const [shopName, setShopName] = useState(shop.name || "");
  const [about, setAbout] = useState(shop.about || "");
  const [location, setLocation] = useState(shop.location || "");
  const [category, setCategory] = useState(shop.category || "");
  const [vendorName, setVendorName] = useState(shop.vendor || "");
  const [isOpen, setIsOpen] = useState(shop.isOpen ?? true); // <-- state to track open/close
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState(shop.images || []);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const selected = result.assets.map((a) => a.uri);
      setNewImages([...newImages, ...selected]);
    }
  };

  const handleRemoveImage = (index, isNew = false) => {
    if (isNew) {
      const updated = [...newImages];
      updated.splice(index, 1);
      setNewImages(updated);
    } else {
      const updated = [...existingImages];
      updated.splice(index, 1);
      setExistingImages(updated);
    }
  };

  const handleUpdate = async () => {
    if (!shopName || !location || !category) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setLoading(true);

    const [street, city] = location.split(",").map((s) => s.trim());

    try {
      await Fire.shared.updateShop(shop.id, {
        shopName,
        about,
        street,
        city,
        category,
        shopImages: newImages,
        existingImageUrls: existingImages,
        vendorName,
        isOpen, // <-- update shop's open/close status
      });

      Alert.alert("✅ Success", "Shop updated!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("❌ Error", "Could not update shop.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Shop</Text>

        <TextInput
          placeholder="Shop Name"
          style={styles.input}
          value={shopName}
          onChangeText={setShopName}
        />
        <TextInput
          placeholder="About"
          style={[styles.input, { height: 100 }]}
          value={about}
          onChangeText={setAbout}
          multiline
        />
        <TextInput
          placeholder="Location (Street, City)"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          placeholder="Category"
          style={styles.input}
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          placeholder="Vendor Name"
          style={styles.input}
          value={vendorName}
          onChangeText={setVendorName}
        />

        {/* Toggle Switch for Open/Closed Status */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Is Shop Open?</Text>
          <Switch
            value={isOpen}
            onValueChange={() => setIsOpen((prev) => !prev)}
            thumbColor={isOpen ? "#228B22" : "#D1495B"}
            trackColor={{ false: "#ccc", true: "#80E0A7" }}
          />
        </View>

        <Text style={styles.label}>Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
          {existingImages.map((uri, index) => (
            <View key={`existing-${index}`} style={styles.imageBox}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeIcon}
                onPress={() => handleRemoveImage(index)}
              >
                <Ionicons name="close-circle" size={20} color="#f33" />
              </TouchableOpacity>
            </View>
          ))}
          {newImages.map((uri, index) => (
            <View key={`new-${index}`} style={styles.imageBox}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeIcon}
                onPress={() => handleRemoveImage(index, true)}
              >
                <Ionicons name="close-circle" size={20} color="#f33" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={handlePickImage}>
            <Text style={{ color: "#666" }}>+ Add Image</Text>
          </TouchableOpacity>
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color="#228B22" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update Shop</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditShop;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    backgroundColor: "#f3f3f3",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  imageBox: {
    position: "relative",
    marginRight: 10,
  },
  image: {
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
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#ededed",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#228B22",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});