import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, collection, query, onSnapshot, orderBy } from "firebase/firestore";
import moment from "moment";
import { app } from "../firebaseConfig"; // Import Firebase config

const firestore = getFirestore(app); // Initialize Firestore

export default function FeedScreen() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const q = query(collection(firestore, "posts"), orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(fetchedPosts);
            setLoading(false);
        }, (error) => {
            console.error("❌ Error fetching posts:", error);
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    // Filter posts based on the search query
    const filteredPosts = posts.filter(post =>
        post.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderPost = ({ item }) => (
        <View style={styles.feedItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
                <View style={styles.postHeader}>
                    <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.timestamp}>{moment(item.timestamp).fromNow()}</Text>
                    </View>
                    <Ionicons name="ellipsis-horizontal-outline" size={24} color="#73788B" />
                </View>
                <Text style={styles.post}>{item.text}</Text>
                {item.image && <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />}
                <View style={styles.likeContainer}>
                    <Ionicons name="heart-outline" size={20} color="#73788B" />
                    <Text style={styles.likeCount}>0</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header with Feed Title and Search Bar */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Feed</Text>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={24} color="#73788B" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Feed Content */}
            {loading ? (
                <ActivityIndicator size="large" color="#E71D69" />
            ) : (
                <FlatList
                    data={filteredPosts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.feedContainer}
                />
            )}
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
        backgroundColor: "#FFF",
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
        backgroundColor: "#F5F5F5",
        borderRadius: 25,
        paddingVertical: 13,
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
    feedContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    feedItem: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#D8D9DB",
        backgroundColor: "#FAFAFA",
        borderRadius: 10,
        marginBottom: 16,
        alignItems: "flex-start", // Ensures proper alignment of text and avatar
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    postHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
    },
    timestamp: {
        fontSize: 12,
        color: "#73788B",
    },
    post: {
        fontSize: 16,
        marginVertical: 8,
        color: "#444",
    },
    postImage: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginVertical: 8,
    },
    likeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    likeCount: {
        marginLeft: 8,
        fontSize: 14,
        color: "#73788B",
    },
});