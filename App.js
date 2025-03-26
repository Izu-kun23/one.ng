import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoadingScreen from './screens/LoadingScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NotificationScreen from './screens/NotificationScreen';
import VendorDetail from './screens/VendorDetail';  // Assuming VendorDetail is in the screens folder

import MessageScreen from './screens/MessageScreen';
import PostScreen from './screens/PostScreen';
import ProfileScreen from './screens/ProfileScreen';
import FeedScreen from './screens/FeedScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 🔹 Custom Post Button (Floating Action Button)
const CustomPostButton = ({ onPress }) => (
  <TouchableOpacity
    style={{
      top: -10,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#386F4F',
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
        backgroundColor: '#386F4F',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons name="add-outline" size={32} color="white" />
    </View>
  </TouchableOpacity>
);

// 🔹 Bottom Tab Navigator
function BottomTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Messages') {
            iconName = 'chatbubble-outline';
          } else if (route.name === 'Feed') {
            iconName = 'earth-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#386F4F',
        tabBarInactiveTintColor: '#565B56',
        headerShown: false,
      })}
     >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Messages" component={MessageScreen} />

      {/* Custom Floating Post Button */}
      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={{
          tabBarButton: (props) => (
            <CustomPostButton {...props} onPress={() => navigation.navigate('PostModal')} />
          ),
        }}
      />

      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// App Stack (Includes BottomTabs & Post Modal)
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="PostModal"
        component={PostScreen}
        options={{
          presentation: 'modal', // Opens as a modal in iOS style
          headerShown: true,
          title: 'Create Post',
        }}
      />
      <Stack.Screen
        name="VendorDetail"
        component={VendorDetail}
        options={{
          title: 'Vendor Detail',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Authentication Stack
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
    
  );
}

// 🔹 Root Navigator (Handles Loading, Auth, and App Stacks)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="App" component={AppStack} options={{ headerShown: false }} />
        <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}