import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Space, Select, Alert } from "antd";

const { Paragraph } = Typography;

// 注意：目前最新稳定版的 react (19.0.0) 还没有正式暴露 useEffectEvent。
// 它还在 experimental 实验分支中。
// 为了让代码能跑起来并给面试官展示，我们用 useRef 简单 polyfill (模拟) 一下这个行为。
const useEvent = <T extends (...args: any[]) => any>(handler: T): T => {
  const handlerRef = React.useRef(handler);

  // 在每次渲染的 layout 阶段更新 ref，确保它永远指向最新的闭包
  React.useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  // 返回一个稳定的函数引用，内部始终调用最新的 ref
  return React.useCallback((...args: any[]) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []) as unknown as T;
};

const EffectEventTest: React.FC = () => {
  // 模拟聊天室场景
  const [roomId, setRoomId] = useState("general");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // 用于在页面上展示日志
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // ==============================================================
  // 1. 旧痛点：普通的 useEffect
  // ==============================================================
  // 我们想在切换房间时打印一条日志，并且日志里要带上当前的主题颜色。
  // 但是！我们【不想】因为主题颜色的改变，而导致重新连接房间（重新打印连接日志）。
  // 我们在依赖数组里强行把 theme 加进去，模拟传统的错误解法
  useEffect(() => {
    addLog(`🔌 (旧写法) 连接到房间: ${roomId} (当前主题: ${theme})`);

    return () => {
      addLog(`❌ (旧写法) 断开连接: ${roomId}`);
    };
  }, [roomId, theme]); // ⚠️ 痛点：加入了 theme 依赖，导致换主题也会重连！

  // ==============================================================
  // 2. 新解法：useEffectEvent (React 19 实验性 Hook)
  // ==============================================================
  // useEffectEvent 可以将“非反应性逻辑”从 Effect 中抽离出来。
  // 它可以读取最新的 state/props，但它本身【不能】作为 useEffect 的依赖项！
  const onConnected = useEvent((connectedRoomId: string) => {
    addLog(`🎉 (新写法) 连接到房间: ${connectedRoomId} (最新主题: ${theme})`);
  });

  useEffect(() => {
    // 这里的 Effect 非常纯粹，只负责“连接房间”这件事。
    // 它唯一的依赖就是 roomId。
    onConnected(roomId);

    return () => {
      // addLog(`❌ (新写法) 断开连接: ${roomId}`);
    };
  }, [roomId]); // 这里不需要也不能把 onConnected 放进依赖数组！

  return (
    <Card
      title="11. useEffectEvent 实验性特性"
      style={{
        marginBottom: "24px",
        borderColor: "#eb2f96",
        background: theme === "dark" ? "#2c2c2c" : "#fff",
        color: theme === "dark" ? "#fff" : "inherit",
        transition: "all 0.3s",
      }}
    >
      <Paragraph
        style={{
          color: theme === "dark" ? "rgba(255,255,255,0.85)" : "inherit",
        }}
      >
        <strong>面试考点：</strong> <code>useEffect</code>{" "}
        的依赖数组经常让人头疼。有时候我们只想在 Effect 里读取最新的
        state（比如当前主题），但不想因为这个 state 的改变而重新触发
        Effect（比如重新连接 WebSocket）。
      </Paragraph>
      <Paragraph
        style={{
          color: theme === "dark" ? "rgba(255,255,255,0.85)" : "inherit",
        }}
      >
        <strong>useEffectEvent：</strong> 它允许你提取一段“事件处理逻辑”。在{" "}
        <code>useEffectEvent</code> 内部，你永远能拿到最新的 state 和
        props。而最神奇的是：
        <strong>
          你不需要（也不能）把它加到 useEffect 的依赖数组里！
        </strong>{" "}
        它就像一个永远保持最新的、不用写依赖的 <code>useCallback</code>。
      </Paragraph>

      <Alert
        message="注意：此特性目前仍处于 React 19 实验性阶段"
        description="如果你在控制台看到警告或编译报错找不到 useEffectEvent，说明当前 Vite 依赖的 react 版本尚未正式暴露它。但面试中它是极高频的考点，代表了 React 官方对 Effect 依赖地狱的终极解决方案。"
        type="warning"
        showIcon
        style={{ marginBottom: "16px" }}
      />

      <Space direction="vertical" style={{ width: "100%" }}>
        <Space>
          <Select
            value={roomId}
            onChange={setRoomId}
            options={[
              { value: "general", label: "大厅 (general)" },
              { value: "travel", label: "旅游 (travel)" },
              { value: "music", label: "音乐 (music)" },
            ]}
          />
          <Select
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "明亮主题 (Light)" },
              { value: "dark", label: "暗黑主题 (Dark)" },
            ]}
          />
          <Button danger onClick={() => setLogs([])}>
            清空日志
          </Button>
        </Space>

        <div
          style={{
            marginTop: "16px",
            background: "#1e1e1e",
            color: "#4af626",
            padding: "16px",
            borderRadius: "8px",
            fontFamily: "monospace",
            height: "200px",
            overflowY: "auto",
          }}
        >
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: "#666" }}>暂无日志...</div>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default EffectEventTest;
