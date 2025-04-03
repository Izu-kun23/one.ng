import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OptionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How would you like to proceed?</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.buttonText}>Vendor</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.buttonText}>Customer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#386F4F', // Green background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 12,
    marginVertical: 10,
    width: '50%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#386F4F',
    fontSize: 18,
    fontWeight: 'bold',
  },
});