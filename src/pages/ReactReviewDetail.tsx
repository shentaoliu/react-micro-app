import React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import JsxReview from "./ReactReviewTopics/JsxReview";
import SuspenseLazyReview from "./ReactReviewTopics/SuspenseLazyReview";

const { Title } = Typography;

const ReactReviewDetail: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  // 根据 topicId 匹配对应的组件
  const renderTopicComponent = () => {
    switch (topicId) {
      case "jsx":
        return <JsxReview />;
      case "suspense-react-lazy":
        return <SuspenseLazyReview />;
      // 后续在这里继续追加 case 'memo': return <MemoReview /> 等等
      default:
        return <Navigate to="/workspace/react-review" replace />;
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/workspace/react-review")}
        style={{ padding: 0, marginBottom: "16px" }}
      >
        返回列表
      </Button>

      {/* 渲染具体的专题组件 */}
      <div
        style={{ background: "#fff", borderRadius: "8px", minHeight: "400px" }}
      >
        {renderTopicComponent()}
      </div>
    </div>
  );
};

export default ReactReviewDetail;
