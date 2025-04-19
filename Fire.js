import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
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
      console.error("❌ Shop ID is required");
      return [];
    }
  
    try {
      const productsCollectionRef = collection(Fire.shared.firestore, "products");
  
      // Query products by shopId
      const q = query(
        productsCollectionRef,
        where("shopId", "==", shopId)
      );
  
      // Fetch the products
      const productSnapshot = await getDocs(q);
  
      // Map the product data to a list
      const productList = productSnapshot.docs.map((doc) => ({
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      const { uid } = userCredential.user;

      const userCollection = isVendor ? "vendors" : "users";
      const userDocRef = doc(firestore, userCollection, uid);

      await setDoc(userDocRef, {
        uid,
        name: user.name,
        email: user.email,
        avatar: null,
        createdAt: new Date().toISOString(),
        role: isVendor ? "vendor" : "customer",
      });

      if (user.avatar) {
        remoteUri = await this.uploadPhotoAsync(
          user.avatar,
          `${userCollection}/${uid}`
        );

        await setDoc(userDocRef, { avatar: remoteUri }, { merge: true });
      }
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