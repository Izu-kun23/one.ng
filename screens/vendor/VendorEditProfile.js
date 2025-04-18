import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Fire from '../../Fire';

const VendorEditProfile = () => {
  const [vendor, setVendor] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current vendor data on mount
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const data = await Fire.shared.getVendorData(Fire.shared.uid);
        if (data) {
          setVendor({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            avatar: data.avatar || null,
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load vendor info.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setVendor((prev) => ({ ...prev, avatar: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    if (!vendor.name || !vendor.email) {
      Alert.alert('Validation Error', 'Name and Email are required.');
      return;
    }

    setSaving(true);

    try {
      let avatarUrl = vendor.avatar;

      if (vendor.avatar && !vendor.avatar.startsWith('https://')) {
        avatarUrl = await Fire.shared.uploadPhotoAsync(vendor.avatar, `vendors/${Fire.shared.uid}`);
      }

      await Fire.shared.updateVendorProfile({
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        avatar: avatarUrl,
      });

      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#386F4F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {/* Profile Photo */}
      <TouchableOpacity onPress={handlePickImage} style={styles.avatarPlaceholder}>
        {vendor.avatar ? (
          <Image source={{ uri: vendor.avatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="camera" size={36} color="#888" />
        )}
      </TouchableOpacity>

      {/* Name Input */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={vendor.name}
        onChangeText={(text) => setVendor((prev) => ({ ...prev, name: text }))}
      />

      {/* Email Input */}
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={vendor.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => setVendor((prev) => ({ ...prev, email: text }))}
      />

      {/* Phone Number Input */}
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.phoneRow}>
        <Text style={styles.countryCode}>+234</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder="8012345678"
          keyboardType="phone-pad"
          maxLength={10}
          value={vendor.phone}
          onChangeText={(text) => setVendor((prev) => ({ ...prev, phone: text }))}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveText}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VendorEditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#386F4F',
    marginBottom: 30,
    textAlign: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#E1E2E6',
    borderRadius: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 20,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#386F4F',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});