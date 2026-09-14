import React, { createContext, useContext, useState } from 'react';
import { Card, Typography, Switch, Space, Divider, Alert } from 'antd';

const { Paragraph, Text } = Typography;

// --- 1. 创建 Context ---
const ThemeContext = createContext<'light' | 'dark'>('light');

// --- 2. 消费者组件 ---
const ThemeConsumer: React.FC = () => {
  const theme = useContext(ThemeContext);
  return (
    <div style={{
      padding: '16px',
      background: theme === 'dark' ? '#333' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
      border: '1px solid #ccc',
      borderRadius: '8px',
      transition: 'all 0.3s'
    }}>
      当前主题：<strong>{theme}</strong>
    </div>
  );
};

// --- 3. 主页面组件 ---
const ContextProviderTest: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <Card title="8. Context 直接作为 Provider (React 19 新特性)" style={{ marginBottom: "24px", borderColor: '#722ed1' }}>
      <Paragraph>
        <strong>面试考点：</strong> 在 React 19 之前，我们需要使用 <code>&lt;Context.Provider value=&#123;...&#125;&gt;</code> 来包裹子组件。<br/>
        在 React 19 中，你可以直接将 Context 本身渲染为 Provider：<code>&lt;Context value=&#123;...&#125;&gt;</code>。
      </Paragraph>

      <Alert 
        message="React 官方建议" 
        description={<>旧的 <code>&lt;Context.Provider&gt;</code> 虽然仍然有效，但官方推荐以后都直接使用 <code>&lt;Context&gt;</code>，这样代码更加简洁。</>} 
        type="info" 
        showIcon 
        style={{ marginBottom: '16px' }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* 旧写法演示 */}
        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <Space style={{ marginBottom: '16px' }}>
            <Text strong>1. 旧写法：使用 ThemeContext.Provider</Text>
            <Switch 
              checkedChildren="Dark" 
              unCheckedChildren="Light" 
              checked={theme === 'dark'} 
              onChange={(c) => setTheme(c ? 'dark' : 'light')} 
            />
          </Space>
          
          <ThemeContext.Provider value={theme}>
            <ThemeConsumer />
          </ThemeContext.Provider>
        </div>

        {/* 新写法演示 */}
        <div style={{ padding: '16px', background: '#f9f0ff', borderRadius: '8px', border: '1px solid #d3adf7' }}>
          <Space style={{ marginBottom: '16px' }}>
            <Text strong>2. 新写法：直接使用 ThemeContext</Text>
            <Switch 
              checkedChildren="Dark" 
              unCheckedChildren="Light" 
              checked={theme === 'dark'} 
              onChange={(c) => setTheme(c ? 'dark' : 'light')} 
            />
          </Space>
          
          {/* React 19 新特性：直接把 Context 当 Provider 用 */}
          <ThemeContext value={theme}>
            <ThemeConsumer />
          </ThemeContext>
        </div>

      </Space>
    </Card>
  );
};

export default ContextProviderTest;