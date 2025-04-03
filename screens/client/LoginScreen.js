import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  LayoutAnimation
} from "react-native";
import { auth } from "../../firebaseConfig"; 
import { signInWithEmailAndPassword } from "firebase/auth";

export default class LoginScreen extends React.Component {
  static navigationOptions = {
    headerShown: null,
  };

  state = {
    email: "",
    password: "",
    errorMessage: null,
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
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Green Curved Greeting Card */}
        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>Welcome back, ready to shop?</Text>
        </View>

        {/* Error Message */}
        <View style={styles.errorMessage}>
          {this.state.errorMessage && (
            <Text style={{ color: "red" }}>{this.state.errorMessage}</Text>
          )}
        </View>

        {/* Input Form - Fixed Positioning */}
        <View style={styles.form}>
          <View>
            <Text style={styles.inputTitle}>Email Address</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              onChangeText={(email) => this.setState({ email })}
              value={this.state.email}
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.inputTitle}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              onChangeText={(password) => this.setState({ password })}
              value={this.state.password}
            />
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
          <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign in</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity 
          style={{ alignSelf: "center", marginTop: 15 }}
          onPress={() => this.props.navigation.navigate('Register')}
        >
          <Text style={{ color: "#414959", fontSize: 13 }}>
            New to OneNG?{" "}
            <Text style={{ fontWeight: "500", color: "#386F4F" }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        {/* Loading Image at Bottom */}
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
  greetingCard: {
    width: "110%",
    height: "40%", // Reduced height to fix form spacing
    backgroundColor: "#386F4F", 
    borderBottomLeftRadius: 65, 
    borderBottomRightRadius: 65, 
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40, // Ensures text is visible
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
    marginTop: "35%", // Moves below the greeting card
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    width: "80%",
    marginTop: 240, // Moves form up closer to the card
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
    height: 150,
    resizeMode: "contain",
    marginTop: 25,
  },
});