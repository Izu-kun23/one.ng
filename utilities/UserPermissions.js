import * as ImagePicker from "expo-image-picker";

class UserPermissions {
  getCameraPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };
}

export default new UserPermissions();