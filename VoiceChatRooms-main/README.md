# Binmo Voice Chat App - React Native Expo

A complete voice chat room application built with React Native and Expo, featuring real-time voice communication, social features, and monetization.

## Features

### Core Features
- **Voice Chat Rooms**: Real-time voice communication with multiple participants
- **User Authentication**: Email/phone registration and login
- **Social Features**: Friend system, user profiles, and social interactions
- **Gift System**: Virtual gifts with animations and effects
- **Ranking System**: Leaderboards and user rankings
- **VIP System**: Premium memberships with exclusive features
- **In-App Purchases**: Coin packages and VIP subscriptions

### Technical Features
- **Cross-Platform**: iOS and Android support
- **Real-time Communication**: WebRTC integration ready
- **Modern UI**: Gradient-based design with smooth animations
- **Responsive Design**: Optimized for all screen sizes
- **TypeScript**: Full type safety
- **Modular Architecture**: Clean, maintainable code structure

## Project Structure

```
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen with voice rooms
│   │   ├── friends.tsx        # Friends and social features
│   │   ├── gifts.tsx          # Gift shop and purchases
│   │   ├── ranking.tsx        # Leaderboards and rankings
│   │   ├── profile.tsx        # User profile and settings
│   │   └── _layout.tsx        # Tab navigation layout
│   ├── _layout.tsx            # Root layout
│   └── +not-found.tsx         # 404 page
├── components/
│   ├── AuthModal.tsx          # Authentication modal
│   └── VoiceRoomModal.tsx     # Voice room interface
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   ├── useVoiceChat.ts        # Voice chat functionality
│   └── useFrameworkReady.ts   # Framework initialization
├── types/
│   └── index.ts               # TypeScript type definitions
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Setting Up Real-time Voice Chat

To implement real-time voice chat, you'll need to integrate with a service like:

1. **Agora.io** (Recommended)
   - Install: `npm install react-native-agora`
   - Configure API keys in your environment
   - Replace mock voice chat functions with Agora SDK calls

2. **WebRTC**
   - Install: `npm install react-native-webrtc`
   - Set up signaling server
   - Implement peer-to-peer connections

### Database Integration

The app is designed to work with Supabase:

1. Set up a Supabase project
2. Create the following tables:
   - `users` - User profiles and authentication
   - `voice_rooms` - Voice chat rooms
   - `messages` - Chat messages
   - `gifts` - Virtual gifts catalog
   - `user_gifts` - Gift transactions
   - `friendships` - Friend relationships
   - `notifications` - User notifications

### Environment Variables

Create a `.env` file with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_AGORA_APP_ID=your_agora_app_id
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Payment Integration

For in-app purchases:

1. **iOS**: Configure App Store Connect
2. **Android**: Set up Google Play Console
3. **Web**: Integrate Stripe for web payments

Use RevenueCat for cross-platform subscription management.

## Features Implementation

### Voice Chat Rooms
- Room creation and management
- Real-time participant updates
- Voice level indicators
- Mute/unmute controls
- Speaker controls

### Social Features
- Friend requests and management
- User profiles with stats
- Achievement system
- User rankings and leaderboards

### Monetization
- Virtual currency (Gold, Silver, Diamonds)
- Gift purchases and sending
- VIP memberships
- Subscription management

### Admin Features
- User moderation tools
- Room management
- Content moderation
- Analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ using React Native and Expo
</parameter>