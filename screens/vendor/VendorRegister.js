import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  StatusBar,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Fire from "../../Fire"; 
import loadingImage from "../../assets/loading.png"; // Loading image

export default class VendorRegister extends React.Component {
  state = {
    vendor: {
      name: "",
      email: "",
      password: "",
      avatar: null,
    },
    errorMessage: null,
    isLoading: false,
  };

  handleSignUp = async () => {
    const { name, email, password, avatar } = this.state.vendor;

    if (!name || !email || !password) {
      this.setState({ errorMessage: "All fields are required!" });
      return;
    }

    if (password.length < 6) {
      this.setState({ errorMessage: "Password must be at least 6 characters!" });
      return;
    }

    this.setState({ isLoading: true });

    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;

      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await Fire.shared.uploadPhotoAsync(avatar, `vendors/${user.uid}`);
      }

      await updateProfile(user, { displayName: name, photoURL: avatarUrl });

      const vendorDocRef = doc(getFirestore(), "vendors", user.uid);
      await setDoc(vendorDocRef, {
        uid: user.uid,
        name,
        email,
        avatar: avatarUrl,
        role: "vendor",
        createdAt: new Date().toISOString(),
      });

      this.setState({ isLoading: false });
      this.props.navigation.navigate("VendorLogin");
    } catch (error) {
      this.setState({ errorMessage: error.message, isLoading: false });
    }
  };

  handlePickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      this.setState({
        vendor: { ...this.state.vendor, avatar: result.assets[0].uri },
      });
    }
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />

          {/* Green Header */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingText}>Become a Vendor Today!</Text>
          </View>

          {/* Error Message */}
          {this.state.errorMessage && (
            <Text style={styles.errorText}>{this.state.errorMessage}</Text>
          )}

          {/* Avatar Picker */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarPlaceholder}
              onPress={this.handlePickAvatar}
            >
              {this.state.vendor.avatar ? (
                <Image source={{ uri: this.state.vendor.avatar }} style={styles.avatar} />
              ) : (
                <Ionicons name="camera" size={40} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Input Form */}
          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}>Full Name</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="words"
                onChangeText={(name) =>
                  this.setState({ vendor: { ...this.state.vendor, name } })
                }
                value={this.state.vendor.name}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.inputTitle}>Email Address</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(email) =>
                  this.setState({ vendor: { ...this.state.vendor, email } })
                }
                value={this.state.vendor.email}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.inputTitle}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                onChangeText={(password) =>
                  this.setState({ vendor: { ...this.state.vendor, password } })
                }
                value={this.state.vendor.password}
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.button} onPress={this.handleSignUp} disabled={this.state.isLoading}>
            <Text style={{ color: "#FFF", fontWeight: "500" }}>
              {this.state.isLoading ? "Signing Up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Navigate to Login */}
          <TouchableOpacity style={{ alignSelf: "center", marginTop: 15 }} onPress={() => this.props.navigation.navigate("VendorLogin")}>
            <Text style={{ color: "#414959", fontSize: 13 }}>
              Already have an account? <Text style={{ fontWeight: "500", color: "#386F4F" }}>Login</Text>
            </Text>
          </TouchableOpacity>

          {/* Loading Image */}
          <Image source={loadingImage} style={styles.loadingImage} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  greetingCard: {
    width: "110%",
    height: "34%",
    backgroundColor: "#386F4F",
    borderBottomLeftRadius: 65,
    borderBottomRightRadius: 65,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    position: "absolute",
    top: 0,
  },
  greetingText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  errorText: {
    marginTop: "35%",
    color: "red",
    fontSize: 14,
    fontWeight: "500",
  },
  avatarContainer: {
    alignSelf: "center",
    marginTop: 230,
    zIndex: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#E1E2E6",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  form: {
    width: "80%",
    marginTop: 50,
  },
  inputTitle: {
    color: "#8A8F9E",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  input: {
    borderBottomColor: "#8A8F9E",
    borderBottomWidth: 1,
    height: 40,
    fontSize: 16,
    color: "#161F3D",
  },
  button: {
    width: "60%",
    backgroundColor: "#386F4F",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  loadingImage: {
    width: 150,
    height: 110,
    marginTop: 20,
  },
});

