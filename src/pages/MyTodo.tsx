import { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Input,
  List,
  Typography,
  message,
  Divider,
  Space,
} from "antd";

const { Title, Paragraph, Text } = Typography;

function MyTodo() {
  const [keyword, setKeyword] = useState("react");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [normalLoading, setNormalLoading] = useState(false);
  const [corsLoading, setCorsLoading] = useState(false);
  const [corsResult, setCorsResult] = useState("");

  // --- postMessage 相关状态 ---
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeMessages, setIframeMessages] = useState<string[]>([]);
  const [pmInput, setPmInput] = useState("你好，iframe！");

  // 初始化监听 iframe 发来的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("handleMessage event====11", event);
      // 真实项目中这里需要校验 event.origin，例如：
      // if (event.origin !== "http://expected-domain.com") return;

      // 过滤掉非我们自定义的格式消息（比如 react-dev-tools 的消息）
      if (event.data && event.data.type === "REPLY") {
        console.log("主窗口收到消息:", event.data);
        setIframeMessages((prev) => [
          ...prev,
          `[来自 iframe]: ${event.data.message}`,
        ]);
        message.success("收到 iframe 的回复");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 向 iframe 发送消息
  const sendMessageToIframe = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      message.error("Iframe 尚未加载完成");
      return;
    }

    const dataToSend = {
      type: "GREETING",
      message: pmInput,
      timestamp: Date.now(),
    };

    // 使用 postMessage 发送数据，第二个参数 '*' 表示不限制接收方的源（生产环境建议写死目标 origin 以保安全）
    iframeRef.current.contentWindow.postMessage(dataToSend, "*");
    setIframeMessages((prev) => [...prev, `[发给 iframe]: ${pmInput}`]);
  };

  // 核心：JSONP 请求的实现
  const handleJsonpRequest = () => {
    if (!keyword.trim()) {
      message.warning("请输入搜索词");
      return;
    }

    setLoading(true);

    // 1. 生成全局唯一的回调函数名，防止并发请求冲突
    const callbackName = `jsonp_callback_${Date.now()}_${Math.round(Math.random() * 10000)}`;

    // 2. 在全局 window 对象上挂载该回调函数，以便跨域脚本执行时能调用到
    (window as any)[callbackName] = (data: any) => {
      console.log("JSONP 成功返回数据:", data);
      // 百度搜索建议 API 返回的数据结构中，`s` 数组包含了建议的关键词列表
      setResults(data.s || []);
      setLoading(false);

      // 4. 清理工作：执行完毕后移除 script 标签和全局回调函数，避免内存泄漏
      delete (window as any)[callbackName];
      document.body.removeChild(script);
    };

    // 3. 动态创建 <script> 标签并发起跨域请求
    const script = document.createElement("script");
    // 这里以百度搜索建议的开放 API 为例。
    // 注意：百度 API 使用 `cb` 参数作为 JSONP 的回调函数名标识，有些 API 可能是 `callback`
    script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(keyword)}&cb=${callbackName}`;

    // 错误处理（例如网络不通）
    script.onerror = () => {
      message.error("JSONP 请求失败");
      setLoading(false);
      // 出错时同样需要进行清理
      delete (window as any)[callbackName];
      document.body.removeChild(script);
    };

    // 将 script 标签挂载到 DOM 中，此时浏览器会自动发出 GET 请求获取跨域脚本
    document.body.appendChild(script);
  };

  // 普通 AJAX 请求示例（会因同源策略报错，或者请求非跨域接口）
  const handleNormalRequest = async () => {
    if (!keyword.trim()) {
      message.warning("请输入搜索词");
      return;
    }

    setNormalLoading(true);
    try {
      // 这里直接请求跨域接口，在控制台会看到 CORS 错误
      // 真实项目中这里应该是请求同源接口：如 fetch('/api/search')
      const response = await fetch(
        `https://suggestion.baidu.com/su?wd=${encodeURIComponent(keyword)}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 注意：百度这个接口返回的是 js 脚本而不是 json，所以即便跨域配置了这里用 json 解析也会报错
      // 这里仅作演示同源策略的拦截
      const data = await response.json();
      console.log("普通请求成功:", data);
      setResults(data.s || []);
      message.success("普通请求成功");
    } catch (error: any) {
      console.error("普通请求失败:", error);
      message.error(`普通请求失败 (CORS 拦截): ${error.message}`);
      setResults([]);
    } finally {
      setNormalLoading(false);
    }
  };

  // --- CORS 跨域请求示例 ---
  const handleCorsRequest = async () => {
    setCorsLoading(true);
    setCorsResult("");
    try {
      // 访问我们自己搭建的本地 Node 服务 (端口 3001，与当前页面的端口不同，形成跨域)
      const response = await fetch("http://localhost:3001/api/data");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("CORS 请求成功:", data);
      setCorsResult(JSON.stringify(data, null, 2));
      message.success("CORS 跨域请求成功");
    } catch (error: any) {
      console.error("CORS 请求失败:", error);
      message.error(`CORS 请求失败: ${error.message}`);
      setCorsResult(`请求失败: ${error.message}`);
    } finally {
      setCorsLoading(false);
    }
  };

  return (
    <Card style={{ minHeight: "100%", maxWidth: "800px" }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        JSONP 跨域请求示例
      </Title>
      <Paragraph type="secondary">
        由于浏览器的同源策略，AJAX 无法直接请求跨域接口。JSONP 利用了{" "}
        <code>&lt;script&gt;</code> 标签不受同源策略限制的特性，通过动态创建
        script 标签，并利用服务端返回函数调用的方式实现跨域数据获取。
      </Paragraph>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        本示例调用了<strong>百度搜索建议 API</strong> 演示真实场景下的 JSONP
        通信过程。
      </Paragraph>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleJsonpRequest}
          placeholder="输入关键词，如: react"
          style={{ width: "260px" }}
        />
        <Button type="primary" onClick={handleJsonpRequest} loading={loading}>
          发送 JSONP 请求
        </Button>
        <Button onClick={handleNormalRequest} loading={normalLoading} danger>
          普通请求 (演示跨域报错)
        </Button>
      </div>

      <List
        bordered
        header={<div>搜索建议结果 (共 {results.length} 条)</div>}
        dataSource={results}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        locale={{ emptyText: "暂无数据，请输入关键词并点击按钮发送请求" }}
      />

      <Divider style={{ margin: "40px 0" }} />

      {/* --- CORS 跨域请求示例区域 --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        CORS 跨域请求示例 (连接本地 Node 服务)
      </Title>
      <Paragraph type="secondary">
        我们已经在本地启动了一个 Node.js(Express) 服务，运行在{" "}
        <code>http://localhost:3001</code>。 由于 React 前端运行在不同的端口（如
        5173），因此两者之间存在跨域。
        <br />
        <br />
        <Text strong type="danger">
          目前 Node 服务尚未配置 CORS 响应头，点击下方按钮将看到跨域拦截报错！
        </Text>
      </Paragraph>
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          onClick={handleCorsRequest}
          loading={corsLoading}
          style={{ background: "#52c41a", borderColor: "#52c41a" }}
        >
          发送跨域请求 (预期会报错)
        </Button>
      </div>
      <div
        style={{
          background: "#282c34",
          color: "#abb2bf",
          padding: "12px",
          borderRadius: "4px",
          minHeight: "80px",
          fontFamily: "monospace",
        }}
      >
        {corsResult ? (
          <pre style={{ margin: 0 }}>{corsResult}</pre>
        ) : (
          <Text style={{ color: "#5c6370" }}>等待请求数据...</Text>
        )}
      </div>

      <Divider style={{ margin: "40px 0" }} />

      {/* --- postMessage 跨域通信示例区域 --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        postMessage 跨域通信示例
      </Title>
      <Paragraph type="secondary">
        <code>window.postMessage</code>{" "}
        提供了一种受控机制来规避同源策略，它允许跨窗口（如 iframe
        与父窗口之间、弹出的新窗口与打开者之间）进行安全的数据通信。
      </Paragraph>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* 左侧：父窗口控制区 */}
        <div style={{ flex: 1 }}>
          <Title level={5}>主窗口 (React 父页面)</Title>
          <Space style={{ marginBottom: "16px" }}>
            <Input
              value={pmInput}
              onChange={(e) => setPmInput(e.target.value)}
              placeholder="输入要发送给 iframe 的消息"
              style={{ width: "200px" }}
            />
            <Button type="primary" onClick={sendMessageToIframe}>
              发送消息给 Iframe
            </Button>
          </Space>

          <div
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              height: "200px",
              overflowY: "auto",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <Text strong>主窗口通信日志：</Text>
            </div>
            {iframeMessages.length === 0 ? (
              <Text type="secondary">暂无消息</Text>
            ) : (
              iframeMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "4px",
                    color: msg.includes("[来自") ? "#1890ff" : "#52c41a",
                  }}
                >
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右侧：嵌套的 Iframe 页面 */}
        <div style={{ flex: 1 }}>
          <Title level={5}>嵌套 Iframe (子页面)</Title>
          <iframe
            ref={iframeRef}
            src="/iframe-target.html"
            title="跨域iframe"
            style={{
              width: "100%",
              height: "250px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
    </Card>
  );
}

export default MyTodo;
