import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

function ReactTest() {
  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Typography>
          <Title level={2}>React 测试页面</Title>
          <Paragraph>
            这是一个用于测试 React 特性（如 Hooks, Context, 性能优化等）以及复习 React 面试题的沙盒页面。
          </Paragraph>
        </Typography>
        <div style={{ marginTop: 24, border: "1px dashed #ccc", padding: 16 }}>
          <p>React 测试区域</p>
        </div>
      </Card>
    </div>
  );
}

export default ReactTest;
