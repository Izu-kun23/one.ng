import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function VerifyScreen({ route, navigation }) {
  const { email } = route.params;

  const handleVerify = () => {
    // Simulate verification process
    Alert.alert("Email Verified", `Your email ${email} has been verified!`);
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Click below to verify your email:</Text>
      <Text style={styles.email}>{email}</Text>

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify Email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#386F4F',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});