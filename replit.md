# PicknMat - Dating Application

## Overview
PicknMat is a Tinder-style dating web application built with React, TypeScript, Express, and PostgreSQL. It features Google authentication, profile management, matching system, and real-time chat functionality.

## Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: Firebase Auth (Google Sign-In)
- **Real-time Chat**: WebSockets (ws library)
- **UI**: Tailwind CSS + shadcn/ui components
- **Theme**: Pink (#ff4081) primary color

## Database Schema

### Users Table
- id: varchar (UUID primary key)
- firebaseUid: varchar (unique, Firebase user ID)
- email: text (unique)
- name: text
- age: integer
- gender: text ('male', 'female', 'other')
- preference: text ('male', 'female', 'other')
- photos: jsonb (array of photo URLs)
- bio: text (optional)
- location: jsonb (optional)
- isProfileComplete: boolean
- lastActive: timestamp
- createdAt: timestamp

### Matches Table
- id: varchar (UUID primary key)
- user1Id: varchar (references users.id)
- user2Id: varchar (references users.id)
- createdAt: timestamp

### Likes Table
- id: varchar (UUID primary key)
- fromUserId: varchar (references users.id)
- toUserId: varchar (references users.id)
- createdAt: timestamp

### Messages Table
- id: varchar (UUID primary key)
- matchId: varchar (references matches.id)
- senderId: varchar (references users.id)
- content: text
- createdAt: timestamp

## API Routes

### Authentication
- POST `/api/auth` - Create or get user after Firebase auth

### Profile Management
- POST `/api/profile` - Create/update user profile
- GET `/api/profile` - Get current user profile

### Matching
- GET `/api/feed` - Get potential matches based on preferences
- POST `/api/like` - Like or skip a user (creates match if mutual)
- GET `/api/matches` - Get all user matches

### Messaging
- GET `/api/matches/:matchId/messages` - Get messages for a match
- POST `/api/messages` - Send a message
- WebSocket `/ws` - Real-time chat connection

## User Flow

### 1. Welcome Page (`/`)
- Shows Google Sign-In button
- Firebase authentication with Google provider

### 2. Profile Creation (`/profile-creation`)
- First-time users create their profile
- Required fields: name, age, gender, preference, at least 1 photo (max 3)
- Gender options: male, female, other
- Preference options: male, female, other

### 3. Feed Page (`/feed`)
- Tinder-style swipeable cards
- Shows users based on preference:
  - Males see females
  - Females see males
  - Others see other users
- Actions: Like (heart) or Skip (X)
- Match modal appears when two users like each other

### 4. Matches Page (`/matches`)
- Grid of all matched users
- Shows user photos, name, and age
- Click to open chat

### 5. Chat Page (`/chat/:matchId`)
- Real-time messaging using WebSockets
- Message history from database
- Shows partner's profile photo and online status

### 6. Profile Page (`/profile`)
- View and edit profile information
- Manage photos (max 3)
- Update preferences
- Sign out

## Matching Logic
- Users only see profiles based on their preference
- When user A likes user B:
  - Create a like record
  - Check if user B already liked user A
  - If mutual like exists, create a match
- Matches enable real-time chat

## Real-time Chat
- WebSocket connection at `/ws`
- Client authenticates with userId
- Messages are saved to database and broadcasted via WebSocket
- Offline messages are loaded from database

## Environment Variables
Required Firebase configuration:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_PROJECT_ID

Database (auto-configured):
- DATABASE_URL
- PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST

## Running the Application
- Development: `npm run dev` (starts both frontend and backend on port 5000)
- Database migrations: `npm run db:push`

## Key Features
✅ Google Sign-In authentication
✅ Profile creation with photo upload (max 3)
✅ Gender-based matching preferences
✅ Tinder-style swipe interface
✅ Match notification modal
✅ Real-time chat with WebSockets
✅ Message history
✅ Profile editing
✅ Responsive design (mobile & desktop)
✅ Pink-themed modern UI

## Photo Storage
- Photos are uploaded to Firebase Storage
- Each photo is stored with path: `profile-photos/{userId}/{nanoid}.{ext}`
- Download URLs are saved to PostgreSQL database
- Photos are publicly accessible via Firebase Storage URLs

## Notes
- WebSocket handles real-time messaging
- Database uses PostgreSQL with Drizzle ORM
- All routes except auth require Firebase token authentication
- Firebase Storage is used for persistent photo storage
