import React, { useState } from 'react';
import { Card, Typography, Button, Input, message, Space } from 'antd';
import { mockLoginApi } from '../../pages/React19FormTest';

const { Paragraph } = Typography;

const LegacyForm: React.FC = () => {
  // 1. 需要手动声明受控组件的状态
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // 2. 需要手动管理 loading 状态
  const [isLoading, setIsLoading] = useState(false);

  // 老式的 onSubmit 处理函数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 3. 必须手动阻止浏览器默认的表单提交行为（刷新页面）
    e.preventDefault();
    
    // 简单的非空校验
    if (!username || !password) {
      message.warning("请输入用户名和密码！");
      return;
    }

    setIsLoading(true);
    try {
      console.log('onSubmit 获取到的受控表单数据:', { username, password });
      
      // 4. 调用异步请求
      await mockLoginApi({ username, password });
      message.success('登录成功！(Legacy)');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      // 5. 确保请求结束后关闭 loading
      setIsLoading(false);
    }
  };

  return (
    <Card title="1. React 18 及以前的传统写法 (受控组件 + onSubmit)" style={{ marginBottom: "24px" }}>
      <Paragraph>
        这是大家最熟悉的传统写法。我们需要写 <code>e.preventDefault()</code>，需要维护两个 <code>useState</code> 来实现受控输入框，还需要维护一个 <code>isLoading</code> 状态。
        这里 <strong>可以正常看到按钮的 Loading 转圈</strong>，因为没有被包裹在 React 19 的 Transition 机制中。
      </Paragraph>

      <form onSubmit={handleSubmit} style={{ maxWidth: '300px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>用户名：</label>
            {/* 6. 必须绑定 value 和 onChange 成为受控组件 */}
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="请输入 admin" 
            />
          </div>
          <div>
            <label>密码：</label>
            <Input.Password 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="请输入 123456" 
            />
          </div>
          
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </Space>
      </form>
    </Card>
  );
};

export default LegacyForm;