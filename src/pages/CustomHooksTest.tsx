import React, { useState } from "react";
import { Typography, Card, Input, Spin, Alert, List, Avatar, Tag } from "antd";
import { useFetch } from "../hooks/useFetch";

const { Title, Paragraph, Text } = Typography;

// ==========================================
// 示例 1: 基础用法 - UserProfile
// ==========================================
const UserProfile = ({ userId }: { userId: number }) => {
  // 1. 直接调用 Hook，这里我们用 reqres.in 的公共 API 来模拟
  const { data, loading, error } = useFetch(
    `https://reqres.in/api/users/${userId}`,
  );

  // 2. 优雅地处理加载中状态
  if (loading) return <Spin tip="加载用户信息中..." style={{ margin: 20 }} />;

  // 3. 优雅地处理错误状态
  if (error)
    return <Alert message={`出错了: ${error.message}`} type="error" showIcon />;
  if (!data || !data.data) return null;

  const user = data.data;

  // 4. 正常渲染数据
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "#f5f5f5",
        padding: "16px",
        borderRadius: "8px",
      }}
    >
      <Avatar src={user.avatar} size={64} />
      <div>
        <h3 style={{ margin: 0 }}>
          {user.first_name} {user.last_name}
        </h3>
        <p style={{ margin: "4px 0 0 0", color: "#666" }}>邮箱: {user.email}</p>
      </div>
    </div>
  );
};

// ==========================================
// 示例 2: 进阶用法 (竞态条件处理) - SearchUser
// ==========================================
const SearchUser = () => {
  const [keyword, setKeyword] = useState("");

  // 当 keyword 改变时，useFetch 会自动重新请求
  // 这里我们用 github API 演示搜索，故意加一个 per_page=5 限制数量
  const { data, loading, error } = useFetch(
    keyword
      ? `https://api.github.com/search/users?q=${keyword}&per_page=5`
      : null,
  );

  return (
    <div>
      <Paragraph type="secondary">
        试着在下方输入框<strong>快速、连续</strong>地输入内容（比如快速打出
        "react"）。
        <br />
        您可以打开浏览器的 Network 面板查看，旧的未完成请求会被{" "}
        <code>AbortController</code> 自动取消（显示为{" "}
        <Text type="danger">canceled</Text>），这完美解决了
        <strong>“竞态条件”</strong>问题。
      </Paragraph>

      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="输入 Github 用户名快速搜索..."
        allowClear
        style={{ marginBottom: "16px", maxWidth: "300px" }}
      />

      {loading && (
        <div style={{ marginBottom: 16 }}>
          <Spin size="small" /> 正在搜索...
        </div>
      )}
      {error && (
        <Alert
          message="搜索失败"
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {data && data.items && (
        <List
          size="small"
          bordered
          dataSource={data.items}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar_url} />}
                title={
                  <a href={item.html_url} target="_blank" rel="noreferrer">
                    {item.login}
                  </a>
                }
                description={`ID: ${item.id}`}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

// ==========================================
// 页面主组件
// ==========================================
const CustomHooksTest: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>自定义 Hook 面试题测试</Title>
      <Paragraph type="secondary">
        这里是用于测试和复习 React 自定义 Hook（如
        useDebounce、useThrottle、useFetch 等）的沙盒环境。
      </Paragraph>

      <Card
        title={
          <span>
            1. 万能的数据请求 Hook: <code>useFetch</code>
          </span>
        }
        style={{ marginBottom: 24 }}
        extra={<Tag color="blue">必考手写题</Tag>}
      >
        <Paragraph>
          <strong>面试官问：</strong>请手写一个 <code>useFetch</code>，并处理好
          loading、error 以及<strong>组件卸载时的内存泄漏</strong>和
          <strong>请求竞态问题</strong>。
        </Paragraph>

        <Card
          type="inner"
          title="场景 A：基础数据获取 (UserProfile)"
          style={{ marginBottom: 16 }}
        >
          <UserProfile userId={2} />
        </Card>

        <Card type="inner" title="场景 B：带竞态处理的实时搜索 (SearchUser)">
          <SearchUser />
        </Card>
      </Card>
    </div>
  );
};

export default CustomHooksTest;
