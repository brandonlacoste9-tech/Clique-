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
  Image,
} from "react-native";
import { useMessagesStore } from "../store/cliqueStore";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../theme/cliqueTheme";
import TypingIndicator from "../components/TypingIndicator";
import { messagesAPI } from "../api/cliqueApi";

export default function ChatDetailScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const { messages, addMessage } = useMessagesStore();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(null);
  const flatListRef = useRef();
  const typingTimeoutRef = useRef();

  const userMessages = messages[userId] || [];

  useEffect(() => {
    const checkTyping = async () => {
      try {
        const response = await messagesAPI.getTypingStatus(userId);
        setTypingUser(response.data.typingUserId);
      } catch (err) {
        console.error('Failed to check typing status:', err);
      }
    };

    const interval = setInterval(checkTyping, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleTextInput = (text) => {
    setInputText(text);
    
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      messagesAPI.startTyping(userId, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        messagesAPI.startTyping(userId, false);
      }, 3000);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      messagesAPI.startTyping(userId, false);
    }
  };

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
    setIsTyping(false);
    messagesAPI.startTyping(userId, false);
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
    
    if (item.type === 'image' && item.mediaUrl) {
      return (
        <View
          style={[
            styles.messageWrapper,
            isMe ? styles.myMessageWrapper : styles.theirMessageWrapper,
          ]}
        >
          <TouchableOpacity 
            onPress={() => setShowImagePreview(item.mediaUrl)}
            style={[
              styles.imageBubble,
              isMe ? styles.myImageBubble : styles.theirImageBubble,
            ]}
          >
            <Image 
              source={{ uri: item.mediaUrl }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

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
          {item.timestamp && (
            <Text style={styles.messageTime}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with LV-style gold trim */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{userName.toUpperCase()}</Text>
          <Text style={styles.headerSubtitle}>En ligne</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={userMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing indicator */}
      {typingUser && (
        <TypingIndicator 
          userId={typingUser} 
          isActive={true}
        />
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity 
            style={styles.imagePreviewClose}
            onPress={() => setShowImagePreview(null)}
          >
            <Text style={styles.imagePreviewCloseText}>×</Text>
          </TouchableOpacity>
          <Image 
            source={{ uri: showImagePreview }} 
            style={styles.imagePreview}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Input with leather texture */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Text style={styles.attachButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Écrire un message..."
            placeholderTextColor={colors.text.muted}
            value={inputText}
            onChangeText={handleTextInput}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
          >
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
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold.DEFAULT,
    backgroundColor: colors.background,
  },
  backButtonText: {
    color: colors.gold.DEFAULT,
    fontSize: 28,
    fontWeight: "300",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.base,
    fontWeight: "900",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    color: colors.accent.green,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  messageList: {
    padding: spacing.lg,
    flex: 1,
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
    position: "relative",
  },
  myBubble: {
    backgroundColor: colors.gold.DEFAULT,
    borderBottomRightRadius: 4,
    ...shadows.gold,
  },
  theirBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.sizes.base,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.leather.black,
    fontWeight: "500",
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: "right",
    marginTop: 4,
  },
  imageBubble: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  myImageBubble: {
    ...shadows.gold,
  },
  theirImageBubble: {
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  messageImage: {
    width: 200,
    height: 150,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 8,
  },
  imageOverlayText: {
    fontSize: 16,
  },
  systemMessageContainer: {
    marginVertical: spacing.xl,
    alignItems: "center",
  },
  systemMessage: {
    padding: spacing.lg,
    backgroundColor: "rgba(197, 160, 89, 0.1)",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    width: "100%",
    ...shadows.gold,
  },
  systemMessageText: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.sm,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    padding: spacing.lg,
    backgroundColor: colors.leather.black,
    borderTopWidth: 1,
    borderTopColor: colors.gold.DEFAULT,
    alignItems: "center",
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  attachButtonText: {
    color: colors.gold.DEFAULT,
    fontSize: 20,
    fontWeight: "300",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.gold,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.gold.DEFAULT,
  },
  sendButtonText: {
    color: colors.leather.black,
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 12,
  },
  imagePreviewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.leather.black,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreviewClose: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 101,
  },
  imagePreviewCloseText: {
    color: colors.gold.DEFAULT,
    fontSize: 28,
    fontWeight: "300",
  },
  imagePreview: {
    width: "100%",
    height: "80%",
  },
});
