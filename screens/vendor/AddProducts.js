import React, { useState } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import Fire from '../../Fire'; // Firebase functions

const AddProducts = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [media, setMedia] = useState([]);
  const [size, setSize] = useState('');
  const [gender, setGender] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [author, setAuthor] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Food', value: 'Food' },
    { label: 'Clothing', value: 'Clothing' },
    { label: 'Tech and Gadgets', value: 'Tech and Gadgets' },
    { label: 'Beauty and Cosmetics', value: 'Beauty and Cosmetics' },
    { label: 'Home and Living', value: 'Home and Living' },
    { label: 'Health and Wellness', value: 'Health and Wellness' },
    { label: 'Sports and Fitness', value: 'Sports and Fitness' },
    { label: 'Books and Stationery', value: 'Books and Stationery' },
    { label: 'Toys and Games', value: 'Toys and Games' },
    { label: 'Automotive', value: 'Automotive' },
    { label: 'Others', value: 'Others' },
  ]);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const selected = result.assets || [];
      setMedia([...media, ...selected]);
    }
  };

  const removeImage = (index) => {
    const updated = [...media];
    updated.splice(index, 1);
    setMedia(updated);
  };

  const handleSubmit = async () => {
    if (!name || !desc || !price || !category || !stock || isNaN(stock)) {
      alert("Please fill all required fields correctly.");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const productData = {
        productName: name,
        productDesc: desc,
        price,
        category,
        size,
        gender,
        expiryDate,
        author,
        brand,
        stock,
        productImages: [],
      };

      const imageUrls = [];
      for (let i = 0; i < media.length; i++) {
        const imageUri = media[i].uri;
        const imagePath = `products/${Fire.shared.uid}/${Date.now()}_${i}.jpg`;
        const url = await Fire.shared.uploadPhotoAsync(imageUri, imagePath);
        imageUrls.push(url);
      }

      productData.productImages = imageUrls;

      const productRef = await Fire.shared.addProduct(productData);
      console.log("Product added successfully with ID:", productRef);

      setIsLoading(false);
      Alert.alert("✅ Success", "Your product has been added!");

      // Reset form
      setName('');
      setDesc('');
      setPrice('');
      setCategory('');
      setMedia([]);
      setSize('');
      setGender('');
      setExpiryDate('');
      setAuthor('');
      setBrand('');
      setStock('');
    } catch (error) {
      console.error("Error adding product:", error);
      setIsLoading(false);
      Alert.alert("❌ Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.header}>Add New Product</Text>

        {/* Media Section */}
        <View style={styles.mediaWrapper}>
          <ScrollView horizontal>
            {media.map((img, index) => (
              <View key={index} style={styles.imageBox}>
                <Image source={{ uri: img.uri }} style={styles.preview} />
                <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={20} color="#FF3333" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addMediaButton} onPress={pickMedia}>
              <Text style={styles.addMediaText}>+ Add Image</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TextInput placeholder="Product Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput
          placeholder="Product Description"
          value={desc}
          onChangeText={setDesc}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100 }]}
        />
        <TextInput
          placeholder="Price (₦)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Stock / Quantity Available"
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Category</Text>
        <View style={{ zIndex: open ? 1000 : 1 }}>
          <DropDownPicker
            open={open}
            value={category}
            items={items}
            setOpen={setOpen}
            setValue={setCategory}
            setItems={setItems}
            placeholder="Select Category"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="SCROLLVIEW"
          />
        </View>

        {category === 'Clothing' && (
          <>
            <TextInput
              placeholder="Available Sizes (e.g. S, M, L)"
              value={size}
              onChangeText={setSize}
              style={styles.input}
            />
            <TextInput
              placeholder="Gender (e.g. Male, Female, Unisex)"
              value={gender}
              onChangeText={setGender}
              style={styles.input}
            />
          </>
        )}

        {category === 'Food' && (
          <TextInput
            placeholder="Expiration Date (YYYY-MM-DD)"
            value={expiryDate}
            onChangeText={setExpiryDate}
            style={styles.input}
          />
        )}

        {category === 'Books and Stationery' && (
          <TextInput
            placeholder="Author or Brand"
            value={author}
            onChangeText={setAuthor}
            style={styles.input}
          />
        )}

        {[
          'Tech and Gadgets',
          'Beauty and Cosmetics',
          'Health and Wellness',
          'Automotive',
          'Home and Living',
          'Toys and Games',
          'Sports and Fitness',
        ].includes(category) && (
          <TextInput
            placeholder="Brand / Model"
            value={brand}
            onChangeText={setBrand}
            style={styles.input}
          />
        )}

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#228B22" />
            <Text style={{ marginTop: 10, fontWeight: '500', color: '#333' }}>
              Uploading product...
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Product</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingBottom: 12,
    color: '#333',
    height: 46,
    paddingTop: 1,
  },
  input: {
    backgroundColor: '#F3F3F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '800',
    color: 'black',
  },
  dropdown: {
    backgroundColor: '#F3F3F3',
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 1000,
    marginBottom: 16,
    padding: 15,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    zIndex: 1000,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#228B22',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  mediaWrapper: {
    marginBottom: 20,
  },
  imageBox: {
    marginRight: 10,
    position: 'relative',
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    elevation: 2,
  },
  addMediaButton: {
    width: 100,
    height: 100,
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMediaText: {
    fontSize: 14,
    color: '#666',
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});