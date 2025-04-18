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
import { Ionicons } from "@expo/vector-icons"; // for eye icon

export default class LoginScreen extends React.Component {
  static navigationOptions = {
    headerShown: null,
  };

  state = {
    email: "",
    password: "",
    errorMessage: null,
    secureTextEntry: true,
  };

  handleLogin = async () => {
    const { email, password } = this.state;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      this.props.navigation.navigate("App");
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  };

  render() {
    LayoutAnimation.easeInEaseOut();
    const { email, password, secureTextEntry, errorMessage } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />

        {/* Title */}
        <Text style={styles.title}>Login to OneNG</Text>

        {/* Error Message */}
        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.inputTitle}>Email Address</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(email) => this.setState({ email })}
          />

          <Text style={[styles.inputTitle, { marginTop: 20 }]}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              value={password}
              onChangeText={(password) => this.setState({ password })}
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

        {/* Sign In Button */}
        <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
          <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign in</Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <TouchableOpacity
          style={{ alignSelf: "center", marginTop: 15 }}
          onPress={() => this.props.navigation.navigate("Register")}
        >
          <Text style={{ color: "#414959", fontSize: 13 }}>
            New to OneNG?{" "}
            <Text style={{ fontWeight: "500", color: "#386F4F" }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        {/* Loading Image */}
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
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#386F4F",
    marginTop: 90,
    textAlign: "center",
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
  },
  form: {
    width: "85%",
    marginTop: 48,
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
    height: 55,
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
    bottom: 12,
    padding: 8,
  },
  button: {
    width: "55%",
    backgroundColor: "#386F4F",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 65,
  },
  loadingImage: {
    width: 140,
    height: 590,
    resizeMode: "contain",
    marginTop: 40,
  },
});