import React, { use, Suspense, useState, startTransition } from "react";
import { Card, Typography, Button, Switch, Space, Alert, Skeleton } from "antd";

const { Paragraph, Text } = Typography;

// --- 模拟后端的异步 API ---
const fetchUserInfo = (): Promise<{
  name: string;
  age: number;
  role: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: "前端大佬", age: 25, role: "高级工程师" });
    }, 2000); // 模拟 2 秒的加载时间
  });
};

const fetchSecretMessage = (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("这是只有高级工程师才能看到的内部机密消息！");
    }, 1500);
  });
};

// --- Context 定义 ---
const ThemeContext = React.createContext<"light" | "dark">("light");

// --- 子组件 1：常规的 use(Promise) 用法 ---
const UserInfo = ({ userPromise }: { userPromise: Promise<any> }) => {
  // 面试考点：use(Promise) 会挂起（Suspend）当前组件，直到 Promise resolve
  // 必须配合外层的 <Suspense> 使用！
  const user = use(userPromise);

  return (
    <div
      style={{ padding: "12px", background: "#f5f5f5", borderRadius: "4px" }}
    >
      <p>
        <strong>姓名：</strong>
        {user.name}
      </p>
      <p>
        <strong>年龄：</strong>
        {user.age}
      </p>
      <p>
        <strong>角色：</strong>
        {user.role}
      </p>
    </div>
  );
};

// --- 子组件 2：条件语句中的 use(Promise) ---
const SecretMessage = ({
  shouldLoad,
  messagePromise,
}: {
  shouldLoad: boolean;
  messagePromise: Promise<any>;
}) => {
  if (!shouldLoad) {
    return <Text type="secondary">机密消息未加载（开启开关以查看）</Text>;
  }

  // ⚠️ 面试绝对高频考点 ⚠️
  // React 之前的所有 Hook（useState, useEffect 等）绝对不能写在 if 语句里！
  // 但是，use() 是唯一一个可以写在条件判断里的 API！
  const message = use(messagePromise);

  return <Alert message={message} type="success" showIcon />;
};

// --- 子组件 3：旧写法 useContext ---
const LegacyContextConsumer = ({ showTheme }: { showTheme: boolean }) => {
  // ⚠️ 痛点：旧版 useContext 必须写在最顶层！
  // 即使 showTheme 为 false，组件根本不需要渲染主题，我们也被迫要在这里读取一次 Context，浪费性能。
  // 绝对不能把它移到下面的 if 判断里面去，否则 React 会报错："Rendered fewer hooks than expected"
  const theme = React.useContext(ThemeContext);

  if (!showTheme) {
    return (
      <Text type="secondary">
        主题未显示（旧写法：依然在后台被迫读取了 Context）
      </Text>
    );
  }

  return (
    <div
      style={{
        padding: "8px",
        background: theme === "dark" ? "#333" : "#f0f0f0",
        color: theme === "dark" ? "#fff" : "#000",
        borderRadius: "4px",
        marginTop: "8px",
        fontSize: "12px",
      }}
    >
      旧写法 (useContext)：<strong>{theme}</strong>
    </div>
  );
};

// --- 子组件 4：条件语句中的 use(Context) ---
const ContextConsumer = ({ showTheme }: { showTheme: boolean }) => {
  if (!showTheme) {
    return (
      <Text type="secondary" style={{ display: "block", marginTop: "8px" }}>
        主题未显示（新写法 use：根本没有执行 Context 读取逻辑，性能 0 损耗）
      </Text>
    );
  }

  // ⚠️ 面试考点：use() 也可以用来读取 Context，并且同样支持条件调用！
  // 这替代了以前的 useContext(ThemeContext)
  const theme = use(ThemeContext);

  return (
    <div
      style={{
        padding: "12px",
        background: theme === "dark" ? "#333" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        border: "1px solid #ccc",
        borderRadius: "4px",
        marginTop: "8px",
      }}
    >
      当前使用 use(Context) 读取到的主题是：<strong>{theme}</strong>
    </div>
  );
};

