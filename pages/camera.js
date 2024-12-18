import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Importing an icon for the flip button
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Correct import
import Navbar from "../components/navbar";
import * as FileSystem from "expo-file-system";
import DropDownPicker from "react-native-dropdown-picker";
import {
  fetchGames,
  fetchUserDetails,
  uploadImageToLobby,
  isTagger,
} from "../utils/firebaseFunctions";
import { auth } from "../utils/firebaseConfig";

const CameraScreen = ({ navigation }) => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);

  const [caption, setCaption] = useState("");
  const [captionOpen, setCaptionOpen] = useState(false);
  const [predefinedCaptions, setPredefinedCaptions] = useState([]);

  const [lobbiesData, setLobbiesData] = useState([]);
  const [availableLobbies, setAvailableLobbies] = useState([]);
  const [lobby, setLobby] = useState("");
  const [lobbyOpen, setLobbyOpen] = useState(false);

  const [loading, setLoading] = useState(false); // New state to track loading

  const cameraRef = useRef(null);

  // Fetch the current user's lobbies when entering the page
  useEffect(() => {
    const loadLobbies = async () => {
      await fetchGames(setLobbiesData); // Assuming this fetches the games for the current user
    };
    loadLobbies();
  }, []);

  useEffect(() => {
    const filterLobbiesWhereUserIsTagger = async () => {
      try {
        const filteredLobbies = await Promise.all(
          lobbiesData.map(async (lobby) => {
            const isUserTagger = await isTagger(lobby.id, auth.currentUser.uid); // Assuming you have access to the current user's ID
            if (isUserTagger) {
              return {
                label: lobby.lobbyName,
                value: lobby.id, // Assuming lobby.id is unique for each lobby
              };
            }
            return null; // Return null for lobbies where the user is not the tagger
          })
        );

        // Filter out null values (where user is not the tagger)
        const lobbies = filteredLobbies.filter((lobby) => lobby !== null);
        setAvailableLobbies(lobbies);
      } catch (error) {
        console.error("Error filtering lobbies where user is tagger:", error);
      }
    };

    if (lobbiesData.length > 0) {
      filterLobbiesWhereUserIsTagger();
    }
  }, [lobbiesData]); // Include userId as a dependency if it can change

  useEffect(() => {
    const fetchUsersForLobby = async () => {
      let usersFound = false; // Flag to check if users are found
      let users = [];

      // Loop through lobbiesData to find the selected lobby by its id
      for (let i = 0; i < lobbiesData.length; i++) {
        if (lobbiesData[i].id === lobby) {
          // If the lobby is found, get the users' IDs from that lobby
          const userIds = lobbiesData[i].users;
          usersFound = true;

          // Fetch the usernames using fetchUserDetails
          const userDetails = await fetchUserDetails(userIds);

          // Filter out the current user's UID and map the fetched user details
          const filteredUsers = userDetails.filter(
            (user) => user.uid !== auth.currentUser.uid
          );

          // Map the filtered user details to the format needed for the dropdown
          users = filteredUsers.map((user) => ({
            label: user.username, // Display username in the dropdown
            value: user.uid, // Use user ID as value
          }));

          break; // Exit the loop once the lobby is found
        }
      }

      if (!usersFound) {
        //console.log("No users found for the selected lobby"); // Log message if no users found
      } else {
        setPredefinedCaptions(users); // Update the dropdown with user details
      }
    };

    fetchUsersForLobby();
  }, [lobbiesData, lobby]);

  function handleUpload() {
    //generate the caption string
    const captionString =
      "{" + auth.currentUser.uid + "} tagged {" + caption + "}";

    setLoading(true); // Set loading to true before uploading
    uploadImageToLobby(photoUri, lobby, captionString)
      .then(() => {
        setLoading(false); // Set loading to false after upload is complete
        setPhotoUri(null); // Clear the photo URI after the upload
        setCaption("");
        setCaptionOpen(false);
        setPredefinedCaptions([]);

        setLobbiesData([]);
        setAvailableLobbies([]);
        setLobby("");
        setLobbyOpen(false);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        setLoading(false); // Stop loading on error
      });
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.7, base64: true, exif: true };
        const photo = await cameraRef.current.takePictureAsync(options);
        console.log("Picture taken!", photo);

        const newPath = `${FileSystem.documentDirectory}photo.jpg`;
        await FileSystem.copyAsync({ from: photo.uri, to: newPath });
        console.log("Photo saved at: ", newPath);

        setPhotoUri(newPath); // Store photo URI for preview
      } catch (error) {
        console.error("Failed to take picture: ", error);
      }
    }
  }

  return (
    <View style={styles.container}>
      {!photoUri ? (
        // Camera view (centered when taking a picture)
        <View style={styles.cameraSection}>
          <Text style={styles.cameraTitle}>Take a Picture</Text>
          <View style={styles.cameraWrapper}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <MaterialIcons name="flip-camera-ios" size={24} color="white" />
              </TouchableOpacity>
            </CameraView>
          </View>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.captureButtonText}>Tag Them!</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Popup view when photo is taken (no longer centered)
        <SafeAreaView style={styles.popupContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setPhotoUri(null)} // Close the popup and go back to camera
          >
            <Icon name="close" style={styles.closeButtonText}></Icon>
          </TouchableOpacity>

          <Text style={styles.popupTitle}>You Have Tagged Someone!</Text>

          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          )}

          <DropDownPicker
            open={lobbyOpen}
            setOpen={setLobbyOpen}
            value={lobby}
            setValue={setLobby}
            items={availableLobbies}
            setItems={setAvailableLobbies}
            placeholder="Select Lobby"
            ListEmptyComponent={() => (
              <View style={{ padding: 10, alignItems: "center" }}>
                <Text>No lobbies where you are the tagger.</Text>
              </View>
            )}
            containerStyle={styles.dropdownContainer}
            style={styles.dropdownStyle}
            dropDownStyle={styles.dropdownDropdownStyle}
            labelStyle={styles.dropdownLabelStyle}
            disabled={loading} // Disable dropdown when uploading
          />
          <DropDownPicker
            maxHeight={80}
            zIndex={3000}
            open={captionOpen}
            value={caption}
            setOpen={setCaptionOpen}
            setItems={setPredefinedCaptions}
            items={predefinedCaptions}
            setValue={setCaption}
            placeholder="Select Tagged Player"
            ListEmptyComponent={() => (
              <View style={{ padding: 10, alignItems: "center" }}>
                <Text>No other users in the lobby.</Text>
              </View>
            )}
            containerStyle={styles.dropdownContainer}
            style={styles.dropdownStyle}
            dropDownStyle={styles.dropdownDropdownStyle}
            labelStyle={styles.dropdownLabelStyle}
            disabled={loading || lobby === ""} // Disable dropdown when uploading or if no lobby is selected
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => handleUpload()}
            disabled={loading} // Disable button when uploading
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Uploading...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Upload</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <View style={styles.navbar}>
        <Navbar navigation={navigation} activeTab={"Camera"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  cameraSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  cameraTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  cameraWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#787878",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  camera: {
    flex: 1,
  },
  flipButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 20,
  },
  captureButton: {
    marginTop: 20,
    width: "80%",
    height: 80,
    borderRadius: 10,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  captureButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  navbar: {
    height: 70,
    flexShrink: 0,
  },
  popupContainer: {
    flex: 1,
    margin: 30,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
    marginBottom: 20,
  },
  previewImage: {
    width: "100%",
    height: 400,
    borderRadius: 10,
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    top: -20,
    left: -15,
    padding: 15,
  },
  closeButtonText: {
    color: "#000",
    fontSize: 30,
  },
  dropdownContainer: {
    width: "100%",
    marginBottom: 20,
  },
  dropdownStyle: {
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#000000",
  },
  dropdownDropdownStyle: {
    backgroundColor: "#FFF",
  },
  dropdownLabelStyle: {
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    width: "100%",
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 28,
  },
});

export default CameraScreen;
