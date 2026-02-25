import { auth } from "@clerk/nextjs/server";
import { createChat } from "@/src/db";

export async function POST(req: Request) {
  const { model, title } = await req.json();
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("userId 不能为空");
  }
  
  const newChat = await createChat(userId, title, model);
  
  return new Response(JSON.stringify({ id: newChat?.id }), {
    status: 200,
  });
}