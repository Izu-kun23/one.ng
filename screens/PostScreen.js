import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Fire from "../Fire";  
import UserPermissions from "../utilities/UserPermissions";  

export default class PostScreen extends React.Component {
    state = {
        text: "",
        image: null,
        userName: "",  // State for user's name
        userAvatar: null,  // State for user's avatar
    };

    async componentDidMount() {
        // Request camera permission
        const cameraPermission = await UserPermissions.getCameraPermission();
        if (cameraPermission !== "granted") {
            alert("We need permission to access your photos.");
        }

        // Fetch the user's name and avatar
        const userData = await this.getUserData();
        if (userData) {
            this.setState({ 
                userName: userData.name, 
                userAvatar: userData.avatar 
            });
        }
    }

    // Fetch user's name and avatar from Firestore
    getUserData = async () => {
        const { uid } = Fire.shared;  // Get current user's UID
        if (!uid) {
            alert("User is not logged in.");
            return null;
        }

        try {
            const userData = await Fire.shared.getUserData(uid);
            return userData;
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    };

    // Handle post creation
    handlePost = async () => {
        const { text, image, userName, userAvatar } = this.state;

        if (text.trim() === "" && !image) {
            alert("Please enter some text or select an image.");
            return;
        }

        try {
            const remoteUri = image ? await Fire.shared.uploadPhotoAsync(image, `photos/${Fire.shared.uid}/${Date.now()}`) : null;

            // Add the post with the user's name and avatar included
            await Fire.shared.addPost({ 
                text, 
                localUri: remoteUri || "", 
                name: userName, 
                avatar: userAvatar 
            });
            this.setState({ text: "", image: null });
            this.props.navigation.goBack();
        } catch (error) {
            alert("Error posting: " + error.message);
        }
    };

    // Pick an image from the user's library
    pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
        });

        if (!result.canceled) {
            this.setState({ image: result.assets[0].uri });
        }
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    {/* Back button */}
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#E71D69" />
                    </TouchableOpacity>
                    {/* Post button */}
                    <TouchableOpacity onPress={this.handlePost}>
                        <Text style={{ fontWeight: "500" }}>Post</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    {/* Placeholder for avatar */}
                    <Image source={{ uri: this.state.userAvatar || require("../assets/tempAvatar.jpg") }} style={styles.avatar} />
                    <TextInput
                        autoFocus={true}
                        multiline={true}
                        numberOfLines={4}
                        style={{ flex: 1 }}
                        placeholder="Want to share something?"
                        onChangeText={text => this.setState({ text })}
                        value={this.state.text}
                    />
                </View>

                {/* Camera icon button to pick image */}
                <TouchableOpacity style={styles.photo} onPress={this.pickImage}>
                    <Ionicons name="camera" size={32} color="#E71D69" />
                </TouchableOpacity>

                {/* Display the selected image */}
                {this.state.image && (
                    <View style={{ marginHorizontal: 32, marginTop: 32, height: 150 }}>
                        <Image source={{ uri: this.state.image }} style={{ width: "100%", height: "100%" }} />
                    </View>
                )}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#D8D9DB"
    },
    inputContainer: {
        margin: 32,
        flexDirection: "row"
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16
    },
    photo: {
        alignItems: "flex-end",
        marginHorizontal: 32
    }
});