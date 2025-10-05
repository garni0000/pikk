import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { profileCreationSchema, insertLikeSchema } from "@shared/schema";
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback to application default (for local development)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Middleware to verify Firebase token
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
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
    
    (req as AuthenticatedRequest).userId = user.id;
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
      const entries = Array.from(clients.entries());
      for (const [userId, client] of entries) {
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
    } catch (error: any) {
      console.error('Auth error:', error);
      res.status(401).json({ 
        message: 'Authentication failed', 
        error: error.message 
      });
    }
  });

  // Profile creation/update
  app.post('/api/profile', authenticateUser, async (req: Request, res: Response) => {
    try {
      const profileData = profileCreationSchema.parse(req.body);
      const authReq = req as AuthenticatedRequest;
      
      const updatedUser = await storage.updateUser(authReq.userId!, {
        ...profileData,
        isProfileComplete: true,
      });

      res.json({ user: updatedUser });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user profile
  app.get('/api/profile', authenticateUser, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.userId!);
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get profile' });
    }
  });

  // Get feed (potential matches)
  app.get('/api/feed', authenticateUser, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const users = await storage.getPotentialMatches(authReq.userId!, 10);
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get feed' });
    }
  });

  // Like/Skip user
  app.post('/api/like', authenticateUser, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { toUserId, action } = req.body;
      
      if (action === 'like') {
        const like = await storage.createLike(authReq.userId!, toUserId);
        
        // Check for mutual like
        const isMutualLike = await storage.checkMutualLike(authReq.userId!, toUserId);
        
        if (isMutualLike) {
          // Create match
          const match = await storage.createMatch(authReq.userId!, toUserId);
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
  app.get('/api/matches', authenticateUser, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const matches = await storage.getUserMatches(authReq.userId!);
      res.json({ matches });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get matches' });
    }
  });

  // Get messages for a match
  app.get('/api/matches/:matchId/messages', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const messages = await storage.getMatchMessages(matchId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get messages' });
    }
  });

  // Send message
  app.post('/api/messages', authenticateUser, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { matchId, content } = req.body;
      const message = await storage.createMessage(matchId, authReq.userId!, content);
      res.json({ message });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  return httpServer;
}
