
import { supabase } from './supabase';
import { ChatSession, Message, SavedItem, BibleHighlight, UserProfile, FriendRequest, DirectMessage, Achievement } from '../types';

const ensureSupabase = () => {
    if (!supabase) throw new Error("Database not connected.");
}

export const db = {
  async getUserChats(): Promise<ChatSession[]> {
    ensureSupabase();
    // @ts-ignore
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // @ts-ignore
    const { data: chatsData, error: chatsError } = await supabase
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
    ensureSupabase();
    // @ts-ignore
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const chatData: any = { user_id: user.id, title };
    if (id) chatData.id = id;

    // @ts-ignore
    const { data: chat, error: chatError } = await supabase
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
    ensureSupabase();
    // @ts-ignore
    const { error: msgError } = await supabase.from('messages').delete().eq('chat_id', chatId);
    if (msgError) console.warn("Message deletion warning:", msgError);

    // @ts-ignore
    const { error } = await supabase.from('chats').delete().eq('id', chatId);
    if (error) throw error;
  },

  async updateChatTitle(chatId: string, title: string) {
    ensureSupabase();
    // @ts-ignore
    const { error } = await supabase.from('chats').update({ title }).eq('id', chatId);
    if (error) throw error;
  },

  async addMessage(chatId: string, message: Message): Promise<Message[]> {
    ensureSupabase();
    // @ts-ignore
    const { data, error } = await supabase
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

  async getSavedItems(): Promise<SavedItem[]> {
      ensureSupabase();
      // @ts-ignore
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // @ts-ignore
      const { data, error } = await supabase
          .from('saved_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      
      if (error) throw error;

      return (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id, // Map owner ID
          type: item.type as 'verse' | 'chat',
          content: item.content,
          reference: item.reference,
          date: new Date(item.created_at).getTime(),
          metadata: item.metadata || {}
      }));
  },

  async saveItem(item: SavedItem) {
      ensureSupabase();
      // @ts-ignore
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // @ts-ignore
      const { error } = await supabase
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
          if (error.code === 'PGRST204' || error.message.includes('metadata')) {
              console.error("CRITICAL SQL FIX REQUIRED: Please run 'ALTER TABLE saved_items ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;' in your Supabase SQL Editor.");
          }
          throw error;
      }
  },

  async updateSavedItem(id: string, updates: Partial<SavedItem>) {
      ensureSupabase();
      // @ts-ignore
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dbUpdates: any = {};
      if (updates.content) dbUpdates.content = updates.content;
      if (updates.metadata) dbUpdates.metadata = updates.metadata;
      
      // @ts-ignore
      const { error } = await supabase
          .from('saved_items')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', user.id); 

      if (error) throw error;
  },

  async deleteSavedItem(id: string) {
      ensureSupabase();
      // @ts-ignore
      const { error } = await supabase.from('saved_items').delete().eq('id', id);
      if (error) throw error;
  },

  async getHighlights(): Promise<BibleHighlight[]> {
      ensureSupabase();
      // @ts-ignore
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // @ts-ignore
      const { data, error } = await supabase.from('highlights').select('*').eq('user_id', user.id);
      if (error) throw error;

      return (data || []).map((h: any) => ({
          id: h.id,
          ref: h.ref,
          color: h.color as 'yellow'|'green'|'blue'|'pink'
      }));
  },

  async addHighlight(highlight: BibleHighlight) {
      ensureSupabase();
      // @ts-ignore
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // @ts-ignore
      const { error } = await supabase.from('highlights').insert({ user_id: user.id, ref: highlight.ref, color: highlight.color });
      if (error) throw error;
  },

  async deleteHighlight(ref: string) {
      ensureSupabase();
      // @ts-ignore
      const { error } = await supabase.from('highlights').delete().eq('ref', ref);
      if (error) throw error;
  },
  
  prayers: {
      async getCommunityPrayers(): Promise<SavedItem[]> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];

          // 1. Fetch current user's friends to validate 'friends' visibility
          // @ts-ignore
          const { data: friendshipData } = await supabase
              .from('friendships')
              .select('requester_id, receiver_id')
              .eq('status', 'accepted')
              .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
          
          const friendIds = (friendshipData || []).map((f: any) => 
              f.requester_id === user.id ? f.receiver_id : f.requester_id
          );

          // 2. Fetch ALL prayers (limit to recent 100)
          // RLS POLICY MUST ALLOW SELECT ON type='prayer' FOR THIS TO WORK
          // @ts-ignore
          const { data, error } = await supabase
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

              // Always see my own prayers
              if (ownerId === user.id) {
                  isVisible = true;
              } 
              // Public prayers
              else if (vis === 'public') {
                  isVisible = true;
              } 
              // Friends only prayers
              else if (vis === 'friends') {
                  if (friendIds.includes(ownerId)) {
                      isVisible = true;
                  }
              } 
              // Specific people
              else if (vis === 'specific' && meta.allowed_users) {
                  if (Array.isArray(meta.allowed_users) && meta.allowed_users.includes(user.id)) {
                      isVisible = true;
                  }
              }

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
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
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
          
          // @ts-ignore
          const { error } = await supabase.from('saved_items').update({ metadata: newMetadata }).eq('id', prayerId);
          if (error) throw error;

          return newMetadata;
      }
  },

  social: {
      async heartbeat() {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          // @ts-ignore
          await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
      },

      async checkShareIdExists(shareId: string): Promise<boolean> {
          ensureSupabase();
          // @ts-ignore
          const { data, error } = await supabase.from('profiles').select('id').eq('share_id', shareId).maybeSingle();
          return !!data;
      },

      async upsertProfile(shareId: string, displayName: string, avatar?: string, bio?: string) {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // @ts-ignore
          const { data: existing } = await supabase.from('profiles').select('share_id').eq('id', user.id).maybeSingle();
          let finalIdToSave = shareId;
          if (existing && existing.share_id) { finalIdToSave = existing.share_id; }

          const updates: any = { id: user.id, display_name: displayName, avatar: avatar || null, bio: bio || null, share_id: finalIdToSave, last_seen: new Date().toISOString() };

          // @ts-ignore
          const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });
          if (error) console.error("Profile sync failed", error);
          return finalIdToSave;
      },
      
      async updateProfileStats(streak: number, achievements?: Achievement[]) {
          ensureSupabase();
           // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          const updates: any = { streak };
          if (achievements) {
              updates.achievements = achievements;
          }
          
          // @ts-ignore
          const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
          if (error) {
              if (error.code === 'PGRST204' || error.message.includes('achievements')) {
                  console.error("CRITICAL SQL FIX REQUIRED: Please run 'ALTER TABLE profiles ADD COLUMN achievements jsonb DEFAULT '[]'::jsonb;' in your Supabase SQL Editor.");
              }
          }
      },
      
      async addAchievement(achievement: Achievement) {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          // @ts-ignore
          const { data } = await supabase.from('profiles').select('achievements').eq('id', user.id).single();
          const current: Achievement[] = data?.achievements || [];
          
          // Avoid duplicates
          if (current.some(a => a.id === achievement.id)) return;
          
          const newSet = [...current, achievement];
          
          // @ts-ignore
          const { error } = await supabase.from('profiles').update({ achievements: newSet }).eq('id', user.id);
          
          if (error) {
               if (error.code === 'PGRST204' || error.message.includes('achievements')) {
                  console.error("CRITICAL SQL FIX REQUIRED: Please run 'ALTER TABLE profiles ADD COLUMN achievements jsonb DEFAULT '[]'::jsonb;' in your Supabase SQL Editor.");
              }
              throw error;
          }
          return newSet;
      },

      async getUserProfile(userId: string): Promise<UserProfile | null> {
          ensureSupabase();
          
          // TRY 1: Get Everything
          try {
              // @ts-ignore
              const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle(); 
              if (!error && data) return data as UserProfile;
          } catch (e) {}

          // TRY 2: Fallback (If achievements column missing, select only base fields)
          try {
              // @ts-ignore
              const { data, error } = await supabase.from('profiles')
                  .select('id, share_id, display_name, avatar, bio, last_seen, streak')
                  .eq('id', userId)
                  .maybeSingle();
                  
              if (error || !data) return null;
              
              // Return mock empty achievements to satisfy type
              return { ...data, achievements: [] } as UserProfile;
          } catch (e) {
              console.error("Failed to load profile", e);
              return null;
          }
      },
      
      async getCurrentUser(): Promise<UserProfile | null> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return null;
          return this.getUserProfile(user.id);
      },

      async searchUserByShareId(shareId: string): Promise<UserProfile | null> {
          ensureSupabase();
          // @ts-ignore
          const { data, error } = await supabase.from('profiles').select('*').eq('share_id', shareId).maybeSingle();
          if (error || !data) return null;
          return data as UserProfile;
      },

      async sendFriendRequest(targetUserId: string) {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase!.auth.getUser();
          if (!user) throw new Error('Not authenticated');
          if (user.id === targetUserId) throw new Error("You cannot add yourself.");

          // @ts-ignore
          const { data: existing } = await supabase!.from('friendships').select('*').or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${user.id})`).maybeSingle();
          if (existing) throw new Error("Request already sent or you are already friends.");

          // @ts-ignore
          const { error } = await supabase!.from('friendships').insert({ requester_id: user.id, receiver_id: targetUserId, status: 'pending' });
          if (error) throw error;
      },

      async getIncomingRequests(): Promise<FriendRequest[]> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];

          // @ts-ignore
          const { data, error } = await supabase.from('friendships').select(`id, created_at, status, requester:profiles!requester_id ( id, share_id, display_name, avatar, bio )`).eq('receiver_id', user.id).eq('status', 'pending');
          if (error) throw error;
          
          return (data || [])
            .filter((r: any) => r.requester !== null)
            .map((r: any) => ({ id: r.id, status: r.status, created_at: r.created_at, requester: r.requester }));
      },

      async respondToRequest(requestId: string, accept: boolean) {
          ensureSupabase();
          if (accept) {
              // @ts-ignore
              const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
              if (error) throw error;
          } else {
              // @ts-ignore
              const { error } = await supabase.from('friendships').delete().eq('id', requestId);
              if (error) throw error;
          }
      },

      async removeFriend(friendId: string) {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          // @ts-ignore
          await supabase.from('friendships').delete().eq('requester_id', user.id).eq('receiver_id', friendId);
          // @ts-ignore
          await supabase.from('friendships').delete().eq('requester_id', friendId).eq('receiver_id', user.id);
      },

      async getFriends(): Promise<UserProfile[]> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];

          // @ts-ignore
          const { data, error } = await supabase.from('friendships').select(`requester:profiles!requester_id(*), receiver:profiles!receiver_id(*)`).eq('status', 'accepted').or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
          if (error) throw error;

          const friends: UserProfile[] = [];
          (data || []).forEach((row: any) => {
              if (row.requester && row.requester.id) {
                 if(row.requester.id !== user.id) friends.push(row.requester);
              } 
              if (row.receiver && row.receiver.id) {
                 if(row.receiver.id !== user.id) friends.push(row.receiver);
              }
          });

          // @ts-ignore
          const { data: unreadData } = await supabase.from('direct_messages').select('sender_id').eq('receiver_id', user.id).is('read_at', null);
          const unreadMap = new Map();
          unreadData?.forEach((m: any) => { unreadMap.set(m.sender_id, (unreadMap.get(m.sender_id) || 0) + 1); });

          // @ts-ignore
          const { data: latestMsgs } = await supabase.from('direct_messages')
            .select('sender_id, receiver_id, created_at')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(200);
            
          const latestMap = new Map();
          latestMsgs?.forEach((m: any) => {
              const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
              if (!latestMap.has(otherId)) latestMap.set(otherId, m.created_at);
          });

          return friends.map(f => ({ ...f, unread_count: unreadMap.get(f.id) || 0, last_message_at: latestMap.get(f.id) || '' }));
      },
      
      async getMessages(friendId: string): Promise<DirectMessage[]> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];

          // @ts-ignore
          const { data, error } = await supabase.from('direct_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`).order('created_at', { ascending: true });
          if (error) throw error;
          return data || [];
      },

      async sendMessage(friendId: string, content: string, type: 'text'|'image'|'audio' = 'text'): Promise<DirectMessage> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          // @ts-ignore
          const { data, error } = await supabase.from('direct_messages').insert({ sender_id: user.id, receiver_id: friendId, content: content, message_type: type }).select().single();
          if (error) throw error;
          return data;
      },

      async deleteDirectMessage(messageId: string) {
          ensureSupabase();
          // @ts-ignore
          const { error } = await supabase.from('direct_messages').delete().eq('id', messageId);
          if (error) throw error;
      },

      async markMessagesRead(friendId: string) {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // @ts-ignore
          await supabase.from('direct_messages').update({ read_at: new Date().toISOString() }).eq('sender_id', friendId).eq('receiver_id', user.id).is('read_at', null).select('id');
      },

      async uploadMedia(file: Blob, path: string): Promise<string> {
          ensureSupabase();
          // @ts-ignore
          // Explicitly define Content-Type based on blob type or fallback
          const fileOptions = {
              upsert: true,
              contentType: file.type || 'application/octet-stream',
              cacheControl: '3600'
          };

          // @ts-ignore
          const { data, error } = await supabase.storage.from('chat-media').upload(path, file, fileOptions);
          
          if (error) {
              console.error("Storage upload error:", error);
              const msg = error.message || "Unknown Upload Error";
              
              // Handle "Unexpected token <" (HTML error) which implies bad session or 403
              if (msg.includes('<') || msg.includes('html') || msg.includes('row-level security')) {
                  // Fallback: If Overwrite failed (Permission Denied for UPDATE), try Deleting then Re-uploading (INSERT)
                  try {
                      console.log("Attempting overwrite fallback (Delete then Insert)...");
                      // @ts-ignore
                      await supabase.storage.from('chat-media').remove([path]);
                      // Retry upload
                      // @ts-ignore
                      const { error: retryError } = await supabase.storage.from('chat-media').upload(path, file, fileOptions);
                      if (retryError) throw retryError;
                  } catch (fallbackError: any) {
                      // CRITICAL: If still failing with HTML/Token error, user session is corrupt.
                      if (msg.includes('<') || msg.includes('html')) {
                          // Force logout if we can access auth, otherwise throw specific error
                          // @ts-ignore
                          if (supabase?.auth) {
                              console.warn("Session expired. Signing out.");
                              // @ts-ignore
                              await supabase.auth.signOut();
                              window.location.reload();
                          }
                          throw new Error("Your session has expired. Please sign in again.");
                      }
                      throw new Error(`Permission Denied.`);
                  }
              } else {
                  throw new Error(`Upload Failed.`);
              }
          }
          
          // @ts-ignore
          const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(path);
          return `${urlData.publicUrl}?t=${Date.now()}`; 
      },

      async getTotalUnreadCount(): Promise<number> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return 0;
          // @ts-ignore
          const { count } = await supabase.from('direct_messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).is('read_at', null);
          return count || 0;
      },

      async uploadGraffiti(friendId: string, blob: Blob): Promise<string> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");
          if (!friendId) throw new Error("Invalid friend ID for drawing");

          const ids = [user.id, friendId].sort();
          const friendshipFileId = `${ids[0]}_${ids[1]}`;
          
          // FIX: Clean up any old files from this specific user for this pair to save space
          // Note: We can only delete files WE own. 
          try {
              // List files that look like our pattern
              // @ts-ignore
              const { data: oldFiles } = await supabase.storage.from('chat-media').list('graffiti', { search: friendshipFileId });
              if (oldFiles && oldFiles.length > 0) {
                  const filesToDelete = oldFiles.map((f: any) => `graffiti/${f.name}`);
                  // Best effort delete - if we don't own them, this will fail silently/gracefully usually
                  // @ts-ignore
                  await supabase.storage.from('chat-media').remove(filesToDelete);
              }
          } catch (cleanupError) {
              console.warn("Cleanup failed (likely permission), proceeding to upload new file", cleanupError);
          }

          // FIX: Use Unique Timestamp to bypass "Overwrite" permission lock
          // This forces a "Create" action which is always allowed.
          const path = `graffiti/${friendshipFileId}_${Date.now()}.png`;

          return this.uploadMedia(blob, path);
      },

      async getGraffitiUrl(friendId: string): Promise<string | null> {
          ensureSupabase();
          // @ts-ignore
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return null;

          const ids = [user.id, friendId].sort();
          const friendshipFileId = `${ids[0]}_${ids[1]}`;

          try {
              // Search for ANY file starting with this pair ID
              // @ts-ignore
              const { data: list, error } = await supabase.storage.from('chat-media').list('graffiti', {
                  limit: 10,
                  sortBy: { column: 'created_at', order: 'desc' }, // Get newest first
                  search: friendshipFileId
              });
              
              if (error) return null;
              if (!list || list.length === 0) return null;
              
              // The first one is the newest
              const fileMetadata = list[0];
              const path = `graffiti/${fileMetadata.name}`;
              
              // @ts-ignore
              const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(path);
              
              // Force cache bust
              return `${urlData.publicUrl}?t=${new Date(fileMetadata.created_at).getTime()}`;
          } catch (e) {
              console.warn("Error fetching graffiti", e);
              return null;
          }
      }
  }
};
