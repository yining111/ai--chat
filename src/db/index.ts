import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { chatTable, messagesTable } from './schema';
import { eq, and } from 'drizzle-orm';

const client = createClient({
  url: 'file:./local.db',
})
const db = drizzle({client});
export default db;

export const createChat = async (userId: string, title: string, model: string) => {
  try {
    const [newChat] = await db.insert(chatTable).values({
      userId,
      title,
      model,
    }).returning()
    return newChat
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
}

export const getChat = async (userId: string, id: number) => {
  try {
    const chat = await db.select().from(chatTable).where(and(eq(chatTable.userId, userId), eq(chatTable.id, id)));
    if (chat.length === 0) {
      return null;
    }
    return chat[0];
  } catch (error) {
    console.error('Error fetching chat:', error);
    return null;
  }
}   

export const getChats = async (userId: string) => {
  try {
    const chats = await db.select().from(chatTable).where(eq(chatTable.userId, userId)).orderBy(chatTable.id);
    return chats;
  } catch (error) {
    console.error('Error fetching chats:', error);
    return null;
  }
}

export const createMessage = async (chatId: number, role: string, content: string) => {
  try {
    const [newMessage] = await db.insert(messagesTable).values({
      chatId: chatId,
      role: role,
      content: content,
    }).returning()
    return newMessage
  } catch (error) {
    console.error('Error creating message:', error);
    return null;
  }
}

export const getMessagesByChatId = async (chatId: number) => {
  try {
    const messages = await db.select().from(messagesTable).where(eq(messagesTable.chatId, chatId));
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return null;
  }
}
