import { Gift } from '../types';

export const VIRTUAL_GIFTS: Gift[] = [
  {
    id: 'gift-rose',
    name: 'Rose',
    icon: '🌹',
    coins: 1,
    color: '#f43f5e',
    effect: 'particles',
  },
  {
    id: 'gift-heart',
    name: 'Love Heart',
    icon: '💖',
    coins: 10,
    color: '#ec4899',
    effect: 'hearts',
  },
  {
    id: 'gift-diamond',
    name: 'Diamond',
    icon: '💎',
    coins: 50,
    color: '#06b6d4',
    effect: 'particles',
  },
  {
    id: 'gift-crown',
    name: 'Royal Crown',
    icon: '👑',
    coins: 199,
    color: '#eab308',
    effect: 'crown',
  },
  {
    id: 'gift-car',
    name: 'Supercar',
    icon: '🏎️',
    coins: 499,
    color: '#8b5cf6',
    effect: 'supercar',
  },
  {
    id: 'gift-rocket',
    name: 'Space Rocket',
    icon: '🚀',
    coins: 1200,
    color: '#f97316',
    effect: 'rocket',
  },
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    userId: 'u-1',
    userName: 'Kev_Vip99',
    text: 'Elena looks stunning tonight! Welcome everyone 🔥',
    timestamp: '19:42',
    level: 32,
    badge: 'VIP',
  },
  {
    id: 'msg-2',
    userId: 'u-2',
    userName: 'SakuraSky',
    text: 'Greetings from Tokyo! Sending good energy 🌸',
    timestamp: '19:43',
    level: 18,
  },
  {
    id: 'msg-3',
    userId: 'u-3',
    userName: 'Alex_Speed',
    text: 'That microphone sound quality is crystal clear! ✨',
    timestamp: '19:44',
    level: 25,
  },
  {
    id: 'msg-4',
    userId: 'u-sys',
    userName: 'System Notice',
    text: 'Please follow community rules. Harassment or inappropriate requests will result in an instant ban.',
    timestamp: '19:44',
    isSystem: true,
  },
];
