import {
  ref,
  get,
  set,
  push,
  child,
  runTransaction,
  onValue,
} from "firebase/database";
import { getDownloadURL, ref as sRef, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "./firebaseConfig";
import { parseISO, differenceInMinutes } from "date-fns";

export const uploadImageToLobby = async (imageUri, lobbyId, captionUser) => {
  if (!imageUri || !lobbyId) {
    console.error("Image URI and Lobby ID are required.");
    return null;
  }

  try {
    // Generate a unique image name (use Date.now() or a UUID)
    const imageName = `image_${Date.now()}.jpg`;

    // Reference to the storage path where the image will be uploaded
    const storageRef = sRef(storage, `lobbies/${lobbyId}/${imageName}`);

    // Fetch the image as a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload the image to Firebase Storage
    await uploadBytes(storageRef, blob);

    // Get the download URL for the uploaded image
    const downloadURL = await getDownloadURL(storageRef);

    // Update the Realtime Database with the image details
    const imageRef = push(ref(db, `lobbies/${lobbyId}/images`));
    await set(imageRef, {
      imageName,
      imageUrl: downloadURL,
      uploadedAt: new Date().toISOString(),
      caption: captionUser,
    });

    console.log("Image uploaded successfully:", { imageName, downloadURL });

    return { imageUrl: downloadURL, imageName };
  } catch (error) {
    console.error("Error uploading image:", error.message);
    return null;
  }
};

// Fetch lobby details and user details
export const fetchLobbyDetails = async (lobbyId) => {
  try {
    const lobbyRef = ref(db, `lobbies/${lobbyId}`);
    const lobbySnapshot = await get(lobbyRef);

    if (lobbySnapshot.exists()) {
      const lobbyData = lobbySnapshot.val();

      if (lobbyData.users) {
        const userDetails = await fetchUserDetails(
          lobbyData.users,
          lobbyData.images
        );
        return { lobbyData, userDetails };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching lobby details:", error.message);
    return null;
  }
};

// Fetch user details from Firebase
export const fetchUserDetails = async (userIds, tags = []) => {
  try {
    const calculateTaggerDurationInMinutes = (startTagger, endTagger) => {
      // Parse the start time (uploadedAt) and end time
      const startTime = parseISO(startTagger);

      // If there is no endTagger, use the current time
      const endTime = endTagger ? parseISO(endTagger) : new Date(); // Current time if no endTagger

      // Calculate the difference in minutes
      const durationInMinutes = differenceInMinutes(endTime, startTime);

      return durationInMinutes;
    };

    const userDetailsPromises = userIds.map(async (uid, index) => {
      const userRef = ref(db, `users/${uid}`);
      const userSnapshot = await get(userRef);

      const startTagger = Object.values(tags)
        .filter((tag) => tag.caption.includes("tagged {" + uid))
        .map((time) => time.uploadedAt);
      const endTagger = Object.values(tags)
        .filter((tag) => tag.caption.includes(uid + "} tagged"))
        .map((time) => time.uploadedAt);

      let totalTaggerTime = 0; // To accumulate total time the user has been tagger

      // Calculate total time for all "startTagger" events
      for (let i = 0; i < startTagger.length; i++) {
        const start = startTagger[i];
        const end = endTagger[i] || null; // If no end, set it as null
        const duration = calculateTaggerDurationInMinutes(start, end);
        totalTaggerTime += duration; // Accumulate the time
      }

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        return {
          username: userData.username,
          uid,
          ranking: index + 1,
          totalTaggerTime,
        };
      } else {
        return {
          username: "Unknown User",
          uid,
          ranking: index + 1,
          totalTaggerTime,
        };
      }
    });

    return await Promise.all(userDetailsPromises);
  } catch (error) {
    console.error("Error fetching user details:", error.message);
    return [];
  }
};

export const isTagger = async (lobbyId, userId) => {
  try {
    // 1. Get the lobby data
    const lobbyRef = ref(db, `lobbies/${lobbyId}`);
    const lobbySnapshot = await get(lobbyRef);

    if (!lobbySnapshot.exists()) {
      console.warn(`Lobby with ID ${lobbyId} does not exist.`);
      return false;
    }

    const lobbyData = lobbySnapshot.val();
    const images = lobbyData.images || {}; // Default to an empty object if no images

    // 2. Extract start and end tag times for the given user
    const startTaggerTimes = Object.values(images)
      .filter((tag) => tag.caption.includes(`tagged {${userId}`))
      .map((time) => time.uploadedAt);

    const endTaggerTimes = Object.values(images)
      .filter((tag) => tag.caption.includes(`${userId}} tagged`))
      .map((time) => time.uploadedAt);

    if (startTaggerTimes.length === 0) {
      // No start times found for this user, so they aren't the tagger
      //console.log(`No tag events found for user ${userId} in lobby ${lobbyId}`);
      return false;
    }

    // 3. Check if there is any start time that doesn't have a corresponding end time
    const isCurrentlyTagger = startTaggerTimes.some((startTime, index) => {
      const endTime = endTaggerTimes[index];
      // If there is no end time for a specific start time, they are still the tagger
      if (!endTime) return true;

      // Parse the times to ensure they are date objects
      const parsedStartTime = parseISO(startTime);
      const parsedEndTime = parseISO(endTime);

      // If the start time is later than the end time, they are still the tagger
      return parsedStartTime > parsedEndTime;
    });

    // console.log(
    //   `User ${userId} is ${
    //     isCurrentlyTagger ? "" : "not "
    //   }the current tagger in lobby ${lobbyId}`
    // );
    return isCurrentlyTagger;
  } catch (error) {
    console.error("Error checking if user is tagger:", error.message);
    return false;
  }
};

// Fetch images and captions for a specific lobby
export const fetchImagesWithCaptions = async (imagesData, userDetailsLocal) => {
  try {
    // Assuming `imagesData` is already passed as the `lobbyData.images` object
    const images = Object.keys(imagesData).map((imageKey) => {
      const image = imagesData[imageKey];

      // Find the associated caption and user information
      const caption = image.caption.replace(/{(.*?)}/g, (match, uuid) => {
        const user = userDetailsLocal.find((user) => user.uid === uuid);
        return user ? user.username : match;
      });

      return {
        caption,
        imageUrl: image.imageUrl || null, // Ensure the imageUrl is correctly set
        uploadedAt: new Date(image.uploadedAt), // Convert the upload time to a Date object
        imageName: image.imageName,
      };
    });

    // Sort images by upload date (newest to oldest)
    return images.sort((a, b) => b.uploadedAt - a.uploadedAt); // Sorting by upload date
  } catch (error) {
    console.error("Error fetching images with captions:", error.message);
    return [];
  }
};

// Fetch games the current user is in
export const fetchGames = (setGames) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("User is not authenticated.");
    return;
  }

  const lobbiesRef = ref(db, "lobbies");

  onValue(lobbiesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const filteredGames = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .filter((lobby) => lobby.users && lobby.users.includes(user.uid));
      setGames(filteredGames);
    }
  });
};

