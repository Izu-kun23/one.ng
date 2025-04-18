import React from "react";
import { View, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer"; // Import Drawer Navigator
import { Ionicons } from "@expo/vector-icons";

import LoadingScreen from "./screens/client/LoadingScreen";
import OptionsScreen from "./OptionScreen.js"; // Import OptionsScreen
import HomeScreen from "./screens/client/HomeScreen";
import LoginScreen from "./screens/client/LoginScreen";
import RegisterScreen from "./screens/client/RegisterScreen";
import VendorLogin from "./screens/vendor/VendorLogin";
import VendorRegister from "./screens/vendor/VendorRegister";
import VendorHome from "./screens/vendor/VendorHome";
import VendorShop from "./screens/vendor/VendorShop.js";
import VendorDetail from "./screens/client/VendorDetail";
import EditProfileScreen from "./screens/client/EditProfileScreen";
import MessageScreen from "./screens/client/MessageScreen";
import PostScreen from "./screens/client/PostScreen";
import SettingsScreen from "./screens/client/SettingsScreen";
import FeedScreen from "./screens/client/FeedScreen";
import AddShop from "./screens/vendor/AddShop.js";
import ArchivedShops from "./screens/vendor/ArchivedShops.js";
import ShopDetail from "./screens/vendor/ShopDetail.js";
import VendorProfile from "./screens/vendor/VendorProfile.js";
import VendorLocation from "./screens/vendor/VendorLocation.js";
import VendorProducts from "./screens/vendor/VendorProducts.js";
import ProductModal from "./screens/vendor/ProductModal.js";
import AddProducts from "./screens/vendor/AddProducts.js";
import VendorEditProfile from "./screens/vendor/VendorEditProfile.js";
import FavoriteScreen from "./screens/client/FavoriteScreen.js";

// Navigation Setup
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator(); // Create Drawer Navigator

// Vendor Drawer (Wrap only the VendorHome screen in Drawer)
function VendorDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false, // Hide default header
        drawerStyle: {
          backgroundColor: "#fff", // Dark background
          width: 250, // Adjust width
          iconcolor: "#000", // Icon color
        },
        drawerLabelStyle: {
          color: "black", // Light text color
          fontSize: 16,
        },
        drawerActiveTintColor: "#386F4F", // Highlighted item color
        drawerInactiveTintColor: "#ECF0F1",
      }}
    >
      {/* ✅ Remove the incorrect semicolon here */}
      <Drawer.Screen
        name="Dashboard"
        component={VendorHome}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Shop"
        component={VendorShop}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="pricetag" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={VendorProfile}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// 🔹 Custom Post Button (Floating Action Button)
const CustomPostButton = ({ onPress }) => (
  <TouchableOpacity
    style={{
      top: -10,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#386F4F",
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 10,
      shadowOpacity: 0.3,
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#386F4F",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="add-outline" size={32} color="white" />
    </View>
  </TouchableOpacity>
);

// 🔹 Bottom Tab Navigator
function BottomTabs({ navigation }) {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") iconName = "home-outline";
            else if (route.name === "Favorites") iconName = "heart-outline";
            else if (route.name === "Feed") iconName = "earth-outline";
            else if (route.name === "Settings") iconName = "settings-outline";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#386F4F",
          tabBarInactiveTintColor: "#565B56",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Favorites" component={FavoriteScreen} />
        <Tab.Screen
          name="Post"
          options={{
            tabBarButton: (props) => (
              <CustomPostButton
                {...props}
                onPress={() => navigation.navigate("PostModal")}
              />
            ),
          }}
        >
          {() => null}
        </Tab.Screen>
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </>
  );
}

// 🔹 App Stack (Includes BottomTabs & Post Modal)
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PostModal"
        component={PostScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Create Post",
        }}
      />
      <Stack.Screen
        name="VendorDetail"
        component={VendorDetail}
        options={{
          title: "Vendor Detail",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// 🔹 Authentication Stack
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VendorLogin"
        component={VendorLogin}
        options={{
          headerShown: false,
          title: "Vendor Login",
        }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Vendor Stack (For Vendor Login)
function VendorStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VendorLogin"
        component={VendorLogin}
        options={{
          headerShown: false,
          title: "Vendor Login",
        }}
      />
      <Stack.Screen
        name="VendorRegister"
        component={VendorRegister}
        options={{
          headerShown: false,
          title: "Vendor Register",
        }}
      />
      <Stack.Screen
        name="VendorHome"
        component={VendorDrawer} // Wrap VendorHome in Drawer
        options={{
          headerShown: false, // Disable default header for VendorHome
        }}
      />
      <Stack.Screen
        name="AddShop"
        component={AddShop} // Wrap VendorHome in Drawer
        options={{
          headerShown: false, // Disable default header for VendorHome
        }}
      />
      <Stack.Screen
        name="AddProducts"
        component={AddProducts}
        options={{
          headerShown: false, // optional, depending on your modal design
        }}
      />
      <Stack.Screen
        name="ArchivedShops"
        component={ArchivedShops} // Wrap VendorHome in Drawer
        options={{
          headerShown: false, // Disable default header for VendorHome
        }}
      />
      <Stack.Screen
        name="ShopDetail"
        component={ShopDetail} // Wrap VendorHome in Drawer
        options={{
          headerShown: false, // Disable default header for VendorHome
        }}
      />
      <Stack.Screen
        name="VendorLocation"
        component={VendorLocation} // Wrap VendorHome in Drawer
        options={{
          headerShown: false, // Disable default header for VendorHome
        }}
      />
      <Stack.Screen
        name="VendorProducts"
        component={VendorProducts} // Wrap VendorHome in Drawer
        options={{
          headerShown: false, // Disable default header for VendorHome
        }}
      />
      <Stack.Screen
        name="ProductModal"
        component={ProductModal}
        options={{
          presentation: "modal",
          headerShown: false, // optional, depending on your modal design
        }}
      />
      <Stack.Screen
        name="VendorEditProfile"
        component={VendorEditProfile}
        options={{
          presentation: "modal",
          headerShown: false, // optional, depending on your modal design
        }}
      />

    </Stack.Navigator>
  );
}

// 🔹 Root Navigator (Handles Loading, Options, Auth, and App Stacks)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Options"
          component={OptionsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="App"
          component={AppStack}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Vendor"
          component={VendorStack}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
