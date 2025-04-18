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
import loadingImage from "../../assets/loading.png";

export default class VendorRegister extends React.Component {
  state = {
    vendor: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatar: null,
    },
    errorMessage: null,
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
  };

  handleSignUp = async () => {
    const { name, email, password, confirmPassword, avatar } = this.state.vendor;

    if (!name || !email || !password || !confirmPassword) {
      this.setState({ errorMessage: "All fields are required!" });
      return;
    }

    if (password.length < 6) {
      this.setState({ errorMessage: "Password must be at least 6 characters!" });
      return;
    }

    if (password !== confirmPassword) {
      this.setState({ errorMessage: "Passwords do not match!" });
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
    const { vendor, errorMessage, isLoading, showPassword, showConfirmPassword } = this.state;

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />

          <Text style={styles.title}>Create your vendor account</Text>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarPlaceholder} onPress={this.handlePickAvatar}>
            {vendor.avatar ? (
              <Image source={{ uri: vendor.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="camera" size={36} color="#888" />
            )}
          </TouchableOpacity>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.inputTitle}>Full Name</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="words"
              value={vendor.name}
              onChangeText={(name) =>
                this.setState({ vendor: { ...vendor, name } })
              }
            />

            <Text style={[styles.inputTitle, { marginTop: 20 }]}>Email Address</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={vendor.email}
              onChangeText={(email) =>
                this.setState({ vendor: { ...vendor, email } })
              }
            />

            {/* Password */}
            <Text style={[styles.inputTitle, { marginTop: 20 }]}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={vendor.password}
                onChangeText={(password) =>
                  this.setState({ vendor: { ...vendor, password } })
                }
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => this.setState({ showPassword: !showPassword })}
              >
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#386F4F" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={[styles.inputTitle, { marginTop: 20 }]}>Confirm Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                value={vendor.confirmPassword}
                onChangeText={(confirmPassword) =>
                  this.setState({ vendor: { ...vendor, confirmPassword } })
                }
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => this.setState({ showConfirmPassword: !showConfirmPassword })}
              >
                <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#386F4F" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={this.handleSignUp} disabled={isLoading}>
            <Text style={{ color: "#FFF", fontWeight: "600" }}>
              {isLoading ? "Signing up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 15 }} onPress={() => this.props.navigation.navigate("VendorLogin")}>
            <Text style={{ fontSize: 13, color: "#444" }}>
              Already have an account?{" "}
              <Text style={{ color: "#386F4F", fontWeight: "500" }}>Login</Text>
            </Text>
          </TouchableOpacity>

          <Image source={loadingImage} style={styles.loadingImage} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 75,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#386F4F",
    marginBottom: 20,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E1E2E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  form: {
    width: "100%",
    marginBottom: 30,
  },
  inputTitle: {
    fontSize: 12,
    color: "#8A8F9E",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    height: 40,
    fontSize: 16,
    color: "#161F3D",
    paddingRight: 30,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    bottom: 10,
    padding: 5,
  },
  button: {
    backgroundColor: "#386F4F",
    borderRadius: 8,
    height: 50,
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loadingImage: {
    width: 120,
    height: 150,
    marginTop: 70,
    resizeMode: "contain",
  },
});