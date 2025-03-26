import * as ImagePicker from "expo-image-picker";

class UserPermissions {
    getCameraPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            alert("We need permission to access your photo library.");
        }
    };
}

export default new UserPermissions();