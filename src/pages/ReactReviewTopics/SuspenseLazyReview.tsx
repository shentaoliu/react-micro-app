import React, { useState, Suspense, lazy } from 'react';
import { Card, Typography, Button, Spin, Divider } from 'antd';

const { Paragraph } = Typography;

// 1. 使用 React.lazy 配合动态 import() 语法引入组件。
// 注意：为了在演示中能看清 Suspense 的 fallback 效果，这里用 Promise 模拟了 1.5 秒的网络延迟。
// 在真实项目中，只需直接写：const LazyComponent = lazy(() => import('./MockHeavyComponent'));
const LazyComponent = lazy(() => {
  return new Promise<{ default: React.ComponentType<any> }>((resolve) => {
    setTimeout(() => {
      import('./MockHeavyComponent').then(resolve);
    }, 1500);
  });
});

const SuspenseLazyReview: React.FC = () => {
  const [show, setShow] = useState(false);

  return (
    <Card title="Suspense 与 React.lazy 原理解析" bordered={false}>
      <Paragraph>
        <strong>面试官提问：</strong>React.lazy 和 Suspense 是用来做什么的？它们解决了什么问题？
      </Paragraph>
      <Paragraph>
        <strong>满分回答：</strong>它们主要用于<strong>代码分割（Code Splitting）</strong>和<strong>按需加载</strong>。<br />
        默认情况下，打包工具（如 Webpack/Vite）会把所有代码打进一个巨大的 JS 文件中，导致首屏加载极慢。<br />
        <code>React.lazy</code> 配合动态的 <code>import()</code> 语法，可以将不常用的大组件拆分成独立的 JS 代码块（Chunk）。<br />
        而 <code>Suspense</code> 则用于在这个独立的 JS 包下载的过程中，优雅地展示一个 <code>fallback</code>（如 Loading 动画），避免用户看到白屏或报错。
      </Paragraph>

      <Divider>动态按需加载演示</Divider>

      <Button type="primary" onClick={() => setShow(true)} disabled={show}>
        {show ? '正在/已经加载' : '点击加载“重型组件”'}
      </Button>

      <div 
        style={{ 
          marginTop: '16px', 
          minHeight: '120px', 
          border: '1px dashed #d9d9d9', 
          padding: '16px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {show ? (
          // 2. 使用 Suspense 包裹懒加载的组件，并提供 fallback UI
          <Suspense fallback={<Spin tip="正在下载独立的 JS 资源包 (模拟 1.5s 网络延迟)..." />}>
            <LazyComponent />
          </Suspense>
        ) : (
          <div style={{ color: '#999' }}>
            组件暂未挂载，浏览器当前没有下载它的 JS 文件。
          </div>
        )}
      </div>
    </Card>
  );
};

export default SuspenseLazyReview;