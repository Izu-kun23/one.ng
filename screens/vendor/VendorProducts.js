import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Modal, 
  Pressable, 
  ScrollView 
} from 'react-native';
import Header from '../../components/Header3';
import { Ionicons } from '@expo/vector-icons';
import AddProducts from './AddProducts'; // adjust path as needed
import Fire from '../../Fire'; // Assuming this is where your Fire class is located

const { width } = Dimensions.get('window');

const VendorProducts = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]); // State to hold fetched products
  
  useEffect(() => {
    // Fetch the products when the component mounts
    const fetchProducts = async () => {
      try {
        // Assuming you have the vendor's ID (uid) available
        const vendorId = Fire.shared.uid;
        if (vendorId) {
          const vendorProducts = await Fire.shared.getVendorProducts(vendorId);
          setProducts(vendorProducts); // Update the state with the fetched products
        }
      } catch (error) {
        console.error("Error fetching vendor products:", error);
      }
    };

    fetchProducts(); // Call the fetch function when the component mounts
  }, []); // Empty dependency array means this runs once when the component mounts

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₦{item.price}</Text>
        <Text style={styles.stock}>Stock: {item.stock}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="My Products" />
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={26} color="#228B22" />
        </TouchableOpacity>
      </View>

      <FlatList
        key={'2-columns'}
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
      />

      {/* PRODUCT DETAIL MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Image
                  source={{ uri: selectedProduct.images[0] }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalPrice}>₦{selectedProduct.price}</Text>
                <Text style={styles.modalStock}>
                  Stock: {selectedProduct.stock}
                </Text>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* ADD PRODUCT SLIDE-UP MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.addProductModalContainer}>
          <View style={styles.addProductContent}>
            <TouchableOpacity
              onPress={() => setAddModalVisible(false)}
              style={styles.closeAddBtn}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
              <AddProducts />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VendorProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 22,
    paddingRight: 40,
    backgroundColor: '#fff',
    elevation: 2,
  },
  plusButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: 'center',
    right: 20,
    top: 10,
    marginTop: 8,
    marginBottom: 1,
    marginRight: 2,
    padding: 10,
    paddingHorizontal: 10,
  },
  list: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    width: (width - 48) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#228B22',
    marginTop: 4,
  },
  stock: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: '#228B22',
    paddingVertical: 8,
    alignItems: 'center',
  },
  editText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    width: '80%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  modalPrice: {
    fontSize: 16,
    color: '#228B22',
    marginBottom: 6,
  },
  modalStock: {
    fontSize: 14,
    color: '#666',
  },
  addProductModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  addProductContent: {
    backgroundColor: '#fff',
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  closeAddBtn: {
    alignSelf: 'flex-end',
    padding: 16,
  },
});