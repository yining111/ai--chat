import { integer, sqliteTable, text} from "drizzle-orm/sqlite-core";



export const chatTable = sqliteTable("chats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  model: text("model").notNull(),
  
});

export const messagesTable = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: integer("chat_id").references(() => chatTable.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
});
export type ChatModel = typeof chatTable.$inferSelect;
export type MessageModel = typeof messagesTable.$inferSelect; 