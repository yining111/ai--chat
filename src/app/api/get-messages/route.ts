import { getMessagesByChatId } from "@/src/db";
import { auth } from "@clerk/nextjs/server";


export async function POST(req: Request) {
  const { chatId, chat_user_id } = await req.json();

  const {userId}=await auth();
  if (!userId || userId !== chat_user_id || !chatId) {
    return new Response(JSON.stringify({ error: "未授权" }), { 
        status: 401 });
  }

  // 将 chatId 转换为数字
  const chatIdNum = Number(chatId);
  if (isNaN(chatIdNum)) {
    return new Response(JSON.stringify({ error: "无效的聊天 ID" }), { 
        status: 400 });
  }
  
  const messages = await getMessagesByChatId(chatIdNum);
  
  if (!messages) {
    return new Response(JSON.stringify([]), { 
        status: 200 });
  }
  
  return new Response(JSON.stringify(messages), { 
      status: 200 });
}