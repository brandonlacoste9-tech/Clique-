import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useMessagesStore } from "../store/cliqueStore";
import { messagesAPI } from "../api/cliqueApi";
import {
  addMessageHandler,
  sendTyping,
  sendStopTyping,
  sendReadReceipt,
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
import ReadReceiptIndicator from "../components/ReadReceiptIndicator";
import EncryptionBadge from "../components/EncryptionBadge";
import DisappearTimerPicker from "../components/DisappearTimerPicker";
import ChatSearchBar from "../components/ChatSearchBar";
import MessageReactions from "../components/MessageReactions";
import SwipeableReplyWrapper from "../components/SwipeableReplyWrapper";
import ForwardPicker from "../components/ForwardPicker";
import * as Clipboard from "expo-clipboard";
import { sendLocalNotification } from "../services/pushNotificationService";
import {
  getDisappearTimer,
  filterExpiredMessages,
} from "../services/disappearingMessageService";
import { callService, CALL_TYPES } from "../services/callService";
import CallOverlay from "../components/CallOverlay";

export default function ChatDetailScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const { messages, setMessages, addMessage, markAllRead, updateMessageStatus } = useMessagesStore();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();
  const typingTimeoutRef = useRef(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [viewerData, setViewerData] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [showForwardPicker, setShowForwardPicker] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [disappearSeconds, setDisappearSeconds] = useState(0);

  const userMessages = messages[userId] || [];
  const displayMessages = filterExpiredMessages(userMessages, disappearSeconds);

  // Load messages from API
  useEffect(() => {
    loadMessages();
    loadDisappearTimer();
  }, [userId]);

  // Auto-refresh to remove expired messages
  useEffect(() => {
    if (disappearSeconds > 0) {
      const interval = setInterval(() => {
        // Force re-render to filter expired messages
        setMessages(userId, [...(messages[userId] || [])]);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [disappearSeconds, userId]);

  const loadDisappearTimer = async () => {
    const config = await getDisappearTimer(userId);
    setDisappearSeconds(config?.seconds || 0);
  };

  // Listen for real-time messages
  useEffect(() => {
    const unsubscribe = addMessageHandler((event, data) => {
      if (event === "new_message" && data.senderId === userId) {
        addMessage(userId, {
          id: data.id,
          sender: "them",
          senderId: data.senderId,
          text: data.text,
          contentType: data.contentType,
          contentKey: data.contentKey,
          ephemeral: data.ephemeral,
          timestamp: data.sentAt,
          status: "read", // We're viewing it live
          replyTo: data.replyTo,
        });
        // Immediately send read receipt since user is on this screen
        sendReadReceipt(userId, data.id);
      }

      if (event === "read_receipt" && data.userId === userId) {
        // They read our messages
        markAllRead(userId);
      }

      if (event === "message_delivered" && data.recipientId === userId) {
        updateMessageStatus(userId, data.messageId, "delivered");
      }

      if (event === "typing" && data.userId === userId) {
        setIsTyping(true);
      }

      if (event === "stop_typing" && data.userId === userId) {
        setIsTyping(false);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await messagesAPI.getMessages(userId);
      const formatted = (res.data.messages || []).map((m) => ({
        id: m.id,
        sender: m.senderId === userId ? "them" : "me",
        senderId: m.senderId,
        text: m.text,
        contentType: m.contentType,
        contentKey: m.contentKey,
        ephemeral: m.ephemeral,
        timestamp: m.sentAt,
        readAt: m.readAt,
        status: m.readAt ? "read" : m.senderId !== userId ? "delivered" : undefined,
        isSystem: false,
        replyTo: m.replyTo,
      }));
      setMessages(userId, formatted);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender: "me",
      text,
      timestamp: new Date().toISOString(),
      sending: true,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        sender: replyingTo.sender,
        contentType: replyingTo.contentType
      } : null,
    };
    addMessage(userId, optimisticMsg);

    setInputText("");
    setReplyingTo(null);

    try {
      const res = await messagesAPI.sendMessage(userId, { text, replyToMessageId: replyingTo?.id });
      // Replace temp message with real one
      const store = useMessagesStore.getState();
      const currentMsgs = store.messages[userId] || [];
      const updated = currentMsgs.map((m) =>
        m.id === tempId
          ? {
              ...m,
              id: res.data.message.id,
              sending: false,
              timestamp: res.data.message.sentAt,
              replyTo: res.data.message.replyTo,
            }
          : m,
      );
      setMessages(userId, updated);
      sendStopTyping(userId);
    } catch (err) {
      console.error("Failed to send message:", err);
      // Mark as failed
      const store = useMessagesStore.getState();
      const currentMsgs = store.messages[userId] || [];
      const updated = currentMsgs.map((m) =>
        m.id === tempId ? { ...m, sending: false, failed: true } : m,
      );
      setMessages(userId, updated);
    } finally {
      setSending(false);
    }
  };

  const handleTextChange = (text) => {
    setInputText(text);

    // Typing indicators
    if (text.length > 0) {
      sendTyping(userId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(userId);
      }, 3000);
    } else {
      sendStopTyping(userId);
    }
  };

  const handleReaction = (messageId, emoji) => {
    // Optimistic: add reaction to local state
    const store = useMessagesStore.getState();
    const currentMsgs = store.messages[userId] || [];
    const updated = currentMsgs.map((m) => {
      if (m.id === messageId) {
        const existing = m.reactions || [];
        return {
          ...m,
          reactions: [...existing, { emoji, userId: "me", timestamp: new Date().toISOString() }],
        };
      }
      return m;
    });
    setMessages(userId, updated);
    // TODO: Send reaction via WebSocket / API
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    // Focus input if not focused
  };

  const handleAction = (action, message) => {
    switch (action) {
      case "reply":
        handleReply(message);
        break;
      case "forward":
        setForwardMessage(message);
        setShowForwardPicker(true);
        break;
      case "copy":
        Clipboard.setStringAsync(message.text || "");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "delete":
        // Local delete
        const updated = (messages[userId] || []).filter((m) => m.id !== message.id);
        setMessages(userId, updated);
        break;
    }
  };

  const handleForward = async (recipientIds) => {
    if (!forwardMessage) return;

    for (const rid of recipientIds) {
      const tempId = `fwd-${Date.now()}-${rid}`;
      const forwardText = `[Fwd] ${forwardMessage.text}`;

      // Add to store for each recipient
      addMessage(rid, {
        id: tempId,
        sender: "me",
        text: forwardText,
        contentType: "text",
        timestamp: new Date().toISOString(),
        isForwarded: true,
      });

      try {
        await messagesAPI.sendMessage(rid, {
          text: forwardText,
          isForwarded: true,
        });
      } catch (err) {
        console.error(`Forward to ${rid} failed:`, err);
      }
    }
    setForwardMessage(null);
  };

  const startCall = async (type) => {
    const call = await callService.startCall(userId, type);
    setActiveCall(call);
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
      <SwipeableReplyWrapper onReply={() => handleReply(item)}>
        <MessageReactions
          messageId={item.id}
          messageText={item.text}
          reactions={item.reactions}
          onReact={handleReaction}
          onAction={handleAction}
          isMe={isMe}
          language={useLanguageStore.getState().language}
        >
          <View
            style={[
              styles.messageWrapper,
              isMe ? styles.myMessageWrapper : styles.theirMessageWrapper,
            ]}
          >
            <View style={[
              styles.messageBubble,
              isMe ? styles.myBubble : styles.theirBubble,
              item.sending && styles.sendingBubble,
              item.failed && styles.failedBubble,
              item.contentType === "sticker" && styles.stickerBubble,
              item.contentType === "location" && styles.locationBubble,
            ]}>
              {/* Replying to Preview inside bubble */}
              {item.replyTo && (
                <View style={[
                  styles.replyBubblePreview,
                  isMe ? styles.replyBubblePreviewMe : styles.replyBubblePreviewThem
                ]}>
                  <Text style={styles.replySenderName}>
                    {item.replyTo.sender === "me" ? "Moi / Me" : userName}
                  </Text>
                  <Text style={styles.replyTextSnippet} numberOfLines={1}>
                    {item.replyTo.text}
                  </Text>
                </View>
              )}

              {item.isForwarded && (
                <Text style={[styles.forwardedBadge, isMe ? styles.myForwardedBadge : styles.theirForwardedBadge]}>
                  ↪️ Transféré / Forwarded
                </Text>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={item.contentType !== "image" && item.contentType !== "video"}
                onPress={() => {
                  setViewerData({
                    uri: item.contentKey,
                    type: item.contentType,
                    senderName: isMe ? "Moi / Me" : userName,
                  });
                }}
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

                {item.failed && (
                  <Text style={styles.failedText}>Échec d'envoi ⚠️</Text>
                )}

                {/* Read Receipt Checkmarks */}
                {isMe && !item.failed && (
                  <ReadReceiptIndicator
                    status={item.sending ? "sending" : (item.status || "sent")}
                    timestamp={item.timestamp}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </MessageReactions>
      </SwipeableReplyWrapper>
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
          <Text style={styles.headerTitle}>{userName.toUpperCase()}</Text>
          {isTyping && (
            <Text style={styles.typingIndicator}>
              {cliquePhrases.typing[0]}
            </Text>
          )}
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
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setShowSearch(true)}
          >
            <Text style={styles.headerActionIcon}>🔍</Text>
          </TouchableOpacity>
          <DisappearTimerPicker
            conversationId={userId}
            onChange={(key) => loadDisappearTimer()}
          />
          <EncryptionBadge recipientId={userId} recipientName={userName} />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
          <Text style={styles.loadingText}>{cliquePhrases.loading[0]}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>
                Commence la conversation avec / Start chatting with {userName}!
              </Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Reply Preview UI */}
        {replyingTo && (
          <View style={styles.replyPreviewBar}>
            <View style={styles.replyPreviewContent}>
              <Text style={styles.replyPreviewSender}>
                En réponse à / Replying to {replyingTo.sender === "me" ? "Moi / Me" : userName}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.closeReplyBtn}>
              <Text style={styles.closeReplyIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {showVoiceRecorder ? (
          <VoiceRecorder
            onRecordingComplete={(voiceNote) => {
              const tempId = `voice-${Date.now()}`;
              addMessage(userId, {
                id: tempId,
                sender: "me",
                text: `🎤 Note vocale / Voice note (${voiceNote.duration}s)`,
                contentType: "voice_note",
                contentKey: voiceNote.uri,
                timestamp: new Date().toISOString(),
              });
              setShowVoiceRecorder(false);
            }}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        ) : (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.inputActionButton}
              onPress={() => {
                setShowStickerPicker(!showStickerPicker);
                setShowVoiceRecorder(false);
                setShowMediaPicker(false);
              }}
            >
              <Text style={styles.inputActionIcon}>
                {showStickerPicker ? "⌨️" : "😎"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inputActionButton}
              onPress={() => {
                setShowMediaPicker(true);
                setShowStickerPicker(false);
                setShowVoiceRecorder(false);
              }}
            >
              <Text style={styles.inputActionIcon}>📎</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Écrire un message... / Type a message..."
              placeholderTextColor={colors.text.muted}
              value={inputText}
              onChangeText={handleTextChange}
              multiline
              maxLength={2000}
              onFocus={() => { setShowStickerPicker(false); setShowMediaPicker(false); }}
            />

            {inputText.trim() ? (
              <TouchableOpacity
                onPress={sendMessage}
                style={[
                  styles.sendButton,
                  sending && styles.sendButtonDisabled,
                ]}
                disabled={sending}
              >
                <Text style={styles.sendButtonText}>{sending ? "..." : "▸"}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.inputActionButton}
                onPress={() => {
                  setShowVoiceRecorder(true);
                  setShowStickerPicker(false);
                  setShowMediaPicker(false);
                }}
              >
                <Text style={styles.inputActionIcon}>🎤</Text>
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
          
          addMessage(userId, {
            id: tempId,
            sender: "me",
            text: isBitmoji ? "" : sticker.emoji,
            contentType: "sticker",
            contentKey: isBitmoji ? sticker.url : sticker.key,
            timestamp: new Date().toISOString(),
          });
          setShowStickerPicker(false);
          
          // Send to API
          messagesAPI.sendMessage(userId, {
            text: isBitmoji ? "" : sticker.emoji,
            contentType: "sticker",
            contentKey: isBitmoji ? sticker.url : sticker.key,
          });
        }}
      />

      {/* Media Picker Overlay */}
      <MediaPicker
        visible={showMediaPicker}
        onCancel={() => setShowMediaPicker(false)}
        onMediaSelect={(media) => {
          const tempId = `media-${Date.now()}`;
          let label = "📷 Photo";
          let contentKey = media.uri;

          if (media.type === "video") {
            label = `🎥 Vidéo (${Math.round((media.duration || 0) / 1000)}s)`;
          } else if (media.type === "location") {
            label = "📍 Position / Location";
            contentKey = `${media.latitude},${media.longitude}`;
          }

          addMessage(userId, {
            id: tempId,
            sender: "me",
            text: label,
            contentType: media.type,
            contentKey: contentKey,
            timestamp: new Date().toISOString(),
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

      {/* Chat Search Overlay */}
      <ChatSearchBar
        visible={showSearch}
        messages={displayMessages}
        onClose={() => setShowSearch(false)}
        onJumpToMessage={(index) => {
          flatListRef.current?.scrollToIndex({ index, animated: true });
        }}
      />

      {/* Forward Picker */}
      <ForwardPicker
        visible={showForwardPicker}
        onForward={handleForward}
        onClose={() => setShowForwardPicker(false)}
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
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerActionIcon: {
    fontSize: 14,
  },
  headerTitle: {
    color: colors.gold.DEFAULT,
    fontSize: typography.sizes.base,
    fontWeight: "900",
    letterSpacing: 2,
  },
  typingIndicator: {
    color: colors.gold.light,
    fontSize: typography.sizes.xs,
    fontStyle: "italic",
    marginTop: 2,
  },
  backButton: {
    color: colors.gold.DEFAULT,
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  messageList: {
    padding: spacing.lg,
    flexGrow: 1,
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
    width: 220,
    height: 220,
    borderRadius: borderRadius.md,
    backgroundColor: colors.leather.black,
  },
  videoThumbnail: {
    width: 220,
    height: 220,
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
  sendingBubble: {
    opacity: 0.6,
  },
  failedBubble: {
    borderWidth: 1,
    borderColor: colors.accent.red,
  },
  messageText: {
    fontSize: typography.sizes.base,
    lineHeight: 22,
  },
  myMessageText: {
    color: colors.leather.black,
    fontWeight: "500",
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  failedText: {
    color: colors.accent.red,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  systemMessageContainer: {
    marginVertical: spacing.xl,
    alignItems: "center",
  },
  systemMessage: {
    padding: spacing.lg,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
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
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.leather.black,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  sendButton: {
    marginLeft: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gold.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.gold,
    shadowOpacity: 0.4,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  sendButtonText: {
    color: colors.leather.black,
    fontSize: 22,
    fontWeight: "bold",
  },
  inputActionButton: {
    width: 40,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  inputActionIcon: {
    fontSize: 22,
  },
  // Swipe-to-Reply Styles
  replyPreviewBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.3)",
    borderLeftWidth: 4,
    borderLeftColor: colors.gold.DEFAULT,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewSender: {
    color: colors.gold.DEFAULT,
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  replyPreviewText: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  closeReplyBtn: {
    padding: 8,
  },
  closeReplyIcon: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: "bold",
  },
  replyBubblePreview: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 6,
    borderRadius: 4,
  },
  replyBubblePreviewMe: {
    borderLeftColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  replyBubblePreviewThem: {
    borderLeftColor: colors.gold.DEFAULT,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  replySenderName: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.gold.light,
    marginBottom: 2,
  },
  replyTextSnippet: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  forwardedBadge: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 0.5,
  },
  myForwardedBadge: {
    color: "rgba(0, 0, 0, 0.5)",
    borderColor: "rgba(0, 0, 0, 0.2)",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  theirForwardedBadge: {
    color: colors.gold.DEFAULT,
    borderColor: "rgba(212, 175, 55, 0.3)",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
});
