import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  Component,
  useId,
} from "react";
import { Card, Typography, Button, Space, Alert } from "antd";

const { Title, Paragraph, Text } = Typography;

// --- 新增：用于演示 React.memo 的子组件 ---

// 1. 普通组件（父组件渲染，它一定渲染）
const NormalChild = ({ dsType, info }: { dsType: string; info: any }) => {
  const renderTime = new Date().toLocaleTimeString();
  return (
    <div
      style={{
        padding: 8,
        border: "1px solid #ff4d4f",
        borderRadius: 4,
        marginBottom: 8,
      }}
    >
      <div>
        <Text type="danger" strong>
          普通组件
        </Text>
      </div>
      <div>渲染时间: {renderTime} (每次点击都会更新)</div>
      <div>dsType: {dsType}</div>
    </div>
  );
};

// 2. 默认的 React.memo 组件（浅层比较 props）
const MemoChild = React.memo(
  ({ dsType, info }: { dsType: string; info: any }) => {
    const renderTime = new Date().toLocaleTimeString();
    return (
      <div
        style={{
          padding: 8,
          border: "1px solid #faad14",
          borderRadius: 4,
          marginBottom: 8,
        }}
      >
        <div>
          <Text type="warning" strong>
            React.memo (默认浅比较)
          </Text>
        </div>
        <div>渲染时间: {renderTime}</div>
        <div>dsType: {dsType}</div>
      </div>
    );
  },
);

// 3. 自定义比较函数的 React.memo 组件
const CustomMemoChild = React.memo(
  ({ dsType, info }: { dsType: string; info: any }) => {
    const renderTime = new Date().toLocaleTimeString();
    return (
      <div style={{ padding: 8, border: "1px solid #52c41a", borderRadius: 4 }}>
        <div>
          <Text type="success" strong>
            React.memo (自定义深比较)
          </Text>
        </div>
        <div>渲染时间: {renderTime}</div>
        <div>dsType: {dsType}</div>
      </div>
    );
  },
  // 第二个参数：自定义比对函数
  // 如果返回 true，表示 props 没变，不重新渲染；返回 false，表示变了，重新渲染。
  (prevProps, nextProps) => {
    return prevProps.dsType === nextProps.dsType;
  },
);

// --- 新增：用于演示 Class 组件 shouldComponentUpdate 的示例 ---

interface ClassChildProps {
  dsType: string;
  info: any;
}

class ClassChild extends Component<ClassChildProps> {
  // 面试考点：shouldComponentUpdate 的返回值决定了组件是否要重新 render
  // 返回 true -> 重新渲染 (默认行为)
  // 返回 false -> 跳过渲染 (性能优化)
  shouldComponentUpdate(nextProps: ClassChildProps, nextState: any) {
    // 我们的优化逻辑：只要 dsType 没变，就不重新渲染，忽略 info 对象引用的变化
    if (this.props.dsType === nextProps.dsType) {
      return false; // 拦截渲染！
    }
    return true; // 允许渲染
  }

  render() {
    const renderTime = new Date().toLocaleTimeString();
    return (
      <div
        style={{
          padding: 8,
          border: "1px solid #1890ff",
          borderRadius: 4,
          marginTop: 8,
        }}
      >
        <div>
          <Text strong style={{ color: "#1890ff" }}>
            Class 组件 (shouldComponentUpdate)
          </Text>
        </div>
        <div>渲染时间: {renderTime}</div>
        <div>dsType: {this.props.dsType}</div>
      </div>
    );
  }
}

