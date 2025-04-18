import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Fire from "../../Fire";
import UserPermissions from "../../utilities/UserPermissions";

export default class PostScreen extends React.Component {
  state = {
    text: "",
    image: null,
    userName: "",
    userAvatar: null,
  };

  async componentDidMount() {
    // Request permissions
    const hasPermission = await UserPermissions.getCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission needed", "We need access to your media library.");
    }

    // Load user data
    const userData = await this.getUserData();
    if (userData) {
      this.setState({
        userName: userData.name,
        userAvatar: userData.avatar,
      });
    }
  }

  getUserData = async () => {
    const { uid } = Fire.shared;
    if (!uid) {
      Alert.alert("Not Logged In", "Please log in to create a post.");
      return null;
    }

    try {
      const data = await Fire.shared.getUserData(uid);
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  handlePost = async () => {
    const { text, image, userName, userAvatar } = this.state;

    if (text.trim() === "" && !image) {
      Alert.alert("Nothing to post", "Please add text or an image.");
      return;
    }

    try {
      const remoteUri = image
        ? await Fire.shared.uploadPhotoAsync(image, `photos/${Fire.shared.uid}/${Date.now()}`)
        : null;

      await Fire.shared.addPost({
        text,
        localUri: remoteUri || "",
        name: userName,
        avatar: userAvatar,
      });

      this.setState({ text: "", image: null });
      this.props.navigation.goBack();
    } catch (error) {
      Alert.alert("Error posting", error.message);
    }
  };

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      this.setState({ image: result.assets[0].uri });
    }
  };

  render() {
    const { text, image, userAvatar } = this.state;
    const canPost = text.trim() !== "" || image;

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#E71D69" />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.handlePost} disabled={!canPost}>
            <Text style={{ fontWeight: "500", color: canPost ? "#E71D69" : "#bbb" }}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Image
            source={{ uri: userAvatar || require("../../assets/tempAvatar.jpg") }}
            style={styles.avatar}
          />
          <TextInput
            autoFocus
            multiline
            numberOfLines={4}
            style={{ flex: 1 }}
            placeholder="Want to share something?"
            value={text}
            onChangeText={(text) => this.setState({ text })}
          />
        </View>

        {/* Camera */}
        <TouchableOpacity style={styles.photo} onPress={this.pickImage}>
          <Ionicons name="camera" size={32} color="#E71D69" />
        </TouchableOpacity>

        {/* Image Preview */}
        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => this.setState({ image: null })}
            >
              <Ionicons name="close-circle" size={24} color="#E71D69" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D9DB",
  },
  inputContainer: {
    margin: 32,
    flexDirection: "row",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  photo: {
    alignItems: "flex-end",
    marginHorizontal: 32,
  },
  imagePreview: {
    marginHorizontal: 32,
    marginTop: 32,
    height: 150,
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
});