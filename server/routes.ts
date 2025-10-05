import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { profileCreationSchema, insertLikeSchema } from "@shared/schema";
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Middleware to verify Firebase token
const authenticateUser = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await storage.getUserByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          // Store client connection with user ID
          clients.set(data.userId, ws);
        } else if (data.type === 'message') {
          // Save message to database
          const savedMessage = await storage.createMessage(
            data.matchId,
            data.senderId,
            data.content
          );
          
          // Get match details to find recipient
          const match = await storage.getUserMatches(data.senderId);
          const targetMatch = match.find(m => m.id === data.matchId);
          
          if (targetMatch) {
            const recipientId = targetMatch.user1Id === data.senderId 
              ? targetMatch.user2Id 
              : targetMatch.user1Id;
            
            const recipientWs = clients.get(recipientId);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'message',
                message: savedMessage,
                sender: { id: data.senderId }
              }));
            }
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from map
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });
  });

  // Auth endpoint - create or get user after Firebase auth
  app.post('/api/auth', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      let user = await storage.getUserByFirebaseUid(decodedToken.uid);

      if (!user) {
        // Create new user
        user = await storage.createUser({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email!,
          name: decodedToken.name || 'User',
          age: 18,
          gender: 'other',
          preference: 'other',
          photos: [],
          isProfileComplete: false,
        });
      }

      res.json({ user });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Profile creation/update
  app.post('/api/profile', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const profileData = profileCreationSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(req.userId!, {
        ...profileData,
        isProfileComplete: true,
      });

      res.json({ user: updatedUser });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user profile
  app.get('/api/profile', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile' });
    }
  });

  // Get feed (potential matches)
  app.get('/api/feed', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getPotentialMatches(req.userId!, 10);
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get feed' });
    }
  });

  // Like/Skip user
  app.post('/api/like', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { toUserId, action } = req.body;
      
      if (action === 'like') {
        const like = await storage.createLike(req.userId!, toUserId);
        
        // Check for mutual like
        const isMutualLike = await storage.checkMutualLike(req.userId!, toUserId);
        
        if (isMutualLike) {
          // Create match
          const match = await storage.createMatch(req.userId!, toUserId);
          res.json({ like, match, isMatch: true });
        } else {
          res.json({ like, isMatch: false });
        }
      } else {
        res.json({ message: 'Skipped' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to process action' });
    }
  });

  // Get user matches
  app.get('/api/matches', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const matches = await storage.getUserMatches(req.userId!);
      res.json({ matches });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get matches' });
    }
  });

  // Get messages for a match
  app.get('/api/matches/:matchId/messages', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { matchId } = req.params;
      const messages = await storage.getMatchMessages(matchId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get messages' });
    }
  });

  // Send message
  app.post('/api/messages', authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { matchId, content } = req.body;
      const message = await storage.createMessage(matchId, req.userId!, content);
      res.json({ message });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  return httpServer;
}