// --- 新增：用于演示 useId 的子组件 ---
const IdComponent = () => {
  // 面试考点：useId 会生成一个唯一的、稳定的 ID 字符串。
  // 它能保证在 SSR (服务端渲染) 和 CSR (客户端水合) 时生成的 ID 完全一致，避免 Hydration Mismatch。
  const reactId = useId();

  // 反面教材：使用 Math.random() 生成 ID
  // 在 SSR 场景下，服务端算出一个随机数生成了 HTML；客户端接管后，又算出一个不同的随机数。
  // React 比对发现 ID 不一致，会报错并强制重新渲染整个 DOM 树。
  const randomId = `random-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
      <div
        style={{
          flex: 1,
          padding: 12,
          border: "1px solid #d9d9d9",
          borderRadius: 4,
        }}
      >
        <div>
          <Text strong>正确做法：useId()</Text>
        </div>
        <div style={{ marginTop: 8 }}>
          <label htmlFor={`${reactId}-email`}>邮箱：</label>
          <input
            id={`${reactId}-email`}
            type="text"
            placeholder="点击标签可聚焦"
            style={{ marginLeft: 8 }}
          />
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#888",
            wordBreak: "break-all",
          }}
        >
          生成的 ID: <code>{reactId}</code>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: 12,
          border: "1px dashed #ff4d4f",
          borderRadius: 4,
          background: "#fff2f0",
        }}
      >
        <div>
          <Text type="danger" strong>
            反面教材：Math.random()
          </Text>
        </div>
        <div style={{ marginTop: 8 }}>
          <label htmlFor={`${randomId}-email`}>邮箱：</label>
          <input
            id={`${randomId}-email`}
            type="text"
            placeholder="SSR 时会报错闪烁"
            style={{ marginLeft: 8 }}
          />
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#888",
            wordBreak: "break-all",
          }}
        >
          生成的 ID: <code>{randomId}</code>
        </div>
      </div>
    </div>
  );
};

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

  // --- 新增：用于演示 React.memo 的状态 ---
  const [parentCount, setParentCount] = useState(0);
  const [dsType, setDsType] = useState("type_A");

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

        {/* --- React.memo() 浅比较与自定义比较示例 --- */}
        <Card title="4. React 性能优化：React.memo 与 shouldComponentUpdate">
          <Alert
            message="React 渲染优化原理"
            description={
              <>
                <p>
                  默认情况下，父组件重新渲染会导致所有子组件重新渲染。为了优化性能：
                </p>
                <ul>
                  <li>
                    <strong>函数组件：</strong> 使用{" "}
                    <code>React.memo(Component, arePropsEqual?)</code>。默认对
                    props 进行浅比较；可传入第二个参数自定义深层比较。
                  </li>
                  <li>
                    <strong>Class 组件：</strong> 使用{" "}
                    <code>shouldComponentUpdate(nextProps, nextState)</code>{" "}
                    生命周期。返回 <code>false</code>{" "}
                    即可阻止组件渲染。或者直接继承{" "}
                    <code>React.PureComponent</code> (等同于只做浅比较)。
                  </li>
                </ul>
                <p>
                  <strong>面试痛点演示：</strong> 如果 props
                  里有对象或函数（如传递{" "}
                  <code>info=&#123;&#123; desc: '测试' &#125;&#125;</code>
                  ），由于每次父组件渲染都会生成新的对象引用，浅比较会认为 props
                  变了，导致默认的 <code>React.memo</code> 或{" "}
                  <code>PureComponent</code> 失效。
                </p>
              </>
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ display: "flex", gap: "24px" }}>
            <Card type="inner" title="父组件操作区" style={{ flex: 1 }}>
              <Paragraph>
                父组件计数器: <strong>{parentCount}</strong>
                <br />
                传递给子组件的 dsType: <strong>{dsType}</strong>
                <br />
                传递给子组件的 info:{" "}
                <code>{`{ desc: '固定对象，但引用每次不同' }`}</code>
              </Paragraph>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  onClick={() => setParentCount((c) => c + 1)}
                  block
                >
                  1. 修改父组件计数器 (触发父组件重渲染)
                </Button>
                <Button
                  onClick={() =>
                    setDsType((prev) =>
                      prev === "type_A" ? "type_B" : "type_A",
                    )
                  }
                  block
                >
                  2. 切换 dsType 属性
                </Button>
              </Space>
            </Card>

            <Card
              type="inner"
              title="子组件渲染表现 (观察渲染时间变化)"
              style={{ flex: 1, background: "#fafafa" }}
            >
              <NormalChild
                dsType={dsType}
                info={{ desc: "固定对象，但引用每次不同" }}
              />
              <MemoChild
                dsType={dsType}
                info={{ desc: "固定对象，但引用每次不同" }}
              />
              <CustomMemoChild
                dsType={dsType}
                info={{ desc: "固定对象，但引用每次不同" }}
              />
              <ClassChild
                dsType={dsType}
                info={{ desc: "固定对象，但引用每次不同" }}
              />
            </Card>
          </div>
        </Card>

        {/* --- useId() 避免 SSR Hydration Mismatch 示例 --- */}
        <Card title="5. React 18 新特性：useId() 解决 SSR 渲染不一致">
          <Alert
            message="为什么需要 useId()？"
            description={
              <>
                <p>
                  在前端开发中，我们经常需要给表单元素（如{" "}
                  <code>&lt;input&gt;</code>）生成唯一的 <code>id</code>，以便和{" "}
                  <code>&lt;label htmlFor="..."&gt;</code>{" "}
                  绑定，或者为了可访问性（a11y）提供{" "}
                  <code>aria-describedby</code>。
                </p>
                <p>
                  <strong>痛点（SSR 场景）：</strong> 如果用{" "}
                  <code>Math.random()</code> 或 <code>uuid()</code> 生成
                  ID，服务器渲染 HTML 时会生成一个 ID（比如 <code>0.123</code>
                  ），但浏览器拿到 HTML 后，React
                  在水合（Hydration）阶段重新执行代码，又会生成一个全新的
                  ID（比如 <code>0.456</code>）。
                </p>
                <p>
                  <strong>结果：</strong> React 发现两端生成的 DOM 结构不一致（
                  <strong>Hydration Mismatch</strong>
                  ），会抛出警告，并废弃服务端生成的整个组件节点，强制在客户端重新渲染，导致严重的性能浪费和页面闪烁。
                </p>
                <p>
                  <strong>useId 的魔法：</strong> <code>useId()</code>{" "}
                  依赖于组件在 React
                  树中的层级位置来生成字符串。只要组件树结构没变，服务端和客户端算出来的
                  ID 就是<strong>绝对一致的</strong>，完美解决了这个问题。
                </p>
              </>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card type="inner" title="表单 ID 绑定演示">
            <Paragraph style={{ color: "#888", marginBottom: 16 }}>
              你可以尝试点击下面的文字标签（"邮箱："），只要 ID
              绑定正确，输入框就会自动获得焦点。
              在纯客户端渲染（CSR）下，两者表现看起来一样；但在 SSR 框架（如
              Next.js）中，右侧的反面教材会导致页面崩溃重绘。
            </Paragraph>

            <IdComponent />

            {/* 演示同一个组件渲染多次，useId 会保证它们互不冲突 */}
            <IdComponent />
          </Card>

          <Card
            type="inner"
            title="面试进阶追问：多个 React 应用挂在同一页面，ID 冲突怎么办？"
            style={{ marginTop: 16 }}
          >
            <Paragraph>
              如果你的页面是<strong>微前端架构</strong>，或者在一个老系统里用{" "}
              <code>createRoot</code> 挂载了多个独立的 React
              应用，它们可能会生成相同的 <code>:r0:</code>、<code>:r1:</code>
              ，导致整个页面的 ID 冲突！
            </Paragraph>
            <Paragraph strong style={{ color: "#1890ff" }}>
              解决方案：在挂载应用时，传入 identifierPrefix 配置项，给生成的 ID
              加前缀。
            </Paragraph>
            <div
              style={{
                background: "#2b2b2b",
                color: "#fff",
                padding: 16,
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 13,
                overflowX: "auto",
              }}
            >
              <span style={{ color: "#c678dd" }}>import</span>{" "}
              {`{ createRoot }`} <span style={{ color: "#c678dd" }}>from</span>{" "}
              <span style={{ color: "#98c379" }}>'react-dom/client'</span>;
              <br />
              <br />
              <span style={{ color: "#5c6370" }}>
                // 应用 A：生成的 ID 会是 :app1-r0:
              </span>
              <br />
              <span style={{ color: "#61afef" }}>createRoot</span>
              (document.getElementById(
              <span style={{ color: "#98c379" }}>'root-a'</span>), {`{`}
              <br />
              &nbsp;&nbsp;identifierPrefix:{" "}
              <span style={{ color: "#98c379" }}>'app1-'</span>
              <br />
              {`}`}).render(&lt;<span style={{ color: "#e06c75" }}>App1</span>{" "}
              /&gt;);
              <br />
              <br />
              <span style={{ color: "#5c6370" }}>
                // 应用 B：生成的 ID 会是 :app2-r0:，完美避免冲突
              </span>
              <br />
              <span style={{ color: "#61afef" }}>createRoot</span>
              (document.getElementById(
              <span style={{ color: "#98c379" }}>'root-b'</span>), {`{`}
              <br />
              &nbsp;&nbsp;identifierPrefix:{" "}
              <span style={{ color: "#98c379" }}>'app2-'</span>
              <br />
              {`}`}).render(&lt;<span style={{ color: "#e06c75" }}>App2</span>{" "}
              /&gt;);
            </div>
          </Card>
        </Card>
      </Space>
    </div>
  );
}

export default ReactTest;
