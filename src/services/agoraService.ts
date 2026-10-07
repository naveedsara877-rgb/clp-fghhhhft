/**
 * Agora RTC Web SDK Service & Manager
 * Provides client initialization, room joining, track publishing/subscribing,
 * device muting, and error handling for live streaming and 1-on-1 video calls.
 */

import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';

export interface AgoraState {
  isInitialized: boolean;
  isConnected: boolean;
  isPublishing: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  channelName: string | null;
  uid: string | number | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  error: string | null;
}

export type AgoraEventCallback = (state: AgoraState) => void;

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;

  private state: AgoraState = {
    isInitialized: false,
    isConnected: false,
    isPublishing: false,
    isAudioMuted: false,
    isVideoMuted: false,
    channelName: null,
    uid: null,
    remoteUsers: [],
    error: null,
  };

  private listeners: Set<AgoraEventCallback> = new Set();

  constructor() {
    // AgoraRTC log level (can be set to AgoraRTC.setLogLevel(1) for debugging)
    AgoraRTC.setLogLevel(2); // 2: WARNING, 3: ERROR
  }

  public subscribeState(callback: AgoraEventCallback): () => void {
    this.listeners.add(callback);
    callback({ ...this.state });
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const snapshot = { ...this.state, remoteUsers: [...this.state.remoteUsers] };
    this.listeners.forEach((listener) => listener(snapshot));
  }

  /**
   * Initialize Agora Client with specified mode ('live' for broadcasting, 'rtc' for 1-on-1 call)
   */
  public initClient(mode: 'live' | 'rtc' = 'rtc', role: 'host' | 'audience' = 'host') {
    if (this.client) {
      try {
        this.client.leave();
      } catch (err) {
        console.warn('Error during previous client cleanup', err);
      }
    }

    this.client = AgoraRTC.createClient({ mode, codec: 'vp8' });

    if (mode === 'live') {
      this.client.setClientRole(role);
    }

    // Register event listeners
    this.client.on('user-published', async (user, mediaType) => {
      if (!this.client) return;
      try {
        await this.client.subscribe(user, mediaType);
        
        // Update remote users list
        const existing = this.state.remoteUsers.filter((u) => u.uid !== user.uid);
        this.state.remoteUsers = [...existing, user];
        this.notify();

        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (err: any) {
        console.error('Failed to subscribe to remote user track:', err);
      }
    });

    this.client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        // Video unpublished
      }
      this.notify();
    });

    this.client.on('user-left', (user) => {
      this.state.remoteUsers = this.state.remoteUsers.filter((u) => u.uid !== user.uid);
      this.notify();
    });

    this.client.on('exception', (event) => {
      console.warn('Agora exception:', event);
    });

    this.state.isInitialized = true;
    this.state.error = null;
    this.notify();
    return this.client;
  }

  /**
   * Join an Agora RTC Channel
   * @param appId Agora App ID (from Agora Console)
   * @param channel Channel Name (e.g., 'chamet_room_elena')
   * @param token RTC Token (or null for test mode with app certificates disabled)
   * @param uid Custom numeric/string user ID or null for auto-assignment
   */
  public async joinChannel(
    appId: string,
    channel: string,
    token: string | null = null,
    uid: string | number | null = null
  ): Promise<string | number> {
    if (!this.client) {
      this.initClient('rtc');
    }

    try {
      this.state.error = null;
      const assignedUid = await this.client!.join(
        appId,
        channel,
        token || null,
        uid ?? Math.floor(Math.random() * 100000)
      );

      this.state.isConnected = true;
      this.state.channelName = channel;
      this.state.uid = assignedUid;
      this.notify();
      return assignedUid;
    } catch (err: any) {
      this.state.error = err?.message || 'Failed to join Agora channel';
      this.notify();
      throw err;
    }
  }

  /**
   * Create and publish local microphone and camera tracks
   * @param videoElementId DOM container ID or element to play local video
   */
  public async publishLocalTracks(videoContainer?: HTMLElement | string) {
    if (!this.client || !this.state.isConnected) {
      throw new Error('Client must join a channel before publishing tracks');
    }

    try {
      // Create local mic and camera tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {
          encoderConfig: 'music_standard',
        },
        {
          encoderConfig: '720p_1',
        }
      );

      this.localAudioTrack = audioTrack;
      this.localVideoTrack = videoTrack;

      // Play local camera preview if element provided
      if (videoContainer) {
        videoTrack.play(videoContainer);
      }

      // Publish to channel
      await this.client.publish([audioTrack, videoTrack]);

      this.state.isPublishing = true;
      this.state.isAudioMuted = false;
      this.state.isVideoMuted = false;
      this.notify();
    } catch (err: any) {
      this.state.error = err?.message || 'Failed to capture or publish local camera/audio';
      this.notify();
      throw err;
    }
  }

  /**
   * Play remote video track into a container element
   */
  public playRemoteVideo(user: IAgoraRTCRemoteUser, container: HTMLElement | string) {
    if (user.videoTrack) {
      user.videoTrack.play(container);
    }
  }

  /**
   * Toggle local microphone mute
   */
  public async toggleAudio(): Promise<boolean> {
    if (!this.localAudioTrack) return false;
    const shouldMute = !this.state.isAudioMuted;
    await this.localAudioTrack.setEnabled(!shouldMute);
    this.state.isAudioMuted = shouldMute;
    this.notify();
    return !shouldMute;
  }

  /**
   * Toggle local camera mute
   */
  public async toggleVideo(): Promise<boolean> {
    if (!this.localVideoTrack) return false;
    const shouldMute = !this.state.isVideoMuted;
    await this.localVideoTrack.setEnabled(!shouldMute);
    this.state.isVideoMuted = shouldMute;
    this.notify();
    return !shouldMute;
  }

  /**
   * Leave channel, close local tracks, and cleanup
   */
  public async leaveChannel() {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      if (this.client) {
        await this.client.leave();
      }
    } catch (err) {
      console.warn('Error during leaveChannel:', err);
    } finally {
      this.state.isConnected = false;
      this.state.isPublishing = false;
      this.state.channelName = null;
      this.state.remoteUsers = [];
      this.state.error = null;
      this.notify();
    }
  }

  public getState(): AgoraState {
    return { ...this.state };
  }
}

export const agoraService = new AgoraService();
