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
import UserPermissions from "../../utilities/UserPermissions";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Fire from "../../Fire"; 
import loadingImage from "../../assets/loading.png"; // Import the loading image

export default class RegisterScreen extends React.Component {
  state = {
    user: {
      name: "",
      email: "",
      password: "",
      avatar: null,
    },
    errorMessage: null,
  };

  handleSignUp = async () => {
    const { name, email, password, avatar } = this.state.user;

    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;

      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await Fire.shared.uploadPhotoAsync(
          avatar,
          `avatars/${user.uid}`
        );
      }

      await updateProfile(user, { displayName: name, photoURL: avatarUrl });

      const userDocRef = doc(getFirestore(), "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        name,
        email,
        avatar: avatarUrl,
        createdAt: new Date().toISOString(),
      });

      this.props.navigation.navigate("Login");
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  };

  handlePickAvatar = async () => {
    await UserPermissions.getCameraPermission();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      this.setState({
        user: { ...this.state.user, avatar: result.assets[0].uri },
      });
    }
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />

          {/* Green Curved Greeting Card */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingText}>Join Us Today!</Text>
          </View>

          {/* Error Message */}
          <View style={styles.errorMessage}>
            {this.state.errorMessage && (
              <Text style={{ color: "red" }}>{this.state.errorMessage}</Text>
            )}
          </View>

          {/* Avatar Picker */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarPlaceholder}
              onPress={this.handlePickAvatar}
            >
              {this.state.user.avatar ? (
                <Image
                  source={{ uri: this.state.user.avatar }}
                  style={styles.avatar}
                />
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
                  this.setState({ user: { ...this.state.user, name } })
                }
                value={this.state.user.name}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.inputTitle}>Email Address</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(email) =>
                  this.setState({ user: { ...this.state.user, email } })
                }
                value={this.state.user.email}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.inputTitle}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                onChangeText={(password) =>
                  this.setState({ user: { ...this.state.user, password } })
                }
                value={this.state.user.password}
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
            <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign Up</Text>
          </TouchableOpacity>

          {/* Navigate to Login */}
          <TouchableOpacity
            style={{ alignSelf: "center", marginTop: 15 }}
            onPress={() => this.props.navigation.navigate("Login")}
          >
            <Text style={{ color: "#414959", fontSize: 13 }}>
              Already have an account?{" "}
              <Text style={{ fontWeight: "500", color: "#386F4F" }}>Login</Text>
            </Text>
          </TouchableOpacity>

          {/* Loading Image at the Bottom */}
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
    fontSize: 46,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  errorMessage: {
    marginTop: "35%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    alignSelf: "center",
    marginTop: 40,
    zIndex: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#E1E2E6",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    marginBottom: 15,
  },
  button: {
    width: "45%",
    backgroundColor: "#386F4F",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  loadingImage: {
    width: 150,
    height: 110,
    marginTop: 20,
  },
});