
# 📨 WorkWire — A Modern Messaging App for Businesses

WorkWire is a sleek, desktop-first messaging application built with modern web technologies. Designed to offer a clean, WhatsApp-like experience, it supports real-time one-on-one and group messaging, rich user profiles, and a fully responsive dark/light theme toggle — all powered by Supabase, React, and TailwindCSS.

## Demo



## Features

### Authentication

- Email/password sign-up and login with secure session handling
- Demo login for testing without creating an account

### User Profiles

- Profile and cover images
- Profession, location, GitHub URL
- Skills list with tag-style display
- "About me" section
- Public Access control for full user Privacy

### Chat Functionality

- One-on-one direct messaging between users
- Real-time message updates using Supabase subscriptions
- Message status indicators (e.g., sent, deleted)
- Emoji support
- Image support using Subase buckets
- Soft delete for sent messages (sender can hide their message)

### Group Messaging

- Create and manage group chats
- Only groups the current user is a member of are shown
- Group messages integrated into main chat system

### Theme & Sound Toggles

- Toggle between light and dark mode
- Optional sound effects toggle for notifications (UI-level)

### Navigation & UI

- Persistent sidebar navigation
- Active state highlighting for current route
- Animated modals for editing profile fields
- Responsive layout optimized for desktop use

### Real-time Presence

- Displays online/offline status of users using presence tracking

## Deployment

- Deployed using Vercel 
## Authors

- [@dewaldfourie](https://github.com/DewaldFourie)


## Tech Stack

**Client:** TypeScript, React, Redux, TailwindCSS, Framer-motion, Vite

**Server:** Node, Supabase, Real-time Websockets, Express


## License

[MIT](https://choosealicense.com/licenses/mit/)

