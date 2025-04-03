import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";

export default class MessageScreen extends React.Component {
    state = {
        conversations: [
            {
                id: "1",
                name: "John Doe",
                lastMessage: "Hey, are you free for a meeting?",
                time: "10:30 AM",
                avatar: "https://randomuser.me/api/portraits/men/1.jpg",  // Sample image URL
            },
            {
                id: "2",
                name: "Jane Smith",
                lastMessage: "Let's catch up soon!",
                time: "Yesterday",
                avatar: "https://randomuser.me/api/portraits/women/1.jpg",  // Sample image URL
            },
            {
                id: "3",
                name: "Alice Brown",
                lastMessage: "Can you send me the report?",
                time: "2 days ago",
                avatar: "https://randomuser.me/api/portraits/women/2.jpg",  // Sample image URL
            },
        ],
    };

    openChat = (conversation) => {
        // Navigate to the individual chat screen (You can implement this part later)
        console.log("Open chat with:", conversation);
    };

    renderItem = ({ item }) => (
        <TouchableOpacity style={styles.conversationItem} onPress={() => this.openChat(item)}>
            {/* Avatar */}
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            
            <View style={styles.conversationContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
            
            <Text style={styles.time}>{item.time}</Text>
        </TouchableOpacity>
    );

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Chats</Text>
                <FlatList
                    data={this.state.conversations}
                    renderItem={this.renderItem}
                    keyExtractor={(item) => item.id}
                    style={styles.conversationsList}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E5E5E5",  // WhatsApp-like background color
    },

    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        padding: 30,
        backgroundColor: "#075E54",  // WhatsApp green
        textAlign: "center",
        color: "#FFF",
        paddingTop: 50,
        paddingBottom: 20,
    },

    conversationsList: {
        paddingBottom: 20,
    },

    conversationItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,  // Circle for avatar
        marginRight: 15,
    },
    
    conversationContent: {
        flex: 1,
        paddingRight: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    lastMessage: {
        fontSize: 14,
        color: "#888",
        marginTop: 5,
    },
    time: {
        fontSize: 12,
        color: "#888",
        marginLeft: 10,
    },
});