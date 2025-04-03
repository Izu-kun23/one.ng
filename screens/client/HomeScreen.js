import React, { useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Temporary Vendor Data
const vendors = [
    { id: "1", name: "Joe's Coffee", category: "Coffee", description: "The best coffee in town!", location: "123 Main St, NY", image: require("../../assets/tempImage1.jpg") },
    { id: "2", name: "Fresh Bites", category: "Food", description: "Organic and healthy meals!", location: "456 Oak St, LA", image: require("../../assets/tempImage2.jpg") },
    { id: "3", name: "Tech Haven", category: "Gadgets", description: "Gadgets and accessories.", location: "789 Silicon Ave, SF", image: require("../../assets/tempImage3.jpg") },
];

// Categories
const categories = ["All", "Food", "Clothing", "Coffee", "Tech"];

export default function HomeScreen() {
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [filteredVendors, setFilteredVendors] = useState(vendors);
    const navigation = useNavigation();

    // Handle Search
    const handleSearch = (text) => {
        setSearchText(text);
        filterVendors(text, selectedCategory);
    };

    // Handle Category Selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        filterVendors(searchText, category);
    };

    // Filter Vendors based on Search and Category
    const filterVendors = (text, category) => {
        let updatedVendors = vendors;
        if (category !== "All") {
            updatedVendors = updatedVendors.filter(vendor => vendor.category === category);
        }
        if (text.trim() !== "") {
            updatedVendors = updatedVendors.filter(vendor => vendor.name.toLowerCase().includes(text.toLowerCase()));
        }
        setFilteredVendors(updatedVendors);
    };

    return (
        <View style={styles.container}>
            {/* Header with Search Bar */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discover</Text>
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Vendors..."
                        value={searchText}
                        onChangeText={handleSearch}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <Ionicons name="close-circle-outline" size={20} color="#999" style={styles.clearIcon} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity>
                        <Ionicons name="location-outline" size={22} color="#333" style={styles.locationIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                {categories.map((category, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.categoryBox,
                            selectedCategory === category && styles.categoryBoxSelected,
                        ]}
                        onPress={() => handleCategorySelect(category)}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === category && styles.categoryTextSelected,
                        ]}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Vendor Feed */}
            <FlatList
                data={filteredVendors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.vendorCard} onPress={() => navigation.navigate("VendorDetail", { vendor: item })}>
                        <Image source={item.image} style={styles.vendorImage} />
                        <View style={styles.vendorInfo}>
                            <Text style={styles.vendorName}>{item.name}</Text>
                            <Text style={styles.vendorDescription}>{item.description}</Text>
                            <View style={styles.locationContainer}>
                                <Ionicons name="location-outline" size={18} color="#888" />
                                <Text style={styles.vendorLocation}>{item.location}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        paddingTop: 64,
        paddingBottom: 20,
        backgroundColor: "#386F4F",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#EBECF4",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFF",
    },
    searchContainer: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginTop: 10,
        width: "90%",
        alignItems: "center",
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    clearIcon: {
        marginLeft: 8,
    },
    locationIcon: {
        marginLeft: 8,
    },
    categoryContainer: {
        flexDirection: "row",
        alignContent: "center",
        paddingVertical: 7,
        paddingHorizontal: 16,
        paddingBottom: 40,


    },
    categoryBox: {
        backgroundColor: "#FFF",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 2,
        borderColor: "#D8D9DB",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 70,  // Ensures a consistent width
        height: 40,     // Keeps the height the same for all categories
        position: "relative",
    },
    
    categoryBoxSelected: {
        backgroundColor: "#386F4F",
        borderColor: "#386F4F",
    },
    categoryText: {
        fontSize: 13,
        color: "#333",
        textAlign: "center",
    },
    
    categoryTextSelected: {
        color: "#FFF",
        fontWeight: "bold",
    },
    vendorCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 10, // Increased margin for more space between vendor items
        overflow: "hidden",
        elevation: 3,
        justifyContent: "space-between",
    },
    vendorImage: {
        width: "100%",
        height: 200,
    },
    vendorInfo: {
        padding: 15,
    },
    vendorName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    vendorDescription: {
        fontSize: 14,
        color: "#666",
        marginVertical: 5,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    vendorLocation: {
        fontSize: 14,
        color: "#888",
        marginLeft: 5,
    },
});

