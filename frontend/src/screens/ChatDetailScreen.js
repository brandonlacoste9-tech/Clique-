import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useMessagesStore } from "../store/cliqueStore";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";

export default function ChatDetailScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const { messages, addMessage } = useMessagesStore();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef();

  const userMessages = messages[userId] || [];

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: "me",
      text: inputText,
      timestamp: new Date().toISOString(),
    };

    addMessage(userId, newMessage);
    setInputText("");
  };

  const renderMessage = ({ item }) => {
    if (item.isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessage}>
            <Text style={styles.systemMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    const isMe = item.sender === "me";
    return (
      <View
        style={[
          styles.messageWrapper,
          isMe ? styles.myMessageWrapper : styles.theirMessageWrapper,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>🠔</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName.toUpperCase()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={userMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrire un message..."
            placeholderTextColor={colors.text.muted}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>ENVOYER</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  headerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.base,
    fontWeight: "900",
    letterSpacing: 2,
  },
  backButton: {
    color: colors.gold.DEFAULT,
    fontSize: 24,
  },
  messageList: {
    padding: spacing.lg,
  },
  messageWrapper: {
    marginBottom: spacing.md,
    maxWidth: "80%",
  },
  myMessageWrapper: {
    alignSelf: "flex-end",
  },
  theirMessageWrapper: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  myBubble: {
    backgroundColor: colors.gold.DEFAULT,
  },
  theirBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  messageText: {
    fontSize: typography.sizes.base,
  },
  myMessageText: {
    color: colors.leather.black,
    fontWeight: "500",
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  systemMessageContainer: {
    marginVertical: spacing.xl,
    alignItems: "center",
  },
  systemMessage: {
    padding: spacing.lg,
    backgroundColor: "rgba(212, 175, 55, 0.15)", // Translucent gold glass
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT, // 1px solid gold
    width: "100%",
    ...shadows.gold,
  },
  systemMessageText: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.sm,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 3, // Wide letter-spacing
    textTransform: "uppercase", // Uppercase
  },
  inputContainer: {
    flexDirection: "row",
    padding: spacing.lg,
    backgroundColor: colors.leather.black,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: 20,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  sendButton: {
    marginLeft: spacing.md,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: colors.gold.DEFAULT,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
