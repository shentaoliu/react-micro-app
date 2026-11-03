import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const BigDataReviewDetail: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  // 根据 topicId 匹配对应的组件
  const renderTopicComponent = () => {
    switch (topicId) {
      // case 'time-slicing':
      //   return <TimeSlicingDemo />;
      // case 'virtual-list':
      //   return <VirtualListDemo />;
      default:
        // 暂时返回一个占位符，等我们实现了具体的组件后再替换
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <Title level={4}>示例组件正在施工中...</Title>
            <Paragraph>当前路由 ID: {topicId}</Paragraph>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/workspace/big-data')}
        style={{ padding: 0, marginBottom: '16px' }}
      >
        返回列表
      </Button>
      
      {/* 渲染具体的专题组件 */}
      <div style={{ background: '#fff', borderRadius: '8px', minHeight: '400px' }}>
        {renderTopicComponent()}
      </div>
    </div>
  );
};

export default BigDataReviewDetail;