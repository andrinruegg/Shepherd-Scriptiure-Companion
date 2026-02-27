
import { supabase } from './supabase';
import { ChatSession, Message, SavedItem, BibleHighlight, UserProfile, FriendRequest, DirectMessage, Achievement, LeaderboardEntry } from '../types';
import { BIBLE_BOOKS } from './bibleService';

const ensureSupabase = () => {
    if (!supabase) throw new Error("Database not connected.");
    return supabase;
}

export const db = {
  // ... [Existing Chat Methods: getUserChats, createChat, deleteChat, deleteMessage, updateChatTitle, addMessage] ...
  async getUserChats(): Promise<ChatSession[]> {
    const client = ensureSupabase();
    const { data: authData } = await client.auth.getUser();
    const user = authData?.user;
    if (!user) throw new Error('Not authenticated');

    const { data: chatsData, error: chatsError } = await client
      .from('chats')
      .select(`
        id,
        title,
        created_at,
        messages (
          id,
          role,
          text,
          is_error,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (chatsError) throw chatsError;

    return (chatsData || []).map((chat: any) => ({
      id: chat.id,
      title: chat.title || 'New Conversation',
      createdAt: new Date(chat.created_at).getTime(),
      messages: (chat.messages || [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m: any) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          isError: m.is_error,
          timestamp: m.created_at
        }))
    }));
  },

  async createChat(title: string = 'New Conversation', initialMessage?: Message, id?: string): Promise<ChatSession> {
    const client = ensureSupabase();
    const { data: authData } = await client.auth.getUser();
    const user = authData?.user;
    if (!user) throw new Error('Not authenticated');

    const chatData: any = { user_id: user.id, title };
    if (id) chatData.id = id;

    const { data: chat, error: chatError } = await client
      .from('chats')
      .insert(chatData)
      .select()
      .single();

    if (chatError) throw chatError;

    let savedMessages: Message[] = [];
    if (initialMessage) {
       savedMessages = await this.addMessage(chat.id, initialMessage);
    }

    return {
      id: chat.id,
      title: chat.title,
      createdAt: new Date(chat.created_at).getTime(),
      messages: savedMessages
    };
  },

  async deleteChat(chatId: string) {
    const client = ensureSupabase();
    const { error: msgError } = await client.from('messages').delete().eq('chat_id', chatId);
    if (msgError) console.warn("Message deletion warning:", msgError);

    const { error } = await client.from('chats').delete().eq('id', chatId);
    if (error) throw error;
  },

  async deleteMessage(messageId: string) {
      const client = ensureSupabase();
      const { error } = await client.from('messages').delete().eq('id', messageId);
      if (error) throw error;
  },

  async updateChatTitle(chatId: string, title: string) {
    const client = ensureSupabase();
    const { error } = await client.from('chats').update({ title }).eq('id', chatId);
    if (error) throw error;
  },

  async addMessage(chatId: string, message: Message): Promise<Message[]> {
    const client = ensureSupabase();
    const { data, error } = await client
      .from('messages')
      .insert({
        chat_id: chatId,
        role: message.role,
        text: message.text,
        is_error: message.isError || false,
        created_at: typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return [{
        id: data.id,
        role: data.role,
        text: data.text,
        isError: data.is_error,
        timestamp: data.created_at
    }];
  },

  // ... [Existing Saved Items Methods] ...
  async getSavedItems(): Promise<SavedItem[]> {
      const client = ensureSupabase();
      const { data: authData } = await client.auth.getUser();
      const user = authData?.user;
      if (!user) return [];

      const { data, error } = await client
          .from('saved_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      
      if (error) throw error;

      return (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          type: item.type as 'verse' | 'chat',
          content: item.content,
          reference: item.reference,
          date: new Date(item.created_at).getTime(),
          metadata: item.metadata || {}
      }));
  },

  async saveItem(item: SavedItem) {
      const client = ensureSupabase();
      const { data: authData } = await client.auth.getUser();
      const user = authData?.user;
      if (!user) throw new Error('Not authenticated');

      const { error } = await client
          .from('saved_items')
          .insert({
              user_id: user.id,
              type: item.type,
              content: item.content,
              reference: item.reference,
              created_at: new Date(item.date).toISOString(),
              metadata: item.metadata || {}
          });
      
      if (error) {
          throw error;
      }
  },

  async updateSavedItem(id: string, updates: Partial<SavedItem>) {
      const client = ensureSupabase();
      const { data: authData } = await client.auth.getUser();
      const user = authData?.user;
      if (!user) throw new Error('Not authenticated');

      const dbUpdates: any = {};
      if (updates.content) dbUpdates.content = updates.content;
      if (updates.metadata) dbUpdates.metadata = updates.metadata;
      
      const { error } = await client
          .from('saved_items')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', user.id); 

      if (error) throw error;
  },

  async deleteSavedItem(id: string) {
      const client = ensureSupabase();
      const { error } = await client.from('saved_items').delete().eq('id', id);
      if (error) throw error;
  },

  // ... [Highlights & Feedback] ...
  async getHighlights(): Promise<BibleHighlight[]> {
      const client = ensureSupabase();
      const { data: authData } = await client.auth.getUser();
      const user = authData?.user;
      if (!user) return [];

      const { data, error } = await client.from('highlights').select('*').eq('user_id', user.id);
      if (error) throw error;

      return (data || []).map((h: any) => ({
          id: h.id,
          ref: h.ref,
          color: h.color as 'yellow'|'green'|'blue'|'pink'
      }));
  },

  async addHighlight(highlight: BibleHighlight) {
      const client = ensureSupabase();
      const { data: authData } = await client.auth.getUser();
      const user = authData?.user;
      if (!user) throw new Error('Not authenticated');

      const { error } = await client.from('highlights').insert({ user_id: user.id, ref: highlight.ref, color: highlight.color });
      if (error) throw error;
  },

  async deleteHighlight(ref: string) {
      const client = ensureSupabase();
      const { error } = await client.from('highlights').delete().eq('ref', ref);
      if (error) throw error;
  },

  async saveFeedback(type: string, subject: string, message: string) {
      const client = ensureSupabase();
      const { data: authData } = await client.auth.getUser();
      const user = authData?.user;
      const { error } = await client.from('feedback').insert({
          user_id: user?.id || null,
          type,
          subject,
          message,
          metadata: { recipient: 'andrinruegg732@gmail.com' },
          created_at: new Date().toISOString()
      });
      if (error) throw error;
  },
  
  // ... [Prayer Section] ...
  prayers: {
      async getCommunityPrayers(): Promise<SavedItem[]> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return [];

          const { data: friendshipData } = await client
              .from('friendships')
              .select('requester_id, receiver_id')
              .eq('status', 'accepted')
              .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
          
          const friendIds = (friendshipData || []).map((f: any) => 
              f.requester_id === user.id ? f.receiver_id : f.requester_id
          );

          const { data, error } = await client
              .from('saved_items')
              .select('*')
              .eq('type', 'prayer')
              .limit(100)
              .order('created_at', { ascending: false });

          if (error) {
              console.error("Error fetching community prayers:", error);
              return []; 
          }

          const accessiblePrayers: SavedItem[] = [];
          
          for (const item of (data || [])) {
              const meta = item.metadata || {};
              const vis = meta.visibility || 'private';
              const ownerId = item.user_id;
              
              let isVisible = false;

              if (ownerId === user.id) isVisible = true;
              else if (vis === 'public') isVisible = true;
              else if (vis === 'friends' && friendIds.includes(ownerId)) isVisible = true;
              else if (vis === 'specific' && meta.allowed_users?.includes(user.id)) isVisible = true;

              if (isVisible) {
                  accessiblePrayers.push({ 
                      id: item.id,
                      user_id: item.user_id,
                      type: 'prayer',
                      content: item.content,
                      date: new Date(item.created_at).getTime(),
                      metadata: meta
                  });
              }
          }
          
          return accessiblePrayers;
      },
      
      async toggleAmen(prayerId: string, currentMetadata: any): Promise<any> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return currentMetadata;

          const interactions = currentMetadata.interactions || { type: 'amen', count: 0, user_ids: [] };
          const hasAmened = interactions.user_ids.includes(user.id);
          
          let newInteractions;
          if (hasAmened) {
              newInteractions = {
                  ...interactions,
                  count: Math.max(0, interactions.count - 1),
                  user_ids: interactions.user_ids.filter((id: string) => id !== user.id)
              };
          } else {
              newInteractions = {
                  ...interactions,
                  count: interactions.count + 1,
                  user_ids: [...interactions.user_ids, user.id]
              };
          }
          
          const newMetadata = { ...currentMetadata, interactions: newInteractions };
          const { error } = await client.from('saved_items').update({ metadata: newMetadata }).eq('id', prayerId);
          if (error) throw error;
          return newMetadata;
      }
  },

  social: {
      async heartbeat() {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return;
          await client.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
      },

      async checkShareIdExists(shareId: string): Promise<boolean> {
          const client = ensureSupabase();
          const { data } = await client.from('profiles').select('id').eq('share_id', shareId).maybeSingle();
          return !!data;
      },

      async upsertProfile(shareId: string, displayName: string, avatar?: string, bio?: string) {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return;

          const { data: existing } = await client.from('profiles').select('share_id').eq('id', user.id).maybeSingle();
          let finalIdToSave = shareId;
          if (existing && existing.share_id) { finalIdToSave = existing.share_id; }

          const updates: any = { id: user.id, display_name: displayName, avatar: avatar || null, bio: bio || null, share_id: finalIdToSave, last_seen: new Date().toISOString() };
          const { error } = await client.from('profiles').upsert(updates, { onConflict: 'id' });
          if (error) console.error("Profile sync failed", error);
          return finalIdToSave;
      },
      
      async updateGamificationStats(xp: number, completedNodes: string[], nodeProgress: Record<string, number>) {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return;
          
          const { data: currentProfile } = await client.from('profiles').select('xp, weekly_xp').eq('id', user.id).single();
          
          const oldXp = currentProfile?.xp || 0;
          const currentWeekly = currentProfile?.weekly_xp || 0;
          
          const gain = Math.max(0, xp - oldXp);
          
          await client.from('profiles').update({ 
              xp: xp,
              weekly_xp: currentWeekly + gain,
              completed_nodes: completedNodes,
              node_progress: nodeProgress
          }).eq('id', user.id);
      },

      async markChapterRead(bookId: string, chapter: number) {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return;

          // 1. Get current read state
          const { data: profile } = await client.from('profiles').select('read_chapters').eq('id', user.id).single();
          
          let readMap: Record<string, number[]> = profile?.read_chapters || {};
          
          if (!readMap[bookId]) readMap[bookId] = [];
          
          // 2. If chapter already read, skip
          if (readMap[bookId].includes(chapter)) return;

          // 3. Mark read
          readMap[bookId].push(chapter);
          
          await client.from('profiles').update({ read_chapters: readMap }).eq('id', user.id);

          // 4. Check for Book Completion (Optional: could trigger achievement here or UI logic)
          const bookInfo = BIBLE_BOOKS.find(b => b.id === bookId);
          if (bookInfo && readMap[bookId].length >= bookInfo.chapters) {
              console.log("Book Completed:", bookInfo.name);
              // In future: Add logic here to award XP or specific achievement in DB
          }
      },

      async ensureUserInCohort(): Promise<string | null> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return null;

          const { data: profile } = await client.from('profiles').select('cohort_id, league').eq('id', user.id).single();
          const league = profile?.league || 'Bronze';

          const { data: cohortId, error } = await client.rpc('assign_cohort', { 
              target_user_id: user.id,
              user_league: league
          });

          if (error) console.error("Error assigning cohort:", error);
          return cohortId;
      },

      async getLeaderboard(): Promise<LeaderboardEntry[]> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return [];

          await this.ensureUserInCohort();

          const { data: profile } = await client.from('profiles').select('cohort_id').eq('id', user.id).single();
          
          if (!profile?.cohort_id) return [];

          const { data, error } = await client
              .from('profiles')
              .select('id, display_name, avatar, weekly_xp')
              .eq('cohort_id', profile.cohort_id)
              .order('weekly_xp', { ascending: false });

          if (error) throw error;

          return (data || []).map((entry: any, index: number) => ({
              user_id: entry.id,
              display_name: entry.display_name || "Unknown Traveler",
              avatar: entry.avatar,
              weekly_xp: entry.weekly_xp || 0,
              is_current_user: entry.id === user.id,
              rank: index + 1
          }));
      },

      async updateProfileStats(streak: number, achievements?: Achievement[]) {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return;
          const updates: any = { streak };
          if (achievements) updates.achievements = achievements;
          await client.from('profiles').update(updates).eq('id', user.id);
      },
      
      async addAchievement(achievement: Achievement) {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return;
          const { data } = await client.from('profiles').select('achievements').eq('id', user.id).single();
          const current: Achievement[] = data?.achievements || [];
          if (current.some(a => a.id === achievement.id)) return;
          const newSet = [...current, achievement];
          await client.from('profiles').update({ achievements: newSet }).eq('id', user.id);
          return newSet;
      },

      async getUserProfile(userId: string): Promise<UserProfile | null> {
          const client = ensureSupabase();
          const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle(); 
          if (error || !data) return null;
          return data as UserProfile;
      },
      
      async getCurrentUser(): Promise<UserProfile | null> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return null;
          return this.getUserProfile(user.id);
      },

      async searchUserByShareId(shareId: string): Promise<UserProfile | null> {
          const client = ensureSupabase();
          const { data, error } = await client.from('profiles').select('*').eq('share_id', shareId).maybeSingle();
          if (error || !data) return null;
          return data as UserProfile;
      },

      async sendFriendRequest(targetUserId: string) {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) throw new Error('Not authenticated');
          if (user.id === targetUserId) throw new Error("You cannot add yourself.");
          const { data: existing } = await client.from('friendships').select('*').or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${user.id})`).maybeSingle();
          if (existing) throw new Error("Request already sent or you are already friends.");
          const { error } = await client.from('friendships').insert({ requester_id: user.id, receiver_id: targetUserId, status: 'pending' });
          if (error) throw error;
      },

      async getIncomingRequests(): Promise<FriendRequest[]> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return [];
          const { data, error } = await client.from('friendships').select(`id, created_at, status, requester:profiles!requester_id ( id, share_id, display_name, avatar, bio )`).eq('receiver_id', user.id).eq('status', 'pending');
          if (error) throw error;
          return (data || []).filter((r: any) => r.requester !== null).map((r: any) => ({ id: r.id, status: r.status, created_at: r.created_at, requester: r.requester }));
      },

      async respondToRequest(requestId: string, accept: boolean) {
          const client = ensureSupabase();
          if (accept) {
              const { error } = await client.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
              if (error) throw error;
          } else {
              const { error } = await client.from('friendships').delete().eq('id', requestId);
              if (error) throw error;
          }
      },

      async removeFriend(friendId: string) {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) throw new Error("Not authenticated");
          await client.from('friendships').delete().eq('requester_id', user.id).eq('receiver_id', friendId);
          await client.from('friendships').delete().eq('requester_id', friendId).eq('receiver_id', user.id);
      },

      async getFriends(): Promise<UserProfile[]> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return [];
          const { data, error } = await client.from('friendships').select(`requester:profiles!requester_id(*), receiver:profiles!receiver_id(*)`).eq('status', 'accepted').or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
          if (error) throw error;

          const friends: UserProfile[] = [];
          (data || []).forEach((row: any) => {
              if (row.requester?.id && row.requester.id !== user.id) friends.push(row.requester);
              if (row.receiver?.id && row.receiver.id !== user.id) friends.push(row.receiver);
          });

          const { data: unreadData } = await client.from('direct_messages').select('sender_id').eq('receiver_id', user.id).is('read_at', null);
          const unreadMap = new Map();
          unreadData?.forEach((m: any) => { unreadMap.set(m.sender_id, (unreadMap.get(m.sender_id) || 0) + 1); });

          const { data: latestMsgs } = await client.from('direct_messages').select('sender_id, receiver_id, created_at').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(200);
          const latestMap = new Map();
          latestMsgs?.forEach((m: any) => {
              const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
              if (!latestMap.has(otherId)) latestMap.set(otherId, m.created_at);
          });
          return friends.map(f => ({ ...f, unread_count: unreadMap.get(f.id) || 0, last_message_at: latestMap.get(f.id) || '' }));
      },
      
      async getMessages(friendId: string): Promise<DirectMessage[]> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return [];
          const { data, error } = await client.from('direct_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`).order('created_at', { ascending: true });
          if (error) throw error;
          return data || [];
      },

      async sendMessage(friendId: string, content: string, type: 'text'|'image'|'audio' = 'text'): Promise<DirectMessage> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) throw new Error("Not authenticated");
          const { data, error } = await client.from('direct_messages').insert({ sender_id: user.id, receiver_id: friendId, content: content, message_type: type }).select().single();
          if (error) throw error;
          return data;
      },

      async deleteDirectMessage(messageId: string) {
          const client = ensureSupabase();
          await client.from('direct_messages').delete().eq('id', messageId);
      },

      async markMessagesRead(friendId: string) {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return;
          await client.from('direct_messages').update({ read_at: new Date().toISOString() }).eq('sender_id', friendId).eq('receiver_id', user.id).is('read_at', null).select('id');
      },

      async uploadMedia(file: Blob, path: string): Promise<string> {
          const client = ensureSupabase();
          const { data, error } = await client.storage.from('chat-media').upload(path, file, { upsert: true, contentType: file.type || 'application/octet-stream' });
          if (error) throw error;
          const { data: urlData } = client.storage.from('chat-media').getPublicUrl(path);
          return `${urlData.publicUrl}?t=${Date.now()}`; 
      },

      async getTotalUnreadCount(): Promise<number> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return 0;
          const { count } = await client.from('direct_messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).is('read_at', null);
          return count || 0;
      },

      async uploadGraffiti(friendId: string, blob: Blob): Promise<string> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) throw new Error("Not authenticated");
          const ids = [user.id, friendId].sort();
          const friendshipFileId = `${ids[0]}_${ids[1]}`;
          const path = `graffiti/${friendshipFileId}_${Date.now()}.png`;
          return this.uploadMedia(blob, path);
      },

      async getGraffitiUrl(friendId: string): Promise<string | null> {
          const client = ensureSupabase();
          const { data: authData } = await client.auth.getUser();
          const user = authData?.user;
          if (!user) return null;
          const ids = [user.id, friendId].sort();
          const friendshipFileId = `${ids[0]}_${ids[1]}`;
          const { data: list } = await client.storage.from('chat-media').list('graffiti', { limit: 1, sortBy: { column: 'created_at', order: 'desc' }, search: friendshipFileId });
          if (!list || list.length === 0) return null;
          const { data: urlData } = client.storage.from('chat-media').getPublicUrl(`graffiti/${list[0].name}`);
          return `${urlData.publicUrl}?t=${Date.now()}`;
      }
  }
};
