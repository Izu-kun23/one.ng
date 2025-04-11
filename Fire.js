import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "./firebaseConfig";  // Your Firebase App Config file

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

class Fire {
  constructor() {
    this.auth = auth;         // ✅ Attach auth instance
    this.firestore = firestore;  // ✅ Attach firestore instance
    this.storage = storage;      // ✅ Attach storage instance
  }



  /**
 * Add a new shop to Firestore
 */
addShop = async ({ shopName, about, street, city, category, shopImage, vendorName }) => {
  if (!this.uid) {
    console.error("🔥 User UID is not available!");
    return;
  }

  try {
    let remoteUri = null;

    // Upload Image if provided
    if (shopImage) {
      const imagePath = `shops/${this.uid}/${Date.now()}`;
      remoteUri = await this.uploadPhotoAsync(shopImage, imagePath);
    }

    // Create shop document
    const newShop = {
      name: shopName,
      about,
      location: `${street}, ${city}`,
      category,
      image: remoteUri || null,  // Use uploaded image URL
      vendor: vendorName || "Anonymous",
      vendorId: this.uid,  // Store the vendor's UID
      createdAt: new Date().toISOString(),
    };

    // Save shop data in Firestore
    const docRef = await addDoc(collection(this.firestore, "shops"), newShop);

    console.log("✅ Shop added with ID:", docRef.id);
    return docRef.id; // Return shop ID
  } catch (error) {
    console.error("❌ Error adding shop:", error);
    throw error;
  }
};

 getShops = async () => {
  try {
    // Reference to the shops collection
    const shopsCollectionRef = collection(Fire.shared.firestore, "shops");

    // Fetch documents from the shops collection
    const shopSnapshot = await getDoc(shopsCollectionRef);
    
    // Map through the documents and get data
    const shopsList = shopSnapshot.docs.map((doc) => ({
      id: doc.id, // The document ID
      ...doc.data(), // The actual data from the document
    }));

    return shopsList; // Return the array of shops
  } catch (error) {
    console.error("Error fetching shops:", error);
    return []; // Return an empty array if there's an error
  }
}

deleteShop = async (shopId, shopImage) => {
  if (!shopId) {
    console.error("❌ Shop ID is required for deletion!");
    return;
  }

  try {
    const shopRef = doc(this.firestore, "shops", shopId);

    // Delete the shop image from Firebase Storage (if exists)
    if (shopImage) {
      const storage = getStorage();
      const imageRef = ref(storage, shopImage); // Get reference to the image
      await deleteObject(imageRef).catch((err) => console.warn("⚠️ Image deletion failed:", err));
    }

    // Delete shop document from Firestore
    await deleteDoc(shopRef);
    
    console.log(`✅ Shop with ID ${shopId} deleted successfully!`);
  } catch (error) {
    console.error("❌ Error deleting shop:", error);
  }
};


  /**
   * Add a post to Firestore
   */
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
        name,  // Use the name from the user data
        avatar, // Include avatar in the post
        uid: this.uid,
        timestamp: this.timestamp,
        image: remoteUri,
      });

      console.log("✅ Post added with ID:", docRef.id);
    } catch (error) {
      console.error("❌ Error adding post:", error);
    }
  };

  /**
   * Create a new user in Firebase Authentication and Firestore
   */
  createUser = async (user, isVendor = false) => {
    let remoteUri = null;
  
    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const { uid } = userCredential.user;
  
      console.log("✅ User created successfully in Firebase Auth:", uid);
  
      // Step 2: Reference to Firestore collection
      const userCollection = isVendor ? "vendors" : "users";
      const userDocRef = doc(firestore, userCollection, uid);
  
      // Step 3: Store user details in Firestore
      await setDoc(userDocRef, {
        uid,
        name: user.name,
        email: user.email,
        avatar: null,
        createdAt: new Date().toISOString(),
        role: isVendor ? "vendor" : "customer",  // Identify role
      });
  
      console.log(`✅ ${isVendor ? "Vendor" : "User"} document created in Firestore:`, uid);
  
      // Step 4: Upload avatar (if provided)
      if (user.avatar) {
        remoteUri = await this.uploadPhotoAsync(user.avatar, `${userCollection}/${uid}`);
        
        // Step 5: Update Firestore with avatar URL
        await setDoc(userDocRef, { avatar: remoteUri }, { merge: true });
  
        console.log("✅ Avatar uploaded & Firestore updated:", remoteUri);
      }
      
    } catch (error) {
      console.error("❌ Error creating user:", error);
      alert("Error: " + error.message);
    }
  };

  /**
   * Uploads an image to Firebase Storage and returns the download URL
   */
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
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

    // Fetch user data including name and avatar
   getUserData = async (uid) => {
      try {
        const userDocRef = doc(firestore, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return userDoc.data(); // Return user data (name, avatar, etc.)
        } else {
          console.error("User document not found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    };

    // Fetch vendor data including name and avatar
 getVendorData = async (uid) => {
  try {
    const vendorDocRef = doc(firestore, "vendors", uid); // 🔹 Use "vendors" collection
    const vendorDoc = await getDoc(vendorDocRef);
    
    if (vendorDoc.exists()) {
      return vendorDoc.data(); // ✅ Return vendor data (name, avatar, etc.)
    } else {
      console.error("Vendor document not found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching vendor data:", error);
    return null;
  }
};


  /**
   * Log the user out of Firebase Authentication
   */
  signOut = () => {
    signOut(auth)
      .then(() => {
        console.log("✅ User signed out successfully");
      })
      .catch((error) => {
        console.error("❌ Error signing out:", error);
      });
  };

  /**
   * Returns the currently logged-in user's UID
   */
  get uid() {
    return auth.currentUser ? auth.currentUser.uid : null;
  }

  /**
   * Returns the current timestamp
   */
  get timestamp() {
    return Date.now();
  }
}

// Singleton instance of Fire class
Fire.shared = new Fire();
export default Fire;