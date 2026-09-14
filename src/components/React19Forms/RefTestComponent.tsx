import React, { useRef, forwardRef, useEffect } from "react";
import { Card, Typography, Button, Input, Space, Divider } from "antd";

const { Title, Paragraph, Text } = Typography;

// --- 1. 旧写法：使用 forwardRef ---
// 在 React 19 之前，函数组件接收 ref 必须用 forwardRef 包裹
const LegacyInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function LegacyInput(props, ref) {
  return (
    <div>
      <Text type="secondary" style={{ fontSize: "12px" }}>
        这是被 forwardRef 包裹的旧组件
      </Text>
      <Input
        ref={ref as any}
        {...(props as any)}
        placeholder="我是旧时代的 Input"
      />
    </div>
  );
});

// --- 2. 新写法：直接作为普通 Prop ---
// React 19 开始，ref 可以像普通的 props 一样直接在参数里解构出来！
interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<any>; // 只需要在类型里声明一下即可（可选）
}

const ModernInput = ({ ref, ...props }: ModernInputProps) => {
  return (
    <div>
      <Text type="success" style={{ fontSize: "12px" }}>
        这是直接接收 ref prop 的 React 19 新组件
      </Text>
      <Input
        ref={ref}
        {...(props as any)}
        placeholder="我是 React 19 的新 Input"
      />
    </div>
  );
};

// --- 主页面组件 ---
const RefTestComponent: React.FC = () => {
  // 创建两个 ref，分别指向新旧组件
  const legacyRef = useRef<any>(null);
  const modernRef = useRef<any>(null);

  const focusLegacy = () => {
    legacyRef.current?.focus();
  };

  const focusModern = () => {
    modernRef.current?.focus();
  };

  return (
    <Card
      title="7. 再见，forwardRef！(ref 作为普通 Prop)"
      style={{ marginBottom: "24px", borderColor: "#52c41a" }}
    >
      <Paragraph>
        <strong>面试考点：</strong> 在 React 19 之前，为什么函数组件不能直接接收{" "}
        <code>ref</code>？<br />
        因为早期的设计中，<code>ref</code> 被视为一个特殊的保留属性（就像{" "}
        <code>key</code> 一样），React
        在底层处理元素时会把它剥离出来，导致它不会出现在 <code>props</code>{" "}
        对象里。开发者被迫使用丑陋的 <code>forwardRef</code>{" "}
        高阶组件来“转发”它。
      </Paragraph>
      <Paragraph>
        <strong>React 19 的改变：</strong> <code>ref</code> 正式降级为一个
        <strong>普通的 prop</strong>。你现在可以直接在组件参数{" "}
        <code>&#123; ref, ...props &#125;</code> 中解构拿到它！
      </Paragraph>

      <Divider />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* 旧写法演示区 */}
        <div
          style={{
            padding: "16px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <Title level={5}>1. React 18 传统写法 (forwardRef)</Title>
          <Space>
            <LegacyInput ref={legacyRef} style={{ width: "250px" }} />
            <Button onClick={focusLegacy}>聚焦旧 Input</Button>
          </Space>
        </div>

        {/* 新写法演示区 */}
        <div
          style={{
            padding: "16px",
            background: "#f6ffed",
            borderRadius: "8px",
            border: "1px solid #b7eb8f",
          }}
        >
          <Title level={5}>2. React 19 现代写法 (直接解构 ref)</Title>
          <Space>
            {/* 对于使用者来说，调用方式完全一样，但组件内部的实现优雅了无数倍 */}
            <ModernInput ref={modernRef} style={{ width: "250px" }} />
            <Button type="primary" onClick={focusModern}>
              聚焦新 Input
            </Button>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default RefTestComponent;
