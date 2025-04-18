import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Fire from "../../Fire";

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const user = await Fire.shared.getUserData(Fire.shared.uid);
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
        setProfileImage(user.avatar || null);
      }
    };
    fetchUser();
  }, []);

  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Save updated profile
  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarUrl = profileImage;

      // If new image selected (local URI)
      if (profileImage && profileImage.startsWith("file")) {
        avatarUrl = await Fire.shared.uploadPhotoAsync(
          profileImage,
          `users/${Fire.shared.uid}/avatar`
        );
      }

      await Fire.shared.updateUserProfile({
        name,
        avatar: avatarUrl,
      });

      Alert.alert("Success", "Your profile has been updated!");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("../../assets/tempImage2.jpg")
          }
          style={styles.profileImage}
        />
        <Text style={styles.changeText}>Change Profile Picture</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        editable={false} // Optional: make email read-only
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changeText: {
    color: "#386F4F",
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: "#386F4F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});