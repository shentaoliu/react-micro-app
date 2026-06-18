import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div
    className="app-content"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
      background: "#fafafa",
      borderRadius: "8px",
      border: "1px dashed #d9d9d9",
    }}
  >
    <Title level={3} style={{ color: "#999", margin: 0 }}>
      {title} 页面内容建设中...
    </Title>
  </div>
);

export default PlaceholderPage;
