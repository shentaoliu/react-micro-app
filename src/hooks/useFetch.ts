import { useState, useEffect, useRef } from 'react';

// ==========================================
// 核心：自定义 useFetch Hook
// 面试亮点：
// 1. 封装通用逻辑 (loading, error, data)
// 2. 解决竞态条件 (AbortController)
// 3. 依赖项优化 (JSON.stringify)
// ==========================================
export const useFetch = (url: string | null, options?: RequestInit) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 使用 useRef 来存储 AbortController，以便在组件卸载或发起新请求时取消上一个请求
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 如果 url 为 null (比如尚未输入搜索关键词时)，不发起请求
    if (!url) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // 每次发起新请求前，先取消上一次未完成的请求，解决“竞态条件”
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal, // 将 signal 传递给 fetch
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (e: any) {
        // 如果是因为主动取消请求导致的报错，不需要更新状态，避免覆盖最新的请求状态
        if (e.name !== 'AbortError') {
          setError(e);
        }
      } finally {
        // 确保只有当前 controller 没被取消时，才去改 loading 状态
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // 清理函数：组件卸载或 url 变化时，中断当前请求
    return () => {
      controller.abort();
    };
  }, [url, options ? JSON.stringify(options) : null]); // 序列化 options 作为依赖，防止对象引用变化导致死循环

  return { data, loading, error };
};
