import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "./firebaseConfig";

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

class Fire {
  constructor() {
    this.auth = auth;
    this.firestore = firestore;
    this.storage = storage;
  }

  /* --------------------------------------- PRODUCTS DATABASE --------------------------------------- */
  addProduct = async ({
    productName,
    productDesc,
    price,
    category,
    productImages,
    size,
    gender,
    expiryDate,
    author,
    brand,
    stock,
    shopId, // ✅ New addition
  }) => {
    if (!this.uid) {
      console.error("🔥 User UID is not available!");
      return;
    }

    try {
      const imageUrls = [];

      if (productImages && productImages.length > 0) {
        for (let i = 0; i < productImages.length; i++) {
          const imagePath = `products/${this.uid}/${Date.now()}_${i}`;
          const url = await this.uploadPhotoAsync(productImages[i], imagePath);
          imageUrls.push(url);
        }
      }

      const newProduct = {
        name: productName,
        description: productDesc,
        price,
        category,
        stock: Number(stock),
        images: imageUrls,
        vendorId: this.uid,
        shopId, // ✅ Attach shopId to each product
        createdAt: new Date().toISOString(),
      };

      if (category === "Clothing") {
        newProduct.size = size;
        newProduct.gender = gender;
      } else if (category === "Food") {
        newProduct.expiryDate = expiryDate;
      } else if (category === "Books and Stationery") {
        newProduct.author = author;
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
        newProduct.brand = brand;
      }

      const docRef = await addDoc(
        collection(this.firestore, "products"),
        newProduct
      );
      console.log("✅ Product added with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error adding product:", error);
      throw error;
    }
  };

  

  getVendorProducts = async (vendorId, shopId) => {
    if (!vendorId || !shopId) {
      console.error("❌ Both Vendor ID and Shop ID are required");
      return [];
    }
  
    try {
      const productsCollectionRef = collection(this.firestore, "products");
  
      const q = query(
        productsCollectionRef,
        where("vendorId", "==", vendorId),
        where("shopId", "==", shopId)
      );
  
      const productSnapshot = await getDocs(q);
  
      const productList = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return productList;
    } catch (error) {
      console.error("❌ Error fetching products for vendor:", error);
      return [];
    }
  };

   getProducts = async (shopId) => {
    if (!shopId) {
      console.error("❌ Shop ID is required to fetch products.");
      return [];
    }
  
    try {
      const productsRef = collection(Fire.shared.firestore, "products");
  
      const q = query(productsRef, where("shopId", "==", shopId));
  
      const snapshot = await getDocs(q);
  
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return productList;
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      return [];
    }
  };
  

