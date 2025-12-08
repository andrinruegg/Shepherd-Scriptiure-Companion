import { supabase } from './supabase';
import { ChatSession, Message } from '../types';

const ensureSupabase = () => {
    if (!supabase) throw new Error("Database not connected.");
}

export const db = {
  /**
   * Fetch all chats and their messages for the current user.
   */
  async getUserChats(): Promise<ChatSession[]> {
    ensureSupabase();
    // @ts-ignore - we checked ensureSupabase
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

    // Transform DB shape to App shape
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

  /**
   * Create a new chat session.
   */
  async createChat(title: string = 'New Conversation', initialMessage?: Message): Promise<ChatSession> {
    ensureSupabase();
    // @ts-ignore
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // @ts-ignore
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({ user_id: user.id, title })
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

  /**
   * Delete a chat and its messages.
   * Performs manual cascade delete to be safe.
   */
  async deleteChat(chatId: string) {
    ensureSupabase();
    
    // 1. Manually delete messages first (Safe Fallback)
    // @ts-ignore
    const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);
    
    if (msgError) console.warn("Message deletion warning:", msgError);

    // 2. Delete the chat itself
    // @ts-ignore
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);
    
    if (error) throw error;
  },

  /**
   * Rename a chat.
   */
  async updateChatTitle(chatId: string, title: string) {
    ensureSupabase();
    // @ts-ignore
    const { error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId);

    if (error) throw error;
  },

  /**
   * Add a message to a chat.
   */
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
  }
};