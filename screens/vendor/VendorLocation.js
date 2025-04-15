import React from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Header from "../../components/Header3";

const { height } = Dimensions.get("window");

const SimpleMap = ({ route, navigation }) => {
  const { coordinates, location } = route.params;

  return (
    <View style={styles.container}>
      <Header title="Map View" navigation={navigation} />

      <MapView
        style={styles.map}
        initialRegion={{
          ...coordinates,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={coordinates} title={location} />
      </MapView>
    </View>
  );
};

export default SimpleMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  map: {
    flex: 1,
  },
});