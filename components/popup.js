import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    left: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#acacac",
    borderRadius: 5,
    marginBottom: 20,
    color: "black",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const Popup = ({ title, placeholders = [""], buttonText, onClose }) => {
  const [inputs, setInputs] = useState(placeholders.map(() => ""));

  const handleInputChange = (text, index) => {
    const newInputs = [...inputs];
    newInputs[index] = text;
    setInputs(newInputs);
  };

  const handleClose = () => {
    onClose(null); // Close without data
  };

  const handleSubmit = () => {
    onClose(inputs); // Pass array of inputs back to parent
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="close" style={{ fontSize: 24, color: "black" }} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>
      {inputs.map((input, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={placeholders[index] || `Input ${index + 1}`}
          placeholderTextColor="#888"
          value={input}
          onChangeText={(text) => handleInputChange(text, index)}
          secureTextEntry={placeholders[index]
            ?.toLowerCase()
            .includes("password")}
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Popup;