// Create a new lobby
export const createLobby = async (additionalData = {}) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("User is not authenticated.");
    return;
  }

  try {
    const lobbyRef = push(ref(db, "lobbies"));
    const lobbyData = { users: [user.uid], ...additionalData };
    await set(lobbyRef, lobbyData);
    return lobbyRef.key; // Return the lobby ID
  } catch (error) {
    console.error("Error creating lobby:", error.message);
  }
};

// Join an existing lobby
export const joinLobby = async (lobbyId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    const lobbyUsersRef = child(ref(db, `lobbies/${lobbyId}`), "users");

    await runTransaction(lobbyUsersRef, (currentUsers) => {
      if (Array.isArray(currentUsers)) {
        if (!currentUsers.includes(user.uid)) {
          return [...currentUsers, user.uid];
        }
        return currentUsers;
      }
      return [user.uid];
    });
  } catch (error) {
    console.error("Error joining the lobby:", error.message);
  }
};

// Sign out the current user
export const handleSignOut = async (navigation) => {
  try {
    await auth.signOut();
    navigation.navigate("Login");
  } catch (err) {
    console.error("Error signing out:", err.message);
  }
};

// Update username in Firebase
export const updateUsername = async (newUsername) => {
  const user = auth.currentUser;
  if (user) {
    try {
      await set(ref(db, `users/${user.uid}`), { username: newUsername });
      console.log("Username updated successfully");
    } catch (error) {
      console.error("Error updating username:", error.message);
    }
  }
};

// Update email for the user
export const updateUserEmail = async (data) => {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(data[0], data[2]); // Current email, new email, password

  try {
    await reauthenticateWithCredential(user, credential);
    await updateEmail(user, data[1]);
    console.log("Email updated successfully");
  } catch (error) {
    console.error("Error updating email:", error.message);
  }
};
