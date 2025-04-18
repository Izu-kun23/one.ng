import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { auth } from '../../firebaseConfig'; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";

export default class LoadingScreen extends React.Component {
  constructor(props) {
    super(props);

    this.fadeAnim = new Animated.Value(0); // Initially hidden
    this.translateY = new Animated.Value(50); // Start below position
    this.loadingWidth = new Animated.Value(0); // Loading bar width
  }

  componentDidMount() {
    // Animate image fading in and moving up
    Animated.parallel([
      Animated.timing(this.fadeAnim, {
        toValue: 1, // Fade in
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(this.translateY, {
        toValue: 0, // Move to normal position
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate the loading bar filling up
    Animated.timing(this.loadingWidth, {
      toValue: 100, // Full width
      duration: 5000, // Takes 5 seconds to complete
      useNativeDriver: false,
    }).start();

    // Navigate to OptionsScreen after 5 seconds
    setTimeout(() => {
      this.props.navigation.navigate("Options");
    }, 5000);
  }

  render() {
    return (
      <View style={styles.container}>
        {/* Animated Logo */}
        <Animated.Image
          source={require("../../assets/loading.png")}
          style={[
            styles.image,
            {
              opacity: this.fadeAnim,
              transform: [{ translateY: this.translateY }],
            },
          ]}
        />

        {/* Loading bar */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDash,
              {
                width: this.loadingWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 20,

  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
    width: "80%",
    height: 7,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  loadingDash: {
    height: "100%",
    backgroundColor: "#386F4F",
    borderRadius: 5,
  },
});