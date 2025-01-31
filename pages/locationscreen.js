import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";

const LocationScreen = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      // Request for foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        // Get the current location
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation(locationData);

        // Reverse geocode the location to get address
        const geocode = await Location.reverseGeocodeAsync(locationData.coords);
        if (geocode.length > 0) {
          const formattedAddress = `${geocode[0].name}, ${geocode[0].city}, ${geocode[0].region}, ${geocode[0].country}`;
          setAddress(formattedAddress);
        }
      } else {
        setErrorMsg("Permission to access location was denied");
      }
    };

    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : location ? (
        <View>
          <Text>
            Latitude: {location.coords.latitude} {"\n"}
            Longitude: {location.coords.longitude} {"\n"}
            Address: {address || "Fetching address..."}
          </Text>
        </View>
      ) : (
        <Text>Loading location...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default LocationScreen;