  updateProduct = async (productId, updatedData) => {
    if (!this.uid) {
      console.error("🔥 User UID is not available!");
      return;
    }
  
    try {
      const productRef = doc(this.firestore, "products", productId);
  
      // Filter out undefined or null fields
      const dataToUpdate = {};
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] !== undefined && updatedData[key] !== null) {
          dataToUpdate[key] = updatedData[key];
        }
      });
  
      await updateDoc(productRef, dataToUpdate);
  
      console.log("✅ Product updated successfully!");
      return true;
    } catch (error) {
      console.error("❌ Error updating product:", error);
      throw error;
    }
  };

  
  /* --------------------------------------- SHOPS DATABASE --------------------------------------- */

  addShop = async ({
    shopName,
    about,
    street,
    city,
    category,
    shopImages,
    vendorName,
    isOpen,
  }) => {
    if (!this.uid) {
      console.error("🔥 User UID is not available!");
      return;
    }
  
    try {
      const imageUrls = [];
  
      if (shopImages && shopImages.length > 0) {
        for (let i = 0; i < shopImages.length; i++) {
          const imagePath = `shops/${this.uid}/${Date.now()}_${i}`;
          const url = await this.uploadPhotoAsync(shopImages[i], imagePath);
          imageUrls.push(url);
        }
      }
  
      const newShop = {
        name: shopName,
        about,
        location: `${street}, ${city}`,
        category,
        images: imageUrls,
        vendor: vendorName || "Anonymous",
        vendorId: this.uid,
        isOpen: isOpen ?? true,
        createdAt: new Date().toISOString(),
      };
  
      const docRef = await addDoc(collection(this.firestore, "shops"), newShop);
  
      // ✅ Add the shopId field to the document itself
      await updateDoc(docRef, { shopId: docRef.id });
  
      console.log("✅ Shop added with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error adding shop:", error);
      throw error;
    }
  };

  getShops = async () => {
    try {
      const shopsCollectionRef = collection(Fire.shared.firestore, "shops");
      const q = query(shopsCollectionRef, where("vendorId", "==", Fire.shared.uid));
      const shopSnapshot = await getDocs(q);

      return shopSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching shops:", error);
      return [];
    }
  };

  getShopIdForCurrentUser = async () => {
    try {
      const shopQuery = query(
        collection(this.firestore, "shops"),
        where("vendorId", "==", this.uid)
      );
      const snapshot = await getDocs(shopQuery);
      if (!snapshot.empty) {
        return snapshot.docs[0].id; // returns the first shop found
      } else {
        console.warn("No shop found for this user.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching shop ID:", error);
      return null;
    }
  };

  updateShop = async (shopId, {
    shopName,
    about,
    street,
    city,
    category,
    shopImages = [],
    existingImageUrls = [],
    vendorName,
    isOpen,
  }) => {
    if (!this.uid) {
      console.error("🔥 User UID is not available!");
      return;
    }
  
    try {
      const imageUrls = [...existingImageUrls];
  
      // Upload new images and add to imageUrls array
      for (let i = 0; i < shopImages.length; i++) {
        const imagePath = `shops/${this.uid}/${Date.now()}_${i}`;
        const url = await this.uploadPhotoAsync(shopImages[i], imagePath);
        imageUrls.push(url);
      }
  
      const updatedShop = {
        name: shopName,
        about,
        location: `${street}, ${city}`,
        category,
        images: imageUrls,
        vendor: vendorName || "Anonymous",
        isOpen: isOpen ?? true,
        updatedAt: new Date().toISOString(),
      };
  
      const shopRef = doc(this.firestore, "shops", shopId);
      await updateDoc(shopRef, updatedShop);
  
      console.log("✅ Shop updated:", shopId);
      return shopId;
    } catch (error) {
      console.error("❌ Error updating shop:", error);
      throw error;
    }
  };

  deleteShop = async (shopId, shopImage) => {
    if (!shopId) {
      console.error("❌ Shop ID is required for deletion!");
      return;
    }

    try {
      const shopRef = doc(this.firestore, "shops", shopId);

      if (shopImage) {
        const imageRef = ref(storage, shopImage);
        await deleteObject(imageRef).catch((err) =>
          console.warn("⚠️ Image deletion failed:", err)
        );
      }

      await deleteDoc(shopRef);

      console.log(`✅ Shop with ID ${shopId} deleted successfully!`);
    } catch (error) {
      console.error("❌ Error deleting shop:", error);
    }
  };

  addPost = async ({ text, localUri, name, avatar }) => {
    if (!this.uid) {
      console.error("🔥 User UID is not available!");
      return;
    }

    let remoteUri = null;

    if (localUri) {
      const photoPath = `photos/${this.uid}/${Date.now()}`;
      remoteUri = await this.uploadPhotoAsync(localUri, photoPath);
    }

    try {
      const docRef = await addDoc(collection(firestore, "posts"), {
        text,
        name,
        avatar,
        uid: this.uid,
        timestamp: this.timestamp,
        image: remoteUri,
      });

      console.log("✅ Post added with ID:", docRef.id);
    } catch (error) {
      console.error("❌ Error adding post:", error);
    }
  };

  createUser = async (user, isVendor = false) => {
    let remoteUri = null;
  
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
  
      const { uid } = userCredential.user;
  
     
  
      // Send email verification
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent to", user.email);
  
      // Specify the collection for the user (vendors or users)
      const userCollection = isVendor ? "vendors" : "users";
      const userDocRef = doc(firestore, userCollection, uid);
  
      // Create user document in Firestore
      await setDoc(userDocRef, {
        uid,
        name: user.name,
        email: user.email,
        avatar: null,
        createdAt: new Date().toISOString(),
        role: isVendor ? "vendor" : "customer",
        emailVerified: false, // You can update this later once the user verifies
      });
  
      // Optionally upload user avatar if it exists
      if (user.avatar) {
        remoteUri = await this.uploadPhotoAsync(
          user.avatar,
          `${userCollection}/${uid}`
        );
  
        // Update the user document with the avatar URL
        await setDoc(userDocRef, { avatar: remoteUri }, { merge: true });
      }
  
      // Alert user that the verification email has been sent
      alert("Account created! Please check your email to verify your account.");
    } catch (error) {
      console.error("❌ Error creating user:", error);
      alert("Error: " + error.message);
    }
  };

  uploadPhotoAsync = async (uri, filename) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, filename);
      const metadata = { contentType: "image/jpeg" };
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`📤 Upload Progress: ${progress}%`);
          },
          (error) => {
            console.error("❌ Upload error:", error.message);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      throw error;
    }
  };

  getUserData = async (uid) => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  getVendorData = async (uid) => {
    try {
      const vendorDocRef = doc(firestore, "vendors", uid);
      const vendorDoc = await getDoc(vendorDocRef);
      return vendorDoc.exists() ? vendorDoc.data() : null;
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      return null;
    }
  };

  updateVendorProfile = async (updatedData) => {
    const uid = this.uid;
    if (!uid) {
      console.error("❌ No user is logged in.");
      return;
    }
  
    const vendorRef = doc(this.firestore, "vendors", uid);
  
    try {
      await updateDoc(vendorRef, updatedData);
      console.log("✅ Vendor profile updated!");
    } catch (error) {
      console.error("❌ Failed to update vendor profile:", error);
      throw error;
    }
  };

  updateUserProfile = async (updatedData) => {
    const uid = this.uid;
    if (!uid) {
      console.error("❌ No user is logged in.");
      return;
    }
  
    const userRef = doc(this.firestore, "users", uid);
  
    try {
      await updateDoc(userRef, updatedData);
      console.log("✅ User profile updated!");
    } catch (error) {
      console.error("❌ Failed to update user profile:", error);
      throw error;
    }
  };

  addFavorite = async ({ itemId, vendorId, type }) => {
    const userId = this.uid;
    if (!userId || !vendorId) return;
  
    const favoriteRef = doc(this.firestore, "favorites", `${userId}_${itemId}_${type}`);
    const timestamp = new Date().toISOString();
  
    try {
      await setDoc(favoriteRef, {
        userId,
        vendorId,
        itemId,
        type, // 'shop' or 'product'
        createdAt: timestamp,
      });
  
      // Add notification for the vendor
      const notificationRef = doc(
        this.firestore,
        "vendors",
        vendorId,
        "notifications",
        `${userId}_${itemId}_${type}`
      );
  
      await setDoc(notificationRef, {
        userId,
        itemId,
        type,
        message: `Someone favorited your ${type === "shop" ? "shop" : "product"}.`,
        read: false,
        createdAt: timestamp,
      });
  
      console.log(`✅ ${type} favorited and vendor notified!`);
    } catch (error) {
      console.error("❌ Error adding favorite or notification:", error);
    }
  };

  removeFavorite = async ({ itemId, type }) => {
    const userId = this.uid;
    if (!userId) return;
  
    const favoriteRef = doc(this.firestore, "favorites", `${userId}_${itemId}_${type}`);
  
    try {
      await deleteDoc(favoriteRef);
      console.log(`❌ ${type} removed from favorites.`);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  getFavoritesByType = async (type) => {
    const userId = this.uid;
    if (!userId) return [];
  
    try {
      const q = query(
        collection(this.firestore, "favorites"),
        where("userId", "==", userId),
        where("type", "==", type)
      );
  
      const snapshot = await getDocs(q);
      const favorites = snapshot.docs.map((doc) => doc.data());
  
      return favorites; 
    } catch (error) {
      console.error(`Error fetching ${type} favorites:`, error);
      return [];
    }
  };

  getVendorNotifications = async (vendorId) => {
    try {
      const notifCollection = collection(this.firestore, "vendors", vendorId, "notifications");
      const snapshot = await getDocs(notifCollection);
  
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("❌ Error fetching vendor notifications:", error);
      return [];
    }
  };

  getShopById = async (shopId) => {
    try {
      const docSnap = await getDoc(doc(this.firestore, 'shops', shopId));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error fetching shop:', error);
      return null;
    }
  };
  
  getProductById = async (productId) => {
    try {
      const docSnap = await getDoc(doc(this.firestore, 'products', productId));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

//---------------------------- CART DATABASE --------------------------------//
addToBasket = async (product, quantity = 1) => {
    const userId = this.uid;
    if (!userId || !product?.id) {
      console.error("❌ Missing user ID or product ID");
      return;
    }

    try {
      const itemRef = doc(this.firestore, "baskets", userId, "items", product.id);
      const itemSnap = await getDoc(itemRef);

      const safePrice = Number(product.price);
      const safeQuantity = Number(quantity);

      if (isNaN(safePrice) || isNaN(safeQuantity)) {
        console.warn("⚠️ Price or quantity is not a number:", {
          price: product.price,
          quantity: quantity,
        });
        return;
      }

      if (itemSnap.exists()) {
        const currentQuantity = Number(itemSnap.data().quantity || 0);
        await updateDoc(itemRef, {
          quantity: currentQuantity + safeQuantity,
        });
      } else {
        await setDoc(itemRef, {
          id: product.id,
          name: product.name || "Unnamed Product",
          image: product.images?.[0] || "", // Optional image
          price: safePrice,
          quantity: safeQuantity,
          vendorId: product.vendorId || null,
          addedAt: new Date().toISOString(),
        });
      }

      console.log("✅ Product added to basket");
    } catch (error) {
      console.error("❌ Error adding to basket:", error);
    }
  };

  // ✅ Fetch Basket Items
  getBasketItems = async () => {
    const userId = this.uid;
    if (!userId) return [];

    try {
      const itemsRef = collection(this.firestore, "baskets", userId, "items");
      const snapshot = await getDocs(itemsRef);

      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          price: Number(data.price || 0),
          quantity: Number(data.quantity || 1),
        };
      });

      return items;
    } catch (error) {
      console.error("❌ Error fetching basket items:", error);
      return [];
    }
  };

removeBasketItem = async (productId) => {
  const userId = this.uid;
  if (!userId || !productId) return;

  try {
    const itemRef = doc(this.firestore, "baskets", userId, "items", productId);
    await deleteDoc(itemRef);
    console.log(`🧺 Removed ${productId} from basket`);
  } catch (error) {
    console.error("❌ Error removing item from basket:", error);
    throw error;
  }
};

// Clear all items in the basket after placing the order
clearBasket = async () => {
  const userId = this.uid;
  if (!userId) return;

  try {
    // Get all items in the basket
    const itemsRef = collection(this.firestore, "baskets", userId, "items");
    const snapshot = await getDocs(itemsRef);

    // Loop through each item and delete it
    const deletePromises = snapshot.docs.map(doc => {
      const itemRef = doc.ref;
      return deleteDoc(itemRef);
    });

    // Wait for all delete operations to finish
    await Promise.all(deletePromises);
    console.log("✅ Basket cleared after order");

  } catch (error) {
    console.error("❌ Error clearing basket:", error);
  }
};



// ---------------------------- ORDERS DATABASE --------------------------------//
addOrder = async (orderData) => {
  const userId = this.uid;
  if (!userId) {
    console.error("❌ No user logged in");
    return;
  }

  try {
    const orderRef = await addDoc(collection(this.firestore, "orders"), {
      ...orderData,
      userId,
      status: "processing", // you can adjust status flow (pending, paid, shipped, etc.)
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Order placed with ID:", orderRef.id);
    return orderRef.id;
  } catch (error) {
    console.error("❌ Error placing order:", error);
    throw error;
  }
};

getOrders = async () => {
  const userId = this.uid;
  if (!userId) return [];

  try {
    const q = query(
      collection(this.firestore, "orders"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    return [];
  }
};

getAllOrdersForVendor = async (vendorId) => {
  if (!vendorId) return [];

  try {
    const ordersRef = collection(this.firestore, "orders");
    const snapshot = await getDocs(ordersRef);

    // Filter orders that contain at least one product from this vendor
    const vendorOrders = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((order) =>
        order.items.some((item) => item.vendorId === vendorId)
      );

    return vendorOrders;
  } catch (error) {
    console.error("❌ Error fetching vendor orders:", error);
    return [];
  }
};

  // Method to update the order status
  updateOrderStatus = async (orderId, status) => {
    if (!orderId) {
      console.error("❌ Order ID is required to update status");
      return;
    }

    try {
      const orderRef = doc(this.firestore, "orders", orderId); // Reference to the order document in Firestore

      // Update the order status field
      await updateDoc(orderRef, {
        status: status, // Set the new status
        updatedAt: new Date().toISOString(), // Optional: add a timestamp of the update
      });

      console.log(`✅ Order ${orderId} status updated to ${status}`);
    } catch (error) {
      console.error("❌ Error updating order status:", error);
    }
  };


// removeOrder = async (orderId) => {
//   if (!orderId) return;

//   try {
//     await deleteDoc(doc(this.firestore, "orders", orderId));
//     console.log(`🗑️ Order ${orderId} deleted successfully`);
//   } catch (error) {
//     console.error("❌ Error deleting order:", error);
//     throw error;
//   }
// };




  signOut = () => {
    signOut(auth)
      .then(() => {
        console.log("✅ User signed out successfully");
      })
      .catch((error) => {
        console.error("❌ Error signing out:", error);
      });
  };

  get uid() {
    return auth.currentUser ? auth.currentUser.uid : null;
  }

  get timestamp() {
    return Date.now();
  }
}

// Singleton
Fire.shared = new Fire();
export default Fire;