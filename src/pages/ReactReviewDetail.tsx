import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ReactReviewDetail: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  // 临时渲染一个占位内容，后续我们会根据 topicId 渲染对应的组件
  return (
    <div style={{ padding: '24px' }}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/workspace/react-review')}
        style={{ padding: 0, marginBottom: '16px' }}
      >
        返回列表
      </Button>
      
      <Title level={3}>专题详情：{topicId}</Title>
      <Paragraph type="secondary">
        这里是 <code>{topicId}</code> 的专属演示页面。您可以让我把之前写好的相关组件抽离到这里，或者写一些新的演示。
      </Paragraph>
    </div>
  );
};

export default ReactReviewDetail;