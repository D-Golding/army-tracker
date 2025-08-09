// src/data/tierData.js - Shared tier configuration
import { Check, Crown, Zap, Trophy } from 'lucide-react';

export const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: 'forever',
    icon: Check,
    color: 'tier-free',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
    popular: false,
    limits: {
      paints: 25,
      projects: 2,
      photos: 3
    },
    features: [
      '25 paint inventory slots',
      '2 project tracking',
      '3 photos per project',
      'View community projects',
      'Basic paint catalogue'
    ]
  },
  {
    id: 'casual',
    name: 'Casual Hobbyist',
    price: '£4.99',
    period: 'per year',
    icon: Zap,
    color: 'tier-casual',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    popular: true,
    limits: {
      paints: 150,
      projects: 10,
      photos: 10
    },
    features: [
      '150 paint inventory slots',
      '10 project tracking',
      '10 photos per project',
      'Full community access',
      'Share your projects',
      'Like and comment on projects'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£9.99',
    period: 'per year',
    icon: Crown,
    color: 'tier-pro',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-900',
    popular: false,
    limits: {
      paints: 300,
      projects: 25,
      photos: 30
    },
    features: [
      '300 paint inventory slots',
      '25 project tracking',
      '30 photos per project',
      'Full community access',
      'Share your projects',
      'Like and comment on projects'
    ]
  },
  {
    id: 'battle',
    name: 'Battle Ready',
    price: '£14.99',
    period: 'per year',
    icon: Trophy,
    color: 'tier-battle',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    popular: false,
    limits: {
      paints: 1000,
      projects: 50,
      photos: 50
    },
    features: [
      '1000 paint inventory slots',
      '50 project tracking',
      '50 photos per project',
      'Full community access',
      'Share your projects',
      'Like and comment on projects',
      'Army tracker & battle reports'
    ]
  }
];