import React from "react";
import { Card, Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { DatabaseOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

// 配置所有的大数据渲染卡片
const bigDataTopics = [
  {
    id: "time-slicing",
    title: "时间分片 (Time Slicing)",
    description:
      "通过 setTimeout 或 requestAnimationFrame 将长任务拆分，避免阻塞主线程。",
  },
  {
    id: "virtual-list",
    title: "虚拟列表 (Virtual List)",
    description: "只渲染可视区域内的 DOM 节点，海量数据也能保持丝滑滚动。",
  },
  {
    id: "variable-height-virtual-list",
    title: "不定高虚拟列表",
    description: "动态测量行高，通过前缀和与二分查找渲染可视区域。",
  },
  {
    id: "worker-processing",
    title: "Worker + 分块处理",
    description: "在后台线程处理 10 万条订单，支持进度展示、取消任务，保持页面交互流畅。",
  },
];

const BigDataReviewList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>大数据渲染优化方案</Title>
      <Paragraph type="secondary" style={{ marginBottom: "24px" }}>
        这里收录了前端面试中必考的长列表/海量数据渲染优化方案。点击卡片进入独立的示例页面。
      </Paragraph>

      <Row gutter={[16, 16]}>
        {bigDataTopics.map((topic) => (
          <Col xs={24} sm={12} md={8} lg={6} key={topic.id}>
            <Card
              hoverable
              onClick={() => navigate(`/workspace/big-data/${topic.id}`)}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              styles={{
                body: { flex: 1, display: "flex", flexDirection: "column" },
              }}
            >
              <Card.Meta
                avatar={
                  <DatabaseOutlined
                    style={{ fontSize: "24px", color: "#1677ff" }}
                  />
                }
                title={topic.title}
                description={
                  <div
                    style={{
                      marginTop: "8px",
                      color: "#666",
                      fontSize: "13px",
                      flex: 1,
                    }}
                  >
                    {topic.description}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BigDataReviewList;
