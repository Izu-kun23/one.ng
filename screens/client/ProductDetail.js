import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Fire from '../../Fire';  // Ensure Fire is correctly initialized
import Header3 from '../../components/Header3';

const { width } = Dimensions.get('window');

const ProductDetail = ({ route, navigation }) => {
  const { product } = route.params;  // Get product details from route
  const [quantity, setQuantity] = useState(1);  // Default quantity
  const [isFavorited, setIsFavorited] = useState(false);  // Favorite status
  const [stock, setStock] = useState(1);  // Stock quantity
  const [activeIndex, setActiveIndex] = useState(0);  // Active index for image carousel

  const defaultImage = 'https://via.placeholder.com/300x200.png?text=Product';
  const images = product.images?.length ? product.images : [defaultImage];  // Use default image if no images exist

  useEffect(() => {
    setStock(product.stock || 1);  // Set stock quantity when the product is loaded
  }, [product]);

  // Add the product to the basket
  const handleAddToBasket = async () => {
    try {
      await Fire.shared.addToBasket(product, quantity);  // Add product to basket via Fire
      Alert.alert("Added to Basket", `${product.name} x${quantity} added to your basket.`);
    } catch (error) {
      console.error("❌ Failed to add to basket:", error);
      Alert.alert("Error", "Failed to add to basket.");
    }
  };

  // Handle Buy Now functionality (just an alert for now)
  const handleBuyNow = () => {
    Alert.alert("Buying Now", `You are buying ${quantity} of ${product.name}.`);
  };

  // Toggle favorite status of the product
  const handleToggleFavorite = async () => {
    const vendorId = product.vendorId;
    try {
      if (isFavorited) {
        await Fire.shared.removeFavorite({ itemId: product.id, type: "product" });
        setIsFavorited(false);
        Alert.alert("Removed", "Product removed from favorites.");
      } else {
        await Fire.shared.addFavorite({ itemId: product.id, vendorId, type: "product" });
        setIsFavorited(true);
        Alert.alert("Saved", "Product added to favorites!");
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // Increase product quantity
  const increaseQuantity = () => {
    if (quantity < stock) setQuantity(quantity + 1);
  };

  // Decrease product quantity
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <View style={styles.container}>
      <Header3 onBack={() => navigation.goBack()} title="Product Detail" />

      {/* Swipeable Product Images */}
      <View>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / width
            );
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.productImage}
              resizeMode="cover"
              onError={() => console.warn('Image failed to load:', item)}
            />
          )}
        />
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>₦{product.price.toLocaleString('en-NG')}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>

        <Text style={styles.label}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
            <Ionicons name="remove" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleAddToBasket}>
            <Text style={styles.buttonText}>Add to Basket</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleBuyNow}>
            <Text style={styles.buttonText}>Buy Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorited ? '#D1495B' : '#888'}
            />
            <Text style={styles.favoriteText}>
              {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  productImage: {
    width: Dimensions.get('window').width - 32,
    height: 250,
    borderRadius: 10,
    marginBottom: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#386F4F',
  },
  productDetails: {
    paddingBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    color: '#228B22',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quantityButton: {
    backgroundColor: '#386F4F',
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#386F4F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  favoriteText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 10,
  },
});