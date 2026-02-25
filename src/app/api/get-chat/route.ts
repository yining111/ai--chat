import { getChat } from "@/src/db";
import { auth } from "@clerk/nextjs/server";


export async function POST(req: Request) {
  const { chatId } = await req.json();

  const {userId}=await auth();
  if (!userId || !chatId) {
    return new Response(JSON.stringify({ error: "未授权" }), { 
        status: 401 });
  }
  
  // 将 chatId 转换为数字
  const chatIdNum = Number(chatId);
  if (isNaN(chatIdNum)) {
    return new Response(JSON.stringify({ error: "无效的聊天 ID" }), { 
        status: 400 });
  }
  
  const chat = await getChat(userId, chatIdNum);
  
  if (!chat) {
    return new Response(JSON.stringify({ error: "未找到聊天" }), { 
        status: 404 });
  }
  
  return new Response(JSON.stringify(chat), { 
      status: 200 });
}