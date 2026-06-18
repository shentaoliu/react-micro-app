import React from "react";
import { Card, Space, Button, Typography, Divider } from "antd";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import {
  increment,
  decrement,
  incrementByAmount,
} from "../store/features/counterSlice";

const { Title, Text } = Typography;

const WorkspaceOverview: React.FC = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="app-content">
      <div className="header-title">
        <Title level={2}>总览看板</Title>
        <Text type="secondary">Vite + React + MicroApp + Antd</Text>
      </div>

      <Card title="Redux Toolkit 状态管理" className="content-section">
        <Space direction="vertical" size="large">
          <Text strong style={{ fontSize: "18px" }}>
            Current Count: {count}
          </Text>
          <Space>
            <Button type="primary" onClick={() => dispatch(increment())}>
              Increment
            </Button>
            <Button onClick={() => dispatch(decrement())}>
              Decrement
            </Button>
            <Button onClick={() => dispatch(incrementByAmount(5))}>
              Increment by 5
            </Button>
          </Space>
        </Space>
      </Card>

      <Card
        title="Ant Design 与 Less 示例"
        className="content-section"
        style={{ marginTop: 24 }}
      >
        <Space>
          <Button type="primary">Primary Button</Button>
          <Button>Default Button</Button>
          <Button type="dashed">Dashed Button</Button>
          <Button type="link">Link Button</Button>
        </Space>
      </Card>

      <Divider style={{ marginTop: 40 }}>MicroApp 微前端子应用容器</Divider>

      <div className="micro-app-container">
        {/* 实际开发中可以通过动态设置 url 来加载不同的子应用 */}
        <micro-app
          name="my-child-app"
          url="http://localhost:3000/"
          iframe
          defaultPage="http://localhost:3000/"
        ></micro-app>
        <div style={{ position: "absolute", pointerEvents: "none" }}>
          <Text type="secondary">
            这里是 MicroApp 子应用挂载点 (当前配置为加载 localhost:3000)
          </Text>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceOverview;
