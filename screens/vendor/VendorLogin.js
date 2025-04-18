import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  LayoutAnimation,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons"; // for eye & check icons

export default class VendorLogin extends React.Component {
  static navigationOptions = {
    headerShown: null,
  };

  state = {
    email: "",
    password: "",
    errorMessage: null,
    secureTextEntry: true,
    rememberMe: false,
  };

  handleLogin = async () => {
    const { email, password } = this.state;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      this.props.navigation.navigate("VendorHome");
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  };

  render() {
    LayoutAnimation.easeInEaseOut();
    const { secureTextEntry, rememberMe } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <Text style={styles.greetingText}>Login to your business</Text>

        {/* Error Message */}
        <View style={styles.errorMessage}>
          {this.state.errorMessage && (
            <Text style={{ color: "red" }}>{this.state.errorMessage}</Text>
          )}
        </View>

        {/* Input Form */}
        <View style={styles.form}>
          {/* Email */}
          <View>
            <Text style={styles.inputTitle}>Email Address</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(email) => this.setState({ email })}
              value={this.state.email}
            />
          </View>

          {/* Password with Eye Icon */}
          <View style={{ marginTop: 20 }}>
            <Text style={styles.inputTitle}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
                onChangeText={(password) => this.setState({ password })}
                value={this.state.password}
              />
              <TouchableOpacity
                onPress={() =>
                  this.setState({ secureTextEntry: !secureTextEntry })
                }
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-off" : "eye"}
                  size={20}
                  color="#386F4F"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me */}
          <View style={styles.rememberMeRow}>
            <TouchableOpacity
              onPress={() => this.setState({ rememberMe: !rememberMe })}
              style={styles.checkboxContainer}
            >
              {rememberMe ? (
                <Ionicons name="checkmark" size={16} color="green" fontWeight="bold"/>
              ) : null}
            </TouchableOpacity>
            <Text style={styles.rememberText}>Remember Me</Text>
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
          <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign in</Text>
        </TouchableOpacity>

        {/* Return to Customer Page */}
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => {
            this.props.navigation.getParent().navigate("Auth", {
              screen: "Login",
            });
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "500" }}>
            Return to Customer Page
          </Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <TouchableOpacity
          style={{ alignSelf: "center", marginTop: 15 }}
          onPress={() => this.props.navigation.navigate("VendorRegister")}
        >
          <Text style={{ color: "#414959", fontSize: 13 }}>
            New to OneNG?{" "}
            <Text style={{ fontWeight: "500", color: "#386F4F" }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        {/* Image */}
        <Image
          source={require("../../assets/loading.png")}
          style={styles.loadingImage}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 22,
    backgroundColor: "#f8f8f8",
  },
  greetingText: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#386F4F",
    marginTop: 80,
    textAlign: "center",
    alignSelf: "center",
  },
  errorMessage: {
    marginTop: 20,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    width: "80%",
    marginTop: 20,
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 8,
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
    height: 50,
    fontSize: 16,
    color: "#161F3D",
    marginBottom: 5,
    paddingRight: 35, // space for eye icon
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    bottom: 12,
    padding: 8,
  },
  rememberMeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  checkboxContainer: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#386F4F",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  rememberText: {
    fontSize: 14,
    color: "#333",
  },
  button: {
    width: "55%",
    backgroundColor: "#386F4F",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  returnButton: {
    width: "55%",
    backgroundColor: "#565B56",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  loadingImage: {
    width: 120,
    height: 150,
    resizeMode: "contain",
    marginTop: 150,
  },
});