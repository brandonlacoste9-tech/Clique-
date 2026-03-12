/**
 * callService.js — Signaling and Call State for Clique
 * 
 * Manages:
 * - Call initiation (Voice/Video)
 * - Participant joining/leaving
 * - Toggle Mute/Camera
 * - Call duration tracking
 * 
 * Uses WebSocket for signaling (integration placeholder).
 */

import { sendSocketEvent } from "./websocketService";
import * as Haptics from "expo-haptics";

export const CALL_TYPES = {
  VOICE: "voice",
  VIDEO: "video",
};

export const CALL_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  ONGOING: "ongoing",
  ENDED: "ended",
};

class CallService {
  constructor() {
    this.currentCall = null;
    this.participants = [];
    this.onCallUpdate = null;
  }

  // ─── Call Initiation ────────────────────────────────────────

  async startCall(conversationId, type = CALL_TYPES.VIDEO, participants = []) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    this.currentCall = {
      id: `call_${Date.now()}`,
      conversationId,
      type,
      status: CALL_STATUS.CONNECTING,
      startTime: new Date(),
      isMuted: false,
      isCameraOff: type === CALL_TYPES.VOICE,
    };

    console.log(`[CallService] 📞 Starting ${type} call for ${conversationId}`);
    
    // Signaling: Notify others
    sendSocketEvent("call_initiate", {
      conversationId,
      callId: this.currentCall.id,
      type,
    });

    if (this.onCallUpdate) this.onCallUpdate(this.currentCall);
    return this.currentCall;
  }

  // ─── Call Actions ───────────────────────────────────────────

  toggleMute() {
    if (!this.currentCall) return;
    this.currentCall.isMuted = !this.currentCall.isMuted;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (this.onCallUpdate) this.onCallUpdate({ ...this.currentCall });
  }

  toggleCamera() {
    if (!this.currentCall || this.currentCall.type === CALL_TYPES.VOICE) return;
    this.currentCall.isCameraOff = !this.currentCall.isCameraOff;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (this.onCallUpdate) this.onCallUpdate({ ...this.currentCall });
  }

  endCall() {
    if (!this.currentCall) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    console.log(`[CallService] 👋 Ending call ${this.currentCall.id}`);
    
    sendSocketEvent("call_end", {
      callId: this.currentCall.id,
      conversationId: this.currentCall.conversationId,
    });

    this.currentCall = null;
    if (this.onCallUpdate) this.onCallUpdate(null);
  }

  // ─── Signaling Handlers ─────────────────────────────────────

  handleIncomingCall(data) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // This would be handled by a global listener to show the incoming call screen
    return data;
  }

  handleParticipantJoined(user) {
    this.participants.push(user);
    if (this.onCallUpdate) this.onCallUpdate({ ...this.currentCall, participants: [...this.participants] });
  }
}

export const callService = new CallService();
