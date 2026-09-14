import React, { useState } from "react";
import { Card, Typography, Button, Space, Alert } from "antd";

const { Paragraph, Text } = Typography;

// --- 模拟博客文章数据 ---
const POSTS = [
  {
    id: 1,
    title: "React 19 发布啦！",
    summary: "React 19 带来了 Actions, use(), Document Head 等众多新特性...",
    content: "这是一篇关于 React 19 新特性的长篇大论文章内容...",
  },
  {
    id: 2,
    title: "如何准备前端面试",
    summary: "前端面试必考点总结：从闭包到 React 原理...",
    content: "这是关于如何通过八股文考核并拿到高薪的秘籍...",
  },
];

// --- 博客详情组件 (展示 Document Head 特性) ---
const BlogPost = ({ post }: { post: (typeof POSTS)[0] }) => {
  return (
    <div
      style={{
        padding: "16px",
        background: "#f5f5f5",
        borderRadius: "8px",
        marginTop: "16px",
      }}
    >
      {/* ⚠️ 面试考点：直接在组件内部渲染 <title> 和 <meta> 
          React 19 会自动将它们“提升（Hoist）”到 HTML 文档的 <head> 标签中！
          我们再也不需要额外安装 react-helmet 这个库了！
      */}
      <title>{post.title} - 面试复习项目</title>
      <meta name="description" content={post.summary} />
      <meta name="keywords" content="React19, 面试, SEO" />

      {/* 这里甚至可以放 <link> 标签来预加载资源 */}
      {/* <link rel="preload" href="/some-image.png" as="image" /> */}

      <h3>{post.title}</h3>
      <Text type="secondary">{post.summary}</Text>
      <div style={{ marginTop: "12px" }}>{post.content}</div>
    </div>
  );
};

// --- 主页面组件 ---
const DocumentHeadTest: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<(typeof POSTS)[0] | null>(
    null,
  );

  return (
    <Card
      title="9. 文档元数据支持 (Document Metadata)"
      style={{ marginBottom: "24px", borderColor: "#faad14" }}
    >
      <Paragraph>
        <strong>面试考点：</strong> 以前为了做 SEO
        或动态修改网页标题，我们需要依赖第三方库（如 <code>react-helmet</code>
        ），或者手动写 <code>document.title = xxx</code>。<br />在 React 19
        中，你可以直接在任意组件里渲染 <code>&lt;title&gt;</code>、
        <code>&lt;meta&gt;</code> 和 <code>&lt;link&gt;</code>。React
        会自动把它们<strong>提升 (Hoist)</strong> 到真正的{" "}
        <code>&lt;head&gt;</code> 标签里！
      </Paragraph>

      <Alert
        message="如何验证这个特性？"
        description={
          <>
            请点击下方按钮切换文章，然后：
            <br />
            1. 观察浏览器顶部的<strong>标签页标题</strong>是否跟着变了。
            <br />
            2. 按 <strong>F12 打开控制台</strong>，查看{" "}
            <code>&lt;head&gt;</code> 标签里的{" "}
            <code>&lt;meta name="description"&gt;</code>
            ，看看内容是不是也同步更新了！
          </>
        }
        type="info"
        showIcon
      />

      <Space style={{ marginTop: "16px" }}>
        <Button onClick={() => setCurrentPost(POSTS[0])}>
          查看文章 1 (React 19)
        </Button>
        <Button onClick={() => setCurrentPost(POSTS[1])}>
          查看文章 2 (面试复习)
        </Button>
        <Button danger onClick={() => setCurrentPost(null)}>
          关闭文章 (恢复默认)
        </Button>
      </Space>

      {currentPost && <BlogPost post={currentPost} />}

      {!currentPost && (
        // 当没有文章时，我们可以渲染一个默认的标题
        <>
          <title>测试的名字哦</title>
          <meta
            name="description"
            content="包含 React 19 所有新特性的面试复习测试页"
          />
        </>
      )}
    </Card>
  );
};

export default DocumentHeadTest;
