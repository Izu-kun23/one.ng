import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Text,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import moment from "moment";
import { app } from "../../firebaseConfig";
import Header4 from "../../components/Header4";

const firestore = getFirestore(app);
const { width } = Dimensions.get("window");

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const q = query(collection(firestore, "posts"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(fetchedPosts);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error fetching posts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.text?.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.timestamp}>{moment(item.timestamp).fromNow()}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
      </View>

      <Text style={styles.reviewText}>{item.text}</Text>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.reviewImage} />
      )}

      <View style={styles.reactions}>
        <Ionicons name="heart-outline" size={20} color="#73788B" />
        <Text style={styles.likeText}>0 Likes</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header4 searchText={searchText} setSearchText={setSearchText} />

      {loading ? (
        <ActivityIndicator size="large" color="#E71D69" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F1",
  },
  feedContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  reviewText: {
    fontSize: 15,
    color: "#444",
    marginVertical: 10,
    lineHeight: 22,
  },
  reviewImage: {
    width: width - 64,
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    marginVertical: 10,
    alignSelf: "center",
  },
  reactions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  likeText: {
    fontSize: 14,
    color: "#73788B",
    marginLeft: 8,
  },
});