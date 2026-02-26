'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 懒加载的404页面组件
const NotFoundContent = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/');
    }
  }, [countdown, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">页面未找到</p>
      <p className="text-gray-500 mb-4">抱歉，您访问的页面不存在或已被删除</p>
      <p className="text-gray-400">
        {countdown > 0 ? `将在 ${countdown} 秒后跳转到首页...` : '正在跳转...'}
      </p>
    </div>
  );
};

// 主404页面，使用懒加载
export default function NotFound() {
  return (
    <div>
      <NotFoundContent />
    </div>
  );
}