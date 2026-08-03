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
import { io, Socket } from "socket.io-client";

const { Title, Paragraph, Text } = Typography;

function MyTodo() {
  const [keyword, setKeyword] = useState("react");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [normalLoading, setNormalLoading] = useState(false);
  const [corsLoading, setCorsLoading] = useState(false);
  const [corsResult, setCorsResult] = useState("");
  const [nginxLoading, setNginxLoading] = useState(false);
  const [nginxResult, setNginxResult] = useState("");
  const [domainResult, setDomainResult] = useState("");
  const [windowNameResult, setWindowNameResult] = useState("");
  const [hashResult, setHashResult] = useState("");

  // --- WebSocket 相关状态 ---
  const [wsConnected, setWsConnected] = useState(false);
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [wsInput, setWsInput] = useState("你好，WebSocket Server!");
  const socketRef = useRef<Socket | null>(null);

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

  // --- Nginx 代理跨域请求示例 ---
  const handleNginxRequest = async () => {
    setNginxLoading(true);
    setNginxResult("");
    try {
      // 注意这里请求的是当前的相对路径（同源），而不是直接请求 3001 端口
      // 实际上，开发环境下这个请求会被 Vite 的 proxy 拦截并转发，
      // 生产环境下则由 Nginx 的 location /api 拦截并转发。
      const response = await fetch("/api/data");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("代理请求成功:", data);
      setNginxResult(JSON.stringify(data, null, 2));
      message.success("通过代理访问接口成功");
    } catch (error: any) {
      console.error("代理请求失败:", error);
      message.error(`代理请求失败: ${error.message}`);
      setNginxResult(`请求失败: ${error.message}`);
    } finally {
      setNginxLoading(false);
    }
  };

  // --- document.domain 跨域示例 ---
  const handleDomainIframeLoad = () => {
    try {
      // 获取 iframe 的 window 对象
      const iframeWin = (
        document.getElementById("domainIframe") as HTMLIFrameElement
      )?.contentWindow;
      if (iframeWin) {
        // 尝试访问 iframe 内部的变量
        // 注意：在本地 localhost 开发环境下，由于不具备完整的一二级域名结构，这里通常会访问成功或因为协议严格限制而报错
        const dataFromIframe = (iframeWin as any).iframeSecretData;
        if (dataFromIframe) {
          setDomainResult(`成功读取子窗口数据：${dataFromIframe}`);
          message.success("通过 document.domain 读取跨域 iframe 数据成功");
        }
      }
    } catch (error: any) {
      console.error("document.domain 跨域访问失败:", error);
      setDomainResult(
        `读取失败: ${error.message}\n(在本地 localhost 环境下或未正确设置域名时，同源策略会拦截)`,
      );
      message.error("读取 iframe 数据被拦截");
    }
  };

  // --- window.name 跨域示例 ---
  const handleWindowNameLoad = () => {
    const iframe = document.getElementById(
      "windowNameIframe",
    ) as HTMLIFrameElement;
    if (!iframe) return;

    try {
      // 尝试读取当前 iframe 的 window.name
      const nameData = iframe.contentWindow?.name;

      if (nameData && nameData !== "初始的windowName") {
        setWindowNameResult(`成功读取到跨域数据: ${nameData}`);
        message.success("成功利用 window.name 读取到数据");
      } else {
        setWindowNameResult(
          "尚未获取到目标数据。请先在 iframe 中点击“设置数据并跳回同源页面”。",
        );
      }
    } catch (error: any) {
      console.error("读取 window.name 失败:", error);
      setWindowNameResult(
        `读取被拦截: ${error.message}\n(因为 iframe 目前处于跨域状态，同源策略禁止读取)`,
      );
      message.warning("由于同源策略，当前无法读取 iframe 内容");
    }
  };

  // --- location.hash 跨域示例 ---
  useEffect(() => {
    // 监听当前页面 (父页面) 的 hash 变化
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      if (currentHash && currentHash.startsWith("#msg=")) {
        // 解码获取子页面传来的数据
        const data = decodeURIComponent(currentHash.replace("#msg=", ""));
        console.log("收到来自 iframe 的 hash 消息:", data);
        setHashResult(data);
        message.success("成功通过 location.hash 收到跨域消息！");
        // 清理 hash 以便下次测试
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const sendHashMessage = () => {
    const iframe = document.getElementById("hashIframe") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      // 父页面修改跨域 iframe 的 hash 来传递数据
      const data = "Hello from Parent (via hash)";
      iframe.src = `http://127.0.0.1:5173/hash-target.html#data=${encodeURIComponent(data)}`;
    }
  };

  // --- WebSocket 跨域示例 ---
  const connectWebSocket = () => {
    if (socketRef.current?.connected) {
      message.info("WebSocket 已经是连接状态");
      return;
    }

    // 连接到后端的 Socket.IO 服务 (跨域端口 3001)
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => {
      setWsConnected(true);
      setWsMessages((prev) => [...prev, "[系统]: 已连接到 WebSocket 服务器"]);
      message.success("WebSocket 连接成功");
    });

    socket.on("serverMessage", (data) => {
      setWsMessages((prev) => [...prev, `[服务端回复]: ${data}`]);
    });

    socket.on("disconnect", () => {
      setWsConnected(false);
      setWsMessages((prev) => [...prev, "[系统]: WebSocket 连接已断开"]);
    });

    socket.on("connect_error", (err) => {
      setWsMessages((prev) => [
        ...prev,
        `[系统错误]: 连接失败 (${err.message})`,
      ]);
      message.error("WebSocket 连接失败，请检查 Node 服务是否启动了 socket.io");
    });
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const sendWsMessage = () => {
    if (!socketRef.current || !wsConnected) {
      message.warning("请先连接 WebSocket");
      return;
    }
    socketRef.current.emit("clientMessage", wsInput);
    setWsMessages((prev) => [...prev, `[我]: ${wsInput}`]);
    setWsInput("");
  };

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
        <Text strong style={{ color: "#52c41a" }}>
          Node 服务已经手动配置了 CORS 响应头
          (Access-Control-Allow-Origin)，点击下方按钮将成功获取数据！
        </Text>
      </Paragraph>
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          onClick={handleCorsRequest}
          loading={corsLoading}
          style={{ background: "#52c41a", borderColor: "#52c41a" }}
        >
          发送跨域请求 (预期会成功)
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

      {/* --- Nginx/Vite 代理跨域请求示例区域 --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        反向代理跨域示例 (Vite Proxy / Nginx)
      </Title>
      <Paragraph type="secondary">
        当后端无法修改 CORS 头时，前端通常通过配置反向代理来解决跨域。
        其原理是：同源策略是浏览器的限制，服务器之间请求没有这个限制。前端先将请求发给同源的代理服务器，由代理服务器转发给真实的后端服务器。
        <br />
        <br />
        开发环境下配置 <code>vite.config.ts</code> 中的 proxy，生产环境下配置
        Nginx 的 <code>location</code>。 前端代码只需要请求相对路径（如{" "}
        <code>/api/xxx</code>）。
      </Paragraph>
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          onClick={handleNginxRequest}
          loading={nginxLoading}
          style={{ background: "#722ed1", borderColor: "#722ed1" }}
        >
          发送代理请求 (请求 /api/data)
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
        {nginxResult ? (
          <pre style={{ margin: 0 }}>{nginxResult}</pre>
        ) : (
          <Text style={{ color: "#5c6370" }}>等待请求数据...</Text>
        )}
      </div>

      <Divider style={{ margin: "40px 0" }} />

      {/* --- document.domain 跨域示例区域 --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        document.domain 跨域示例
      </Title>
      <Paragraph type="secondary">
        该方案仅适用于**主域名相同，子域名不同**的跨域场景（例如{" "}
        <code>a.test.com</code> 和 <code>b.test.com</code>）。
        <br />
        原理：两个页面都通过 JS 强制设置{" "}
        <code>document.domain = 'test.com'</code>
        ，浏览器就会认为它们是同源的，从而允许父子页面互相访问 DOM 和全局变量。
        <br />
        <Text strong type="warning">
          注意：此方法已被现代浏览器（如 Chrome
          115+）弃用并默认禁用，未来会被移除，建议使用 postMessage 代替。本地
          localhost 环境下无法完全模拟其跨子域效果。
        </Text>
      </Paragraph>
      <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
        <div style={{ flex: 1 }}>
          <Button
            type="primary"
            onClick={() => {
              try {
                // 模拟在父页面设置 domain (本地 localhost 可能会报错)
                document.domain = "localhost";
                message.success("主页面已设置 document.domain = 'localhost'");
              } catch (e: any) {
                message.warning(`设置 domain 失败: ${e.message}`);
              }
            }}
            style={{ marginBottom: 12, marginRight: 8 }}
          >
            1. 主页面设置 document.domain
          </Button>
          <Button onClick={handleDomainIframeLoad}>
            2. 尝试读取 iframe 内部变量
          </Button>
          <div
            style={{
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              padding: "12px",
              borderRadius: "4px",
              marginTop: "12px",
              whiteSpace: "pre-wrap",
              color: "#d46b08",
            }}
          >
            {domainResult || "点击上方按钮尝试读取数据"}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <iframe
            id="domainIframe"
            src="/domain-iframe.html"
            style={{
              width: "100%",
              height: "150px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      <Divider style={{ margin: "40px 0" }} />

      {/* --- window.name 跨域示例区域 --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        window.name 跨域示例
      </Title>
      <Paragraph type="secondary">
        该方案利用了 <code>window.name</code> 属性的一个奇特特性：
        <strong>
          在一个窗口(window)的生命周期内，无论页面怎么跳转，
          <code>window.name</code> 的值都不会改变，并且可以支持高达 2MB 的数据
        </strong>
        。
        <br />
        <strong>跨域流程：</strong>
        <br />
        1. A 页面包含一个 iframe，最初指向 B 页面 (跨域)。
        <br />
        2. B 页面将需要传递的数据赋值给 <code>window.name</code>。
        <br />
        3. B 页面利用 <code>location.href</code> 自动跳转回一个和 A
        页面同源的空页面 C (同源)。
        <br />
        4. 由于 A 和 C 现在同源，A 页面就可以直接读取 C 页面 (原 B 窗口) 的{" "}
        <code>window.name</code> 拿到数据了。
      </Paragraph>

      <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
        <div style={{ flex: 1 }}>
          <Button
            onClick={handleWindowNameLoad}
            type="primary"
            style={{ marginBottom: 12 }}
          >
            尝试读取 iframe 的 window.name
          </Button>
          <div
            style={{
              background: "#e6f7ff",
              border: "1px solid #91d5ff",
              padding: "12px",
              borderRadius: "4px",
              whiteSpace: "pre-wrap",
              color: "#096dd9",
            }}
          >
            {windowNameResult || "点击按钮尝试读取"}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <iframe
            id="windowNameIframe"
            name="初始的windowName"
            src="http://127.0.0.1:5173/windowname-target.html" // 这里故意用 127.0.0.1 模拟与 localhost 的跨域
            style={{
              width: "100%",
              height: "180px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      <Divider style={{ margin: "40px 0" }} />

      {/* --- location.hash 跨域示例区域 --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        location.hash 跨域示例
      </Title>
      <Paragraph type="secondary">
        这种方案的原理是：虽然不同域的页面不能直接访问彼此的 DOM 或 JS 变量，但
        <strong>
          父页面可以随意修改子 iframe 的 <code>src</code> 中的 hash
          值（#后面的部分），子页面也可以修改父页面的 hash 值
        </strong>
        ，而且修改 hash 不会导致页面刷新。
        <br />
        因此，页面之间可以通过监听 <code>window.onhashchange</code>{" "}
        事件来获取彼此传递的数据。
        <br />
        <Text strong type="warning">
          注意：这种方法数据容量有限（受限于 URL 长度），且数据暴露在 URL
          中不够安全，通常也被现代的 postMessage 所替代。
        </Text>
      </Paragraph>

      <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
        <div style={{ flex: 1 }}>
          <Button
            onClick={sendHashMessage}
            type="primary"
            style={{ marginBottom: 12 }}
          >
            通过改变 hash 发送消息给 iframe
          </Button>
          <div
            style={{
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              padding: "12px",
              borderRadius: "4px",
              whiteSpace: "pre-wrap",
              color: "#cf1322",
            }}
          >
            {hashResult
              ? `收到 iframe 回复: ${hashResult}`
              : "等待接收 iframe 通过 hash 传回的数据..."}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <iframe
            id="hashIframe"
            src="http://127.0.0.1:5173/hash-target.html" // 同样用 127.0.0.1 模拟跨域
            style={{
              width: "100%",
              height: "180px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      <Divider style={{ margin: "40px 0" }} />

      {/* --- WebSocket 跨域示例区域 --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        WebSocket 跨域示例
      </Title>
      <Paragraph type="secondary">
        WebSocket 是一种双向通信协议，它在建立连接时通过 HTTP 发起握手（Upgrade
        请求）。
        <br />
        <Text strong style={{ color: "#1890ff" }}>
          非常重要的一点：WebSocket 协议本身并不受同源策略（Same-Origin
          Policy）的限制！
        </Text>
        因此，前端可以直接连接任意域名的 WebSocket
        服务。当然，为了安全，服务端通常会校验连接请求的 <code>Origin</code>{" "}
        头来决定是否接受连接。
      </Paragraph>

      <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
        <div style={{ flex: 1 }}>
          <Space style={{ marginBottom: "16px" }}>
            {wsConnected ? (
              <Button danger onClick={disconnectWebSocket}>
                断开 WebSocket 连接
              </Button>
            ) : (
              <Button type="primary" onClick={connectWebSocket}>
                连接 Node WebSocket 服务
              </Button>
            )}
          </Space>

          <Space.Compact style={{ width: "100%", marginBottom: "16px" }}>
            <Input
              value={wsInput}
              onChange={(e) => setWsInput(e.target.value)}
              onPressEnter={sendWsMessage}
              placeholder="输入要发送的消息"
              disabled={!wsConnected}
            />
            <Button
              type="primary"
              onClick={sendWsMessage}
              disabled={!wsConnected}
            >
              发送
            </Button>
          </Space.Compact>

          <div
            style={{
              background: "#282c34",
              padding: "12px",
              borderRadius: "4px",
              height: "200px",
              overflowY: "auto",
              fontFamily: "monospace",
              color: "#abb2bf",
            }}
          >
            {wsMessages.length === 0 ? (
              <Text style={{ color: "#5c6370" }}>
                暂无消息，请先建立连接...
              </Text>
            ) : (
              wsMessages.map((msg, idx) => {
                let color = "#abb2bf"; // 默认灰白
                if (msg.includes("[系统]")) color = "#e5c07b"; // 黄色
                if (msg.includes("[系统错误]")) color = "#e06c75"; // 红色
                if (msg.includes("[我]")) color = "#98c379"; // 绿色
                if (msg.includes("[服务端回复]")) color = "#61afef"; // 蓝色

                return (
                  <div key={idx} style={{ marginBottom: "6px", color }}>
                    {msg}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "#f5f5f5",
              padding: "16px",
              borderRadius: "4px",
              height: "100%",
            }}
          >
            <Title level={5}>实现原理说明</Title>
            <p>
              1. 本示例使用了流行的 <code>socket.io</code> 库。
            </p>
            <p>
              2. 前端 (<code>localhost:5173</code>) 尝试连接后端 (
              <code>localhost:3001</code>)。
            </p>
            <p>3. 浏览器发送 Upgrade 请求时，不会被 CORS 机制拦截。</p>
            <p>
              4. 只要后端的 socket.io 配置了允许该跨域
              Origin，连接就能瞬间建立，实现全双工实时通信。
            </p>
          </div>
        </div>
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
