import React from "react";
import { Card, Typography, Alert } from "antd";
import BasicActionForm from "../components/React19Forms/BasicActionForm";
import ActionStateForm from "../components/React19Forms/ActionStateForm";

const { Title, Paragraph } = Typography;

// 模拟后端的登录 API
export const mockLoginApi = async (data: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.username === "admin" && data.password === "123456") {
        resolve({ success: true, token: "mock_token_xxx" });
      } else {
        reject(new Error("用户名或密码错误！(提示: admin/123456)"));
      }
    }, 1500); // 模拟 1.5 秒的网络延迟
  });
};

const React19FormTest: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>React 19 表单新特性测试</Title>
      <Paragraph>
        这个页面用于展示和复习 React 19 中关于表单处理的新特性（如 Actions,
        useActionState, useFormStatus, useOptimistic 等）。
      </Paragraph>

      <Card title="1. React 19 Actions 简介" style={{ marginBottom: "24px" }}>
        <Alert
          message="什么是 Actions？"
          description={
            <>
              <p>
                在 React 19 之前，处理表单提交通常需要手动管理{" "}
                <code>pending</code> 状态、阻止默认事件{" "}
                <code>e.preventDefault()</code>，然后调用异步请求。
              </p>
              <p>
                React 19 引入了 <strong>Actions</strong>
                。你可以直接将一个异步函数传递给{" "}
                <code>&lt;form action=&#123;myAction&#125;&gt;</code>。React
                会自动管理表单的提交生命周期，包括挂起状态（pending
                state）、错误处理和乐观更新（optimistic updates）。
              </p>
            </>
          }
          type="info"
          showIcon
        />
      </Card>

      <BasicActionForm />
      <ActionStateForm />
    </div>
  );
};

export default React19FormTest;
