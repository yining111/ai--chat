
'use client';

import { useRef, useEffect, useState } from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';



export default function Page() {
    const { chat_id } = useParams();
    const {data:chat}=useQuery({
        queryKey: ['chat', chat_id],
        queryFn: async () => {
          return axios.post(`/api/get-chat`,{
            chatId: chat_id,
          });
        },
      });
  const [model, setModel] = useState('deepseek-v3')

  const {data:previousMessages}=useQuery({
    queryKey: ['messages', chat_id],
    queryFn: async () => {
      return axios.post(`/api/get-messages`,{
        chatId: chat_id,
        chat_user_id: chat?.data?.userId,
      });
    },
    enabled:!!chat?.data?.id,
  })

  // 使用 useState 手动管理输入
  const [input, setInput] = useState('');

  // 移除 useChat 钩子，手动处理消息
  const [messages, setMessages] = useState<Array<{id: string, role: string, text: string}>>(previousMessages?.data || []);

  const handleSubmit = async () => {
    if (input.trim()) {
      // 添加用户消息
      const newUserMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        text: input,
      };
      setMessages(prev => [...prev, newUserMessage]);
      setInput('');

      // 发送到 API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, newUserMessage],
            chatId: chat_id,
            chat_user_id: chat?.data?.userId,
            model: model,
          }),
        });

        // 处理流式响应
        if (response.ok) {
          const reader = response.body?.getReader();
          if (reader) {
            let aiResponse = '';
            const newAiMessageId = (Date.now() + 1).toString();
            
            // 添加 AI 消息占位符
            const aiMessagePlaceholder = {
              id: newAiMessageId,
              role: 'assistant' as const,
              text: '',
            };
            setMessages(prev => [...prev, aiMessagePlaceholder]);

            // 读取流式响应
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = new TextDecoder().decode(value);
              aiResponse += chunk;
              
              // 更新 AI 消息
              setMessages(prev => prev.map(msg => 
                msg.id === newAiMessageId ? { ...msg, text: aiResponse } : msg
              ));
            }
          }
        }
      } catch (error) {
        console.error('发送消息失败:', error);
      }
    }
  }

  const handleChangeModel = () => {
    setModel(model === 'deepseek-v3' ? 'deepseek-r1' : 'deepseek-v3');
  }

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (endRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleFirstMessage=async(currentModel:string)=>{
    if (chat?.data?.title && previousMessages?.data?.length === 0) {
      // 添加用户消息
      const newUserMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        text: chat?.data?.title,
      };
      setMessages(prev => [...prev, newUserMessage]);

      // 发送到 API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [newUserMessage],
            chatId: chat_id,
            chat_user_id: chat?.data?.userId,
            model: currentModel,
          }),
        });

        // 处理流式响应
        if (response.ok) {
          const reader = response.body?.getReader();
          if (reader) {
            let aiResponse = '';
            const newAiMessageId = (Date.now() + 1).toString();
            
            // 添加 AI 消息占位符
            const aiMessagePlaceholder = {
              id: newAiMessageId,
              role: 'assistant' as const,
              text: '',
            };
            setMessages(prev => [...prev, aiMessagePlaceholder]);

            // 读取流式响应
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = new TextDecoder().decode(value);
              aiResponse += chunk;
              
              // 更新 AI 消息
              setMessages(prev => prev.map(msg => 
                msg.id === newAiMessageId ? { ...msg, text: aiResponse } : msg
              ));
            }
          }
        }
      } catch (error) {
        console.error('发送消息失败:', error);
      }
    }
  }

  useEffect(()=>{
    if (chat?.data?.model) {
      setModel(chat?.data?.model);
    }
    if (chat?.data?.title && previousMessages?.data?.length === 0) {
      handleFirstMessage(chat?.data?.model || 'deepseek-v3');
    }
  },[chat?.data?.title, previousMessages?.data])

  return (
    <div className="flex flex-col h-screen justify-between items-center">
      <div className ="flex flex-col w-2/3 gap-8 overflow-auto justify-between flex-1">
      <div className="h-4"></div>
      <div className="flex flex-col gap-8 flex-1">
        {messages?.map(message => (
          <div key={message.id}
            className={`flex flex-row rounded-lg ${message.role === 'assistant' ? 'justify-start mr-18' : "justify-end ml-10"}`}>
            <div className={`inline-block p-2 rounded-lg max-w-3xl ${message?.role === 'assistant' ? 'bg-blue-300' : 'bg-slate-100'}`}>
              <ReactMarkdown>{message?.text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <div className="h-4" ref={endRef} />

      </div>

<div className="flex flex-col items-center justify-center mt-4 shadow-lg
                border-[1px] border-gray-300 rounded-lg h-32 rounded-lg w-2/3">
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

  );
}
