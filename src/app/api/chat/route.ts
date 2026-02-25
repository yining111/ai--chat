import { auth } from "@clerk/nextjs/server";
import { createMessage } from "@/src/db";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { streamText } from "ai";


export const maxDuration = 30;

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.BASE_URL,
})

export async function POST(req: Request) {
  const { messages, chatId, chat_user_id } = await req.json();

  const { userId } = await auth();
  if (!userId || userId !== chat_user_id || !chatId) {
    return new Response(JSON.stringify({ error: "未授权" }), { status: 401 });
  }

  // 将 chatId 转换为数字
  const chatIdNum = Number(chatId);
  if (isNaN(chatIdNum)) {
    return new Response(JSON.stringify({ error: "无效的聊天 ID" }), { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  await createMessage(chatIdNum, lastMessage.role, lastMessage.content);
  const result = streamText({
    model: deepseek('deepseek-v3'),
    system: '你是一个专业的助手',
    messages,
    onFinish: async (result) => {
      await createMessage(chatIdNum, 'assistant', result.text);
    }
  });
  return result.toTextStreamResponse()
}
