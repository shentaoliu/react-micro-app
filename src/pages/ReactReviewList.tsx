import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ReadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// 配置所有的复习卡片
const reviewTopics = [
  {
    id: 'memo',
    title: 'React.memo 与浅比较',
    description: '演示 memo 的作用、失效场景及自定义比较函数。',
  },
  {
    id: 'use-memo-callback',
    title: 'useMemo 与 useCallback',
    description: '彻底搞懂什么时候该用缓存，什么时候是在帮倒忙。',
  },
  {
    id: 'use-layout-effect',
    title: 'useEffect vs useLayoutEffect',
    description: '直观演示闪屏现象与渲染阻塞问题。',
  },
  {
    id: 'closure-trap',
    title: 'Hooks 闭包陷阱',
    description: '演示 setInterval 中读不到最新状态的经典 Bug 及解法。',
  },
  {
    id: 'use-id',
    title: 'useId 与 SSR',
    description: '演示如何解决服务端渲染和客户端渲染 ID 不匹配的问题。',
  }
];

const ReactReviewList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>React 经典面试题复习</Title>
      <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
        这里收录了 React 面试中最常考的代码场景。点击卡片进入独立的示例页面进行沉浸式测试。
      </Paragraph>

      <Row gutter={[16, 16]}>
        {reviewTopics.map(topic => (
          <Col xs={24} sm={12} md={8} lg={6} key={topic.id}>
            <Card 
              hoverable 
              onClick={() => navigate(`/workspace/react-review/${topic.id}`)}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
            >
              <Card.Meta 
                avatar={<ReadOutlined style={{ fontSize: '24px', color: '#1677ff' }} />}
                title={topic.title} 
                description={
                  <div style={{ marginTop: '8px', color: '#666', fontSize: '13px', flex: 1 }}>
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

export default ReactReviewList;