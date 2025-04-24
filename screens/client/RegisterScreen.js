import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import UserPermissions from "../../utilities/UserPermissions";
import Fire from "../../Fire";
import loadingImage from "../../assets/loading.png";

export default class RegisterScreen extends React.Component {
  state = {
    user: {
      name: "",
      email: "",
      password: "",
      avatar: null,
    },
    errorMessage: null,
    loading: false,
  };

  // Handle user sign-up
  handleSignUp = async () => {
    const { name, email, password, avatar } = this.state.user;

    if (!name || !email || !password) {
      this.setState({ errorMessage: "All fields are required." });
      return;
    }

    this.setState({ errorMessage: null, loading: true });

    try {
      // Register the user with Firebase or your authentication system
      await Fire.shared.createUser(
        { name, email, password, avatar },
        false // isVendor = false
      );

      // Send registration email
      console.log('Sending email to:', email, 'Name:', name);  // Debugging log
      await this.sendRegistrationEmail(email, name);

      Alert.alert(
        "Account Created",
        "Your account has been created successfully. Please check your email to be sure of your account.",
      );

      this.props.navigation.navigate("Login");
    } catch (error) {
      console.error('Error in handleSignUp:', error);  // Debugging log
      this.setState({ errorMessage: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  // Send registration email to user
  sendRegistrationEmail = async (email, name) => {
    try {
      // Send a POST request to your backend to send the verification email
      const response = await fetch('http://localhost:3000/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Email sent successfully:', data);
      } else {
        throw new Error(data.message || 'Error sending email');
      }
    } catch (error) {
      console.error('Error sending registration email:', error);
    }
  };

  // Handle avatar pick from the device
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <StatusBar barStyle="dark-content" />

          <Text style={styles.title}>Join Us Today!</Text>

          {this.state.errorMessage && (
            <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
          )}

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
                <Ionicons name="camera" size={36} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.inputTitle}>Full Name</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="words"
              onChangeText={(name) =>
                this.setState({ user: { ...this.state.user, name } })
              }
              value={this.state.user.name}
            />

            <Text style={[styles.inputTitle, { marginTop: 20 }]}>
              Email Address
            </Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(email) =>
                this.setState({ user: { ...this.state.user, email } })
              }
              value={this.state.user.email}
            />

            <Text style={[styles.inputTitle, { marginTop: 20 }]}>Password</Text>
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

          <TouchableOpacity
            style={styles.button}
            onPress={this.handleSignUp}
            disabled={this.state.loading}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>
              {this.state.loading ? "Registering..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignSelf: "center", marginTop: 15 }}
            onPress={() => this.props.navigation.navigate("Login")}
          >
            <Text style={{ fontSize: 13, color: "#414959" }}>
              Already have an account?{" "}
              <Text style={{ color: "#386F4F", fontWeight: "500" }}>Login</Text>
            </Text>
          </TouchableOpacity>

          <Image source={loadingImage} style={styles.loadingImage} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center", // This will center the form vertically if there is extra space
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#386F4F",
    marginTop: 59,
    marginBottom: 30,
    textAlign: "center",
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  avatarContainer: {
    alignSelf: "center",
    marginTop: 20,
    zIndex: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#E1E2E6",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
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
    width: "100%", // Set form width to 100% to make it wider
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
    paddingLeft: 5,
    width: "300", // Set input width to 100% to fill the form container
  },
  button: {
    width: "90%", // Adjusted to take up more screen space
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
    alignSelf: "center",
  },
});