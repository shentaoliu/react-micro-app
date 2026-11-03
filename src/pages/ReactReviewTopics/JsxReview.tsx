import React, { createElement, useState } from "react";
import { Card, Typography, Divider, Button, Space } from "antd";

const { Title, Paragraph, Text } = Typography;

const JsxReview: React.FC = () => {
  const [count, setCount] = useState(0);

  // ==========================================
  // 1. 现代 React 开发者写的 JSX
  // ==========================================
  const jsxElement = (
    <div
      className="jsx-container"
      style={{
        padding: "16px",
        background: "#f6ffed",
        border: "1px solid #b7eb8f",
        borderRadius: "8px",
      }}
    >
      <h3 style={{ color: "#52c41a" }}>这是用 JSX 写的</h3>
      <p>计数器的值: {count}</p>
      <Button type="primary" onClick={() => setCount((c) => c + 1)}>
        点击 +1
      </Button>
    </div>
  );

  // ==========================================
  // 2. 编译后的真实面貌：React.createElement (面试必考)
  // ==========================================
  // Babel/TypeScript 编译器会将上面的 JSX 转换成下面的函数调用
  const createElementResult = createElement(
    "div",
    {
      className: "jsx-container",
      style: {
        padding: "16px",
        background: "#fff0f6",
        border: "1px solid #ffadd2",
        borderRadius: "8px",
      },
    },
    createElement(
      "h3",
      { style: { color: "#eb2f96" } },
      "这是用 createElement 写的",
    ),
    createElement("p", null, `计数器的值: ${count}`),
    createElement(
      Button,
      { type: "primary", danger: true, onClick: () => setCount((c) => c + 1) },
      "点击 +1",
    ),
  );

  // ==========================================
  // 3. 最终产物：虚拟 DOM 对象 (Virtual DOM)
  // ==========================================
  // 面试官问：JSX 到底是什么？
  // 答：JSX 只是 React.createElement 的语法糖，它执行后的返回值是一个普通的 JavaScript 对象，也就是虚拟 DOM。
  const virtualDomExample = {
    type: "div",
    props: {
      className: "jsx-container",
      children: [
        /* 子节点也是类似的对象 */
      ],
    },
  };

  console.log(jsxElement);

  return (
    <div>
      <Card title="JSX 核心原理解析" bordered={false}>
        <Paragraph>
          <strong>面试官提问：</strong>请解释一下什么是
          JSX？浏览器能直接运行它吗？
        </Paragraph>
        <Paragraph>
          <strong>满分回答：</strong>JSX 是一种 JavaScript 的语法扩展。浏览器
          <strong>不能</strong>直接运行它，必须经过 Babel 或 TypeScript
          编译。它本质上只是{" "}
          <code>React.createElement(type, config, children)</code>{" "}
          的语法糖。执行后会返回一个 <strong>虚拟 DOM 对象</strong>。
        </Paragraph>

        <Divider>直观对比实验</Divider>

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* 渲染 JSX */}
          <div>
            <Text strong>1. JSX 写法渲染出的效果：</Text>
            <div style={{ marginTop: "8px" }}>{jsxElement}</div>
          </div>

          {/* 渲染 createElement */}
          <div>
            <Text strong>2. createElement 写法渲染出的效果 (完全等价)：</Text>
            <div style={{ marginTop: "8px" }}>{createElementResult}</div>
          </div>
        </Space>

        <Divider>底层产物查看</Divider>
        <Paragraph>
          如果您在代码里 <code>console.log(jsxElement)</code>
          ，您会看到它其实长这样（即虚拟 DOM）：
        </Paragraph>
        <pre
          style={{
            background: "#282c34",
            color: "#abb2bf",
            padding: "16px",
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(virtualDomExample, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

export default JsxReview;
