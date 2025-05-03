import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
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

// ✅ Move boostings outside the component so it's not redefined on every render
const boostings = [
  {
    id: "boost1",
    title: "Ad: 50% Off All Items!",
    image:
      "https://images.unsplash.com/photo-1726137569854-ce11cc10cf67?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Don't miss out on this amazing deal. Limited time only!",
  },
  {
    id: "boost2",
    title: "Boosted Product: Organic Cream",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2563&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3DD",
    description: "100% natural, hand-crafted beauty cream now available!",
  },
];

export default function FeedScreen() {
  const [activeTab, setActiveTab] = useState("Feed");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // ✅ Prefetch boosting images once
  useEffect(() => {
    boostings.forEach((boost) => {
      Image.prefetch(boost.image);
    });
  }, []);

  useEffect(() => {
    if (activeTab !== "Feed") return;

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
  }, [activeTab]);

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

  const renderBoosting = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.reviewImage} />
      <Text style={styles.name}>{item.title}</Text>
      <Text style={styles.reviewText}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header4 searchText={searchText} setSearchText={setSearchText} />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Feed", "Boostings"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "Feed" ? (
        loading ? (
          <ActivityIndicator size="large" color="#E71D69" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContainer}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <FlatList
          data={boostings}
          renderItem={renderBoosting}
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
    backgroundColor: "#FAFAFA", // Lighter background
  },
  feedContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: "#CDE4D6", // Soft green pastel
  },
  tabText: {
    fontSize: 16,
    color: "#888",
  },
  activeTabText: {
    color: "#234B38",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  reviewText: {
    fontSize: 15,
    color: "#555",
    marginVertical: 12,
    lineHeight: 22,
  },
  reviewImage: {
    width: width - 64,
    height: 200,
    borderRadius: 16,
    resizeMode: "cover",
    marginVertical: 12,
    alignSelf: "center",
  },
  reactions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  likeText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
  },
});