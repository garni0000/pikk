import { users, matches, likes, messages, type User, type InsertUser, type Match, type Message, type Like } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, not, inArray, desc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Feed and matching
  getPotentialMatches(userId: string, limit?: number): Promise<User[]>;
  createLike(fromUserId: string, toUserId: string): Promise<Like>;
  checkMutualLike(user1Id: string, user2Id: string): Promise<boolean>;
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getUserMatches(userId: string): Promise<Array<Match & { user1: User; user2: User }>>;
  
  // Messaging
  getMatchMessages(matchId: string): Promise<Array<Message & { sender: User }>>;
  createMessage(matchId: string, senderId: string, content: string): Promise<Message>;
  getMatchByUsers(user1Id: string, user2Id: string): Promise<Match | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getPotentialMatches(userId: string, limit: number = 10): Promise<User[]> {
    // Get current user to check preferences
    const currentUser = await this.getUser(userId);
    if (!currentUser) return [];

    // Get users that current user has already liked or matched with
    const likedUsers = await db
      .select({ toUserId: likes.toUserId })
      .from(likes)
      .where(eq(likes.fromUserId, userId));

    const likedUserIds = likedUsers.map(l => l.toUserId);

    // Get potential matches based on preferences
    let matchQuery = db
      .select()
      .from(users)
      .where(
        and(
          not(eq(users.id, userId)),
          likedUserIds.length > 0 ? not(inArray(users.id, likedUserIds)) : undefined,
          eq(users.isProfileComplete, true),
          // Show users based on current user's preferences
          currentUser.preference === "other" ? undefined : eq(users.gender, currentUser.preference)
        )
      )
      .limit(limit);

    return await matchQuery;
  }

  async createLike(fromUserId: string, toUserId: string): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values({ fromUserId, toUserId })
      .returning();
    return like;
  }

  async checkMutualLike(user1Id: string, user2Id: string): Promise<boolean> {
    const mutualLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.fromUserId, user2Id),
          eq(likes.toUserId, user1Id)
        )
      );

    return mutualLike.length > 0;
  }

  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();
    return match;
  }

  async getUserMatches(userId: string): Promise<Array<Match & { user1: User; user2: User }>> {
    const userMatches = await db
      .select()
      .from(matches)
      .leftJoin(users, or(eq(matches.user1Id, users.id), eq(matches.user2Id, users.id)))
      .where(
        or(
          eq(matches.user1Id, userId),
          eq(matches.user2Id, userId)
        )
      )
      .orderBy(desc(matches.createdAt));

    // Group matches with both users
    const matchesMap = new Map();
    
    for (const row of userMatches) {
      const matchId = row.matches.id;
      if (!matchesMap.has(matchId)) {
        matchesMap.set(matchId, {
          ...row.matches,
          user1: null,
          user2: null
        });
      }
      
      const match = matchesMap.get(matchId);
      if (row.users?.id === match.user1Id) {
        match.user1 = row.users;
      } else if (row.users?.id === match.user2Id) {
        match.user2 = row.users;
      }
    }

    return Array.from(matchesMap.values()).filter(m => m.user1 && m.user2);
  }

  async getMatchMessages(matchId: string): Promise<Array<Message & { sender: User }>> {
    const messagesWithSender = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);

    return messagesWithSender.map(row => ({
      ...row.messages,
      sender: row.users!
    }));
  }

  async createMessage(matchId: string, senderId: string, content: string): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({ matchId, senderId, content })
      .returning();
    return message;
  }

  async getMatchByUsers(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
          and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
        )
      );
    return match || undefined;
  }
}

export const storage = new DatabaseStorage();
