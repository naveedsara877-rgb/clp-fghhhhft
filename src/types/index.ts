export interface Streamer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  thumbnail: string;
  bio: string;
  viewers: number;
  level: number;
  country: string;
  countryCode: string;
  tags: string[];
  isLive: boolean;
  isPK: boolean;
  ratePerMin: number; // Coins per min for 1v1
  likes: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  isGift?: boolean;
  giftInfo?: {
    name: string;
    icon: string;
    count: number;
  };
  level?: number;
  badge?: string;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  coins: number;
  color: string;
  effect: 'particles' | 'rocket' | 'crown' | 'supercar' | 'hearts';
  soundTone?: string;
}

export interface FloatingGiftEffect {
  id: string;
  gift: Gift;
  senderName: string;
  count: number;
  x: number;
  timestamp: number;
}

export interface FloatingHeart {
  id: string;
  color: string;
  x: number;
}

export interface AgoraConnectionConfig {
  appId: string;
  channelName: string;
  token: string;
  uid: number | string;
  mode: 'live' | 'rtc';
  role: 'host' | 'audience';
}