// --- 主组件 ---
const UseApiTest: React.FC = () => {
  // 保存 Promise 实例
  const [userPromise, setUserPromise] = useState<Promise<any> | null>(null);
  const [messagePromise, setMessagePromise] = useState<Promise<any> | null>(
    null,
  );
  const [showSecret, setShowSecret] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // 触发加载用户数据
  const handleLoadUser = () => {
    // 每次点击重新生成一个新的 Promise
    setUserPromise(fetchUserInfo());
  };

  // 触发加载机密消息（条件渲染演示）
  const handleToggleSecret = (checked: boolean) => {
    setShowSecret(checked);
    if (checked && !messagePromise) {
      setMessagePromise(fetchSecretMessage());
    }
  };

  return (
    <Card
      title="6. 革命性的 API：use(Promise) 与 Suspense"
      style={{ marginBottom: "24px", borderColor: "#1677ff" }}
    >
      <Paragraph>
        <strong>面试考点 1：替代 useEffect 获取数据</strong>
        <br />
        以前我们要在 <code>useEffect</code> 里发请求，再 <code>setState</code>
        ，处理 <code>loading</code>。现在只需把 <code>Promise</code>{" "}
        传给子组件，在子组件里 <code>use(Promise)</code>，React
        就会自动挂起，直到数据返回。
      </Paragraph>
      <Paragraph>
        <strong>面试考点 2：打破了 Hook 不能写在 if 里的铁律！</strong>
        <br />
        <code>use()</code> 是 React 历史上第一个允许写在条件语句 (如{" "}
        <code>if</code>, <code>for</code>) 里的 API！
      </Paragraph>

      <Space
        direction="vertical"
        style={{ width: "100%", marginTop: "16px" }}
        size="large"
      >
        {/* 示例 1 区域 */}
        <Card type="inner" title="场景 A：常规挂起获取数据">
          <Button
            type="primary"
            onClick={handleLoadUser}
            style={{ marginBottom: "16px" }}
          >
            {userPromise ? "重新加载用户" : "点击加载用户信息"}
          </Button>

          {userPromise && (
            // 当内部的 use(Promise) 处于 pending 时，显示 fallback
            <Suspense fallback={<Skeleton active paragraph={{ rows: 2 }} />}>
              <UserInfo userPromise={userPromise} />
            </Suspense>
          )}
        </Card>

        {/* 示例 2 区域 */}
        <Card type="inner" title="场景 B：在 if 语句中使用 use(Promise)">
          <Space style={{ marginBottom: "16px" }}>
            <span>是否加载机密消息：</span>
            <Switch checked={showSecret} onChange={handleToggleSecret} />
          </Space>

          {/* 这里故意把 Suspense 包在最外面，即使 messagePromise 还没传，也没关系 */}
          <Suspense fallback={<Text type="warning">正在解密消息中...</Text>}>
            <SecretMessage
              shouldLoad={showSecret}
              messagePromise={messagePromise!}
            />
          </Suspense>
        </Card>

        {/* 示例 3 区域 */}
        <ThemeContext value={theme}>
          <Card
            type="inner"
            title="场景 C：在 if 语句中使用 use(Context)"
            extra={
              <Button
                size="small"
                onClick={() =>
                  setTheme((t) => (t === "light" ? "dark" : "light"))
                }
              >
                切换为 {theme === "light" ? "Dark" : "Light"}
              </Button>
            }
          >
            <Space style={{ marginBottom: "16px" }}>
              <span>是否渲染读取 Context 的组件：</span>
              <Switch checked={showTheme} onChange={setShowTheme} />
            </Space>

            <div
              style={{ display: "flex", gap: "16px", flexDirection: "column" }}
            >
              <LegacyContextConsumer showTheme={showTheme} />
              <ContextConsumer showTheme={showTheme} />
            </div>
          </Card>
        </ThemeContext>
      </Space>
    </Card>
  );
};

export default UseApiTest;
