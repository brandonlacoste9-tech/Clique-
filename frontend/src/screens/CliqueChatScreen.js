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
  ActivityIndicator,
  Image,
} from "react-native";
import { useCliquesStore, useAuthStore } from "../store/cliqueStore";
import { cliquesAPI } from "../api/cliqueApi";
import {
  addMessageHandler,
  sendSocketMessage,
} from "../services/websocketService";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  cliquePhrases,
} from "../theme/cliqueTheme";
import BitmojiSheet from "../components/BitmojiSheet";
import VoiceRecorder from "../components/VoiceRecorder";
import MediaPicker from "../components/MediaPicker";
import MediaGalleryViewer from "../components/MediaGalleryViewer";
import LocationMessage from "../components/LocationMessage";
import MessageReactions from "../components/MessageReactions";
import GroupTypingIndicator from "../components/GroupTypingIndicator";
import { sendLocalNotification } from "../services/pushNotificationService";
import { callService, CALL_TYPES } from "../services/callService";
import CallOverlay from "../components/CallOverlay";

export default function CliqueChatScreen({ route, navigation }) {
  const { cliqueId, cliqueName } = route.params;
  const { cliqueMessages, setCliqueMessages, addCliqueMessage } =
    useCliquesStore();
  const { user } = useAuthStore();

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // userId -> timestamp

  const flatListRef = useRef();
  const messages = cliqueMessages[cliqueId] || [];
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [viewerData, setViewerData] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    loadMessages();

    // Join WebSocket room
    sendSocketMessage("join_clique", { cliqueId });

    const unsubscribe = addMessageHandler((event, data) => {
      if (event === "clique_message" && data.cliqueId === cliqueId) {
        addCliqueMessage(cliqueId, {
          id: data.id,
          senderId: data.sender.userId,
          text: data.text,
          contentType: data.contentType,
          contentKey: data.contentKey,
          sentAt: data.sentAt,
          sender: data.sender,
        });
      }

      if (
        event === "clique_typing" &&
        data.cliqueId === cliqueId &&
        data.userId !== user?.id
      ) {
        if (data.isTyping) {
          setTypingUsers((prev) => ({ ...prev, [data.userId]: Date.now() }));
        } else {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[data.userId];
            return next;
          });
        }
      }
    });

    return () => {
      unsubscribe();
      sendSocketMessage("leave_clique", { cliqueId });
    };
  }, [cliqueId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await cliquesAPI.getMessages(cliqueId);
      const formatted = (res.data.messages || []).map((m) => ({
        id: m.id,
        senderId: m.sender.userId,
        text: m.text,
        contentType: m.contentType,
        contentKey: m.contentKey,
        sentAt: m.sentAt,
        sender: m.sender,
        isMe: m.sender.userId === user?.id,
      }));
      setCliqueMessages(cliqueId, formatted.reverse());
    } catch (err) {
      console.error("Failed to load clique messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = (text) => {
    setInputText(text);
    sendSocketMessage("clique_typing", {
      cliqueId,
      isTyping: text.length > 0,
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    // Stop typing indicator
    sendSocketMessage("clique_typing", { cliqueId, isTyping: false });

    try {
      await cliquesAPI.sendMessage(cliqueId, { text });
      // WebSocket will broadcast back to us, adding it via the handler
    } catch (err) {
      console.error("Failed to send clique message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleReaction = (messageId, emoji) => {
    const currentMsgs = cliqueMessages[cliqueId] || [];
    const updated = currentMsgs.map((m) => {
      if (m.id === messageId) {
        const existing = m.reactions || [];
        return {
          ...m,
          reactions: [...existing, { emoji, userId: user?.id || "me", timestamp: new Date().toISOString() }],
        };
      }
      return m;
    });
    setCliqueMessages(cliqueId, updated);
    setShowMediaPicker(false);
    setShowStickerPicker(false);
    // TODO: Send reaction via WebSocket / API
  };

  const startCall = async (type) => {
    const call = await callService.startCall(cliqueId, type);
    setActiveCall(call);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user?.id || item.isMe;

    return (
      <MessageReactions
        messageId={item.id}
        reactions={item.reactions}
        onReact={handleReaction}
        isMe={isMe}
      >
        <View
          style={[
            styles.messageWrapper,
            isMe ? styles.myMessageWrapper : styles.theirMessageWrapper,
          ]}
        >
          {!isMe && (
            <Image
              source={{ uri: item.sender.avatarUrl }}
              style={styles.avatar}
            />
          )}
          <View style={styles.messageContent}>
            {!isMe && (
              <Text style={styles.senderName}>
                {item.sender.displayName || item.sender.username}
              </Text>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={item.contentType !== "image" && item.contentType !== "video"}
              onPress={() => {
                setViewerData({
                  uri: item.contentKey,
                  type: item.contentType,
                  senderName: isMe ? "Moi / Me" : (item.sender.displayName || item.sender.username),
                });
              }}
              style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.theirBubble,
                item.contentType === "sticker" && styles.stickerBubble,
                item.contentType === "location" && styles.locationBubble,
              ]}
            >
              {item.contentType === "location" && (
                <LocationMessage
                  latitude={parseFloat(item.contentKey?.split(",")[0] || 0)}
                  longitude={parseFloat(item.contentKey?.split(",")[1] || 0)}
                  isMe={isMe}
                />
              )}

              {item.contentType === "image" && (
                <Image
                  source={{ uri: item.contentKey }}
                  style={styles.mediaThumbnail}
                />
              )}

              {item.contentType === "video" && (
                <View style={styles.videoThumbnail}>
                  <Text style={styles.playIcon}>▶️</Text>
                </View>
              )}

              {item.contentType === "sticker" ? (
                <Text style={styles.stickerText}>{item.text}</Text>
              ) : item.contentType !== "location" ? (
                <Text
                  style={[
                    styles.messageText,
                    isMe ? styles.myMessageText : styles.theirMessageText,
                    item.contentType === "image" || item.contentType === "video" ? { marginTop: spacing.sm, fontStyle: "italic" } : null
                  ]}
                >
                  {item.text}
                </Text>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </MessageReactions>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CallOverlay
        visible={!!activeCall}
        call={activeCall}
        onClose={() => setActiveCall(null)}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{cliqueName.toUpperCase()}</Text>
          <GroupTypingIndicator
            typingUsers={Object.keys(typingUsers).map((id) => ({
              userId: id,
              displayName: "Membre / Member", // Mock name
              username: "Membre / Member", // Mock name
            }))}
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => startCall(CALL_TYPES.VOICE)}
          >
            <Text style={styles.headerActionIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => startCall(CALL_TYPES.VIDEO)}
          >
            <Text style={styles.headerActionIcon}>📹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Text style={styles.headerActionIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
          <Text style={styles.loadingText}>{cliquePhrases.loading[0]}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
          <GroupTypingIndicator
            typingUsers={Object.entries(typingUsers).map(([id, data]) => ({
              userId: id,
              displayName: data.displayName || data.username || id,
              username: data.username || id,
            }))}
          />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {showVoiceRecorder ? (
          <VoiceRecorder
            onRecordingComplete={(voiceNote) => {
              addCliqueMessage(cliqueId, {
                id: `voice-${Date.now()}`,
                senderId: user?.id,
                text: `🎤 Note vocale / Voice note (${voiceNote.duration}s)`,
                contentType: "voice_note",
                contentKey: voiceNote.uri,
                sentAt: new Date().toISOString(),
                sender: { displayName: user?.displayName, avatarUrl: user?.avatarUrl },
              });
              setShowVoiceRecorder(false);
            }}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        ) : (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.inputActionBtn}
              onPress={() => {
                setShowStickerPicker(!showStickerPicker);
                setShowVoiceRecorder(false);
                setShowMediaPicker(false);
              }}
            >
              <Text style={styles.inputActionEmoji}>
                {showStickerPicker ? "⌨️" : "😎"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inputActionBtn}
              onPress={() => {
                setShowMediaPicker(true);
                setShowStickerPicker(false);
                setShowVoiceRecorder(false);
              }}
            >
              <Text style={styles.inputActionEmoji}>📎</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Parler à la clique... / Message clique..."
              placeholderTextColor={colors.text.muted}
              value={inputText}
              onChangeText={handleTyping}
              multiline
              onFocus={() => { setShowStickerPicker(false); setShowMediaPicker(false); }}
            />

            {inputText.trim() ? (
              <TouchableOpacity
                onPress={sendMessage}
                disabled={sending}
                style={[
                  styles.sendButton,
                  sending && styles.disabledButton,
                ]}
              >
                <Text style={styles.sendButtonText}>▸</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.inputActionBtn}
                onPress={() => {
                  setShowVoiceRecorder(true);
                  setShowStickerPicker(false);
                  setShowMediaPicker(false);
                }}
              >
                <Text style={styles.inputActionEmoji}>🎤</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Bitmoji Sticker Sheet Overlay */}
      <BitmojiSheet
        visible={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelect={(sticker) => {
          const tempId = `sticker-${Date.now()}`;
          const isBitmoji = !!sticker.url;
          
          const msgData = {
            id: tempId,
            senderId: user?.id,
            text: isBitmoji ? "" : sticker.emoji,
            contentType: "sticker",
            contentKey: isBitmoji ? sticker.url : sticker.key,
            sentAt: new Date().toISOString(),
            sender: user,
            isMe: true,
          };

          addCliqueMessage(cliqueId, msgData);
          setShowStickerPicker(false);

          // Send via WebSocket
          sendSocketMessage("clique_message", {
            cliqueId,
            ...msgData,
          });
        }}
      />

      {/* Media Picker Overlay */}
      <MediaPicker
        visible={showMediaPicker}
        onCancel={() => setShowMediaPicker(false)}
        onMediaSelect={(media) => {
          let label = "📷 Photo";
          let contentKey = media.uri;

          if (media.type === "video") {
            label = `🎥 Vidéo (${Math.round((media.duration || 0) / 1000)}s)`;
          } else if (media.type === "location") {
            label = "📍 Position / Location";
            contentKey = `${media.latitude},${media.longitude}`;
          }

          addCliqueMessage(cliqueId, {
            id: `media-${Date.now()}`,
            senderId: user?.id,
            text: label,
            contentType: media.type,
            contentKey: contentKey,
            sentAt: new Date().toISOString(),
            sender: { displayName: user?.displayName, avatarUrl: user?.avatarUrl },
          });
          setShowMediaPicker(false);
        }}
      />

      {/* Media Gallery Viewer */}
      <MediaGalleryViewer
        visible={!!viewerData}
        mediaUri={viewerData?.uri}
        mediaType={viewerData?.type}
        senderName={viewerData?.senderName}
        onClose={() => setViewerData(null)}
      />
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
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceHighlight,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.base,
    fontWeight: "900",
    letterSpacing: 2,
  },
  subHeader: {
    color: colors.text.muted,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  backButton: {
    color: colors.gold.DEFAULT,
    fontSize: 32,
  },
  messageList: {
    padding: spacing.lg,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    maxWidth: "85%",
  },
  myMessageWrapper: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  theirMessageWrapper: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    color: colors.text.secondary,
    fontSize: 10,
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: "bold",
  },
  bubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  myBubble: {
    backgroundColor: colors.gold.DEFAULT,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    borderBottomLeftRadius: 4,
  },
  stickerBubble: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  locationBubble: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
  },
  stickerText: {
    fontSize: 70,
  },
  mediaThumbnail: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.leather.black,
  },
  videoThumbnail: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  playIcon: {
    fontSize: 48,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#000",
    fontWeight: "500",
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  inputContainer: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: colors.leather.black,
    borderTopWidth: 0.5,
    borderTopColor: colors.surfaceHighlight,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gold.DEFAULT,
    marginLeft: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.gold,
  },
  disabledButton: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.gold.DEFAULT,
    marginTop: spacing.md,
    fontSize: 12,
    letterSpacing: 1,
  },
  typingIndicator: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  typingText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontStyle: "italic",
  },
  inputActionBtn: {
    width: 40,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  inputActionEmoji: {
    fontSize: 22,
  },
});
