import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Card, Typography, Button, Space, Alert } from "antd";

const { Title, Paragraph, Text } = Typography;

function ReactTest() {
  // 用于演示 useEffect 的闪烁问题
  const [countEffect, setCountEffect] = useState(0);
  const effectRef = useRef<HTMLDivElement>(null);

  // 用于演示 useLayoutEffect 解决闪烁问题
  const [countLayout, setCountLayout] = useState(0);
  const layoutRef = useRef<HTMLDivElement>(null);

  // useEffect 示例：异步执行，会导致视觉闪烁
  useEffect(() => {
    if (countEffect === 0) {
      // 故意制造一个耗时的操作或者强制重新渲染
      // 当 count 为 0 时，我们将其强制改为一个随机数
      const randomNum = 10 + Math.random() * 200;
      setCountEffect(randomNum);
    }
  }, [countEffect]);

  // useLayoutEffect 示例：同步执行，在浏览器绘制前拦截
  useLayoutEffect(() => {
    if (countLayout === 0) {
      const randomNum = 10 + Math.random() * 200;
      setCountLayout(randomNum);
    }
  }, [countLayout]);

  // 用于演示 StrictMode 下 Effect 执行两次的问题
  const [effectLogs, setEffectLogs] = useState<string[]>([]);

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    setEffectLogs((prev) => [...prev, `[${timestamp}] Effect 挂载 (Mount)`]);

    return () => {
      const unmountTime = new Date().toLocaleTimeString();
      setEffectLogs((prev) => [
        ...prev,
        `[${unmountTime}] Effect 卸载 (Unmount)`,
      ]);
    };
  }, []); // 空依赖数组，理论上只在组件挂载时执行一次

  return (
    <div style={{ padding: "24px" }}>
      <Typography>
        <Title level={2}>React 测试与面试题沙盒</Title>
        <Paragraph>
          这里包含了一些经典的 React 面试题演示，帮助你直观地理解底层原理。
        </Paragraph>
      </Typography>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card title="1. useEffect vs useLayoutEffect">
          <Alert
            message="核心区别"
            description={
              <ul>
                <li>
                  <Text strong>执行时机：</Text>
                  <code>useEffect</code> 是在浏览器完成渲染绘制（Paint）
                  <strong>之后</strong>异步执行的。
                  <code>useLayoutEffect</code> 是在 DOM 变更之后、浏览器渲染绘制
                  <strong>之前</strong>同步执行的。
                </li>
                <li>
                  <Text strong>视觉闪烁：</Text>
                  如果你的 Effect 中需要<strong>修改 DOM 且引起重绘</strong>
                  ，使用 <code>useEffect</code>{" "}
                  可能会让用户先看到旧画面，再看到新画面（闪烁）。 使用{" "}
                  <code>useLayoutEffect</code>{" "}
                  会阻塞浏览器绘制，直到你的修改完成，用户只会看到最终结果（无闪烁）。
                </li>
                <li>
                  <Text strong>使用建议：</Text> 绝大多数情况下首选{" "}
                  <code>useEffect</code> 以避免阻塞渲染；只有在需要测量 DOM
                  节点（如获取宽高）并同步修改样式以防闪烁时，才用{" "}
                  <code>useLayoutEffect</code>。
                </li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ display: "flex", gap: "24px" }}>
            {/* useEffect 测试区 */}
            <Card
              type="inner"
              title="useEffect (观察点击重置时的闪烁)"
              style={{ flex: 1 }}
            >
              <div
                ref={effectRef}
                style={{
                  height: 100,
                  background: "#ffccc7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  fontSize: 24,
                  fontWeight: "bold",
                }}
              >
                {Math.round(countEffect)}
              </div>
              <Button type="primary" danger onClick={() => setCountEffect(0)}>
                重置为 0 (触发 Effect)
              </Button>
              <Paragraph style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                当你点击重置时，状态先变为 0。React 将 0 渲染到屏幕上。
                <br />
                接着 <code>useEffect</code> 执行，发现是
                0，又把它改成随机数，导致屏幕再次重绘。
                <br />
                <strong>现象：你能用肉眼看到数字 0 闪了一下。</strong>
              </Paragraph>
            </Card>

            {/* useLayoutEffect 测试区 */}
            <Card
              type="inner"
              title="useLayoutEffect (无闪烁)"
              style={{ flex: 1 }}
            >
              <div
                ref={layoutRef}
                style={{
                  height: 100,
                  background: "#d9f7be",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  fontSize: 24,
                  fontWeight: "bold",
                }}
              >
                {Math.round(countLayout)}
              </div>
              <Button
                type="primary"
                style={{ background: "#52c41a" }}
                onClick={() => setCountLayout(0)}
              >
                重置为 0 (触发 LayoutEffect)
              </Button>
              <Paragraph style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                点击重置，状态变为 0，React 更新 DOM 但
                <strong>先不绘制到屏幕</strong>。
                <br />
                <code>useLayoutEffect</code> 同步拦截，发现是
                0，立刻改为随机数。
                <br />
                React 等待最新的状态确认后，才将最终的随机数绘制到屏幕上。
                <br />
                <strong>
                  现象：你根本看不到数字 0，画面直接更新为随机数。
                </strong>
              </Paragraph>
            </Card>
          </div>
        </Card>

        {/* --- StrictMode 下 Effect 执行两次示例 --- */}
        <Card title="2. 为什么 useEffect 会执行两次？(React 18 面试常考)">
          <Alert
            message="React 18 严格模式 (StrictMode) 的新特性"
            description={
              <>
                <p>
                  在 React 18 的开发环境（Development）且开启了{" "}
                  <code>&lt;React.StrictMode&gt;</code> 的情况下，React
                  会故意模拟一次组件的卸载和重新挂载。
                </p>
                <p>
                  <strong>执行顺序：</strong> 挂载 (Mount) -&gt; 卸载 (Unmount)
                  -&gt; 重新挂载 (Mount)。
                </p>
                <p>
                  <strong>目的：</strong> 帮开发者尽早发现没有在清理函数
                  (Cleanup function)
                  中正确清理副作用（如定时器、事件监听、WebSocket 订阅等）的
                  Bug。<strong>此行为在生产环境（Production）不会发生。</strong>
                </p>
              </>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card type="inner" title="执行日志 (依赖数组为 [])">
            <div
              style={{
                background: "#000",
                color: "#0f0",
                padding: 16,
                borderRadius: 4,
                fontFamily: "monospace",
              }}
            >
              {effectLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {effectLogs.length === 0 && <div>等待挂载中...</div>}
            </div>
            <Button
              type="dashed"
              style={{ marginTop: 16 }}
              onClick={() => setEffectLogs([])}
            >
              清空日志
            </Button>
            <Paragraph style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
              注：如果你看到输出了三行（Mount, Unmount,
              Mount），说明你的项目入口 (main.tsx) 开启了 StrictMode。
              如果你只看到一行 (Mount)，说明 StrictMode 未开启。
            </Paragraph>
          </Card>
        </Card>
      </Space>
    </div>
  );
}

export default ReactTest;
