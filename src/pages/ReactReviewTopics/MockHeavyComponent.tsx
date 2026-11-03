import React from 'react';
import { Alert } from 'antd';

const MockHeavyComponent: React.FC = () => {
  return (
    <Alert
      message="成功！我是被动态加载进来的沉重组件！"
      description="在实际的生产环境中，我会被 Webpack/Vite 打包成一个独立的 JS 文件（Chunk）。只有当用户点击了加载按钮，浏览器才会发起 HTTP 请求去下载我的代码，从而极大地减小了首屏的 JS 体积。"
      type="success"
      showIcon
    />
  );
};

export default MockHeavyComponent;