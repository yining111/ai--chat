
'use client';

import { useState, useEffect } from "react"
import { CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';



export default function Home () {
    const [input, setInput] = useState('')
    const [model, setModel] = useState('deepseek-v3')
    const handleChangeModel = () => {
        setModel(model === 'deepseek-v3' ? 'deepseek-r1' : 'deepseek-v3');
    }
    const queryClient = useQueryClient();
    const router = useRouter();
    const {user} = useUser();
    const { mutate: createChat} = useMutation({
    mutationFn: async()=>{
      return axios.post('/api/create-chat',{
        model: model,
        title:input
      })
    },
    onSuccess: (data) => {
      router.push(`/chat/${data.data.id}`);
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  const handleSubmit = () => {
    if (input.trim() === '') {return;}
    createChat();
  }

  // 移到 useEffect 中避免在渲染过程中导航
  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }
    return (
        <div className="h-screen flex flex-col items-center ">
            <div className="h-1/5"></div>
            <div className="w-1/2">
                <p className="text-bold text-2xl text-center">
                    你好，我可以回答你的问题。
                </p>

                <div className="flex flex-col items-center justify-center mt-4 shadow-lg 
                border-[1px] border-gray-300 rounded-lg h-32 ">
                    <textarea className="w-full rounded-lg p-3 h-30 focus:outline-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}>
                    </textarea>
                    <div className="flex flex-row items-center justify-between w-full h-12 mb-2">
                        <div>
                            <div className={`flex flex-row items-center justify-center rounded-lg border-[1px]
                            px-2 py-1 ml-2 cursor-pointer ${model === 'deepseek-r1' ? "bg-blue-300 bg-blue-200" : "bg-gray-200"}`}
                            onClick={handleChangeModel}>
                                <p className="text-sm ">
                                深度思考
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center border-2 mr-4 border-black p-1 rounded-full"
                        onClick={handleSubmit}>
                            <CheckCircleOutlined />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
