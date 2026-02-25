'use client';
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { ChatModel } from "../db/schema";

type SiderProps = {};
const Sider = (props: SiderProps) => {
    const { user } = useUser();
    const router = useRouter();

    const { data: chats } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => {
            return axios.post('/api/get-chats');
        },
        enabled: !!user?.id
    });
    const pathname = usePathname();
    return (
        <div className="h-screen bg-gray-50">
            <div className="flex items-center justify-center">
                <p className="font-bold text-2xl">
                    Ai-chat
                </p>
            </div>
            <div 
                className="h-10 flex items-center justify-center mt-4 cursor-pointer"
                onClick={() => {
                    router.push('/');
                }}
            >
                <p className="h-full w-2/3 bg-blue-100 rounded-lg flex items-center
                justify-center font-thin">
                    创建新对话
                </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 p-6">
                {chats?.data?.map((chat: ChatModel) => (
                    <div 
                        className="w-full h-10"
                        key={chat.id}
                        onClick={() => {
                            router.push(`/chat/${chat.id}`);
                        }}
                    >
                        <p className={`font-extralight text-sm line-clamp-1 ${pathname 
                        === `/chat/${chat.id}` ? 'text-blue-700' : ''}`}>
                            {chat.title}
                        </p>

                    </div>
                ))}
            </div>
        </div>
    );
};
export default Sider;