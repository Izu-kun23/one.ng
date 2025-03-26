import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function VendorDetail({ route }) {
    const { vendor } = route.params; // Get the vendor data passed from HomeScreen
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* 🔹 Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{vendor.name}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Vendor Image */}
                <Image source={vendor.image} style={styles.vendorImage} resizeMode="cover" />

                {/* Vendor Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.vendorCategory}>{vendor.category}</Text>
                    <Text style={styles.vendorDescription}>{vendor.description}</Text>

                    {/* Vendor Location */}
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={18} color="#888" />
                        <Text style={styles.vendorLocation}>{vendor.location}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Contact Vendor</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    /* 🔹 Custom Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#386F4F",
        height: 100,
        paddingHorizontal: 15,
        paddingTop: 30,
    },
    backButton: {
        padding: 10,
    },
    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1, // Allow proper spacing for long names
        paddingVertical: 25,
        paddingRight: 35,
    },
    vendorImage: {
        width: '100%',
        height: 400, // Full Image Display
        resizeMode: 'cover',
    },
    infoContainer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        marginTop: -10,
    },
    vendorCategory: {
        fontSize: 18,
        color: "#555",
        marginVertical: 5,
    },
    vendorDescription: {
        fontSize: 16,
        color: "#666",
        marginVertical: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    vendorLocation: {
        fontSize: 16,
        color: "#888",
        marginLeft: 5,
    },
    actionsContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    actionButton: {
        backgroundColor: "#386F4F",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: 'bold',
    },
});