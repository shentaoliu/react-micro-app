import React from "react";
import { Card, Typography, Alert } from "antd";
import LegacyForm from "../components/React19Forms/LegacyForm";
import BasicActionForm from "../components/React19Forms/BasicActionForm";
import ActionStateForm from "../components/React19Forms/ActionStateForm";
import FormStatusForm from "../components/React19Forms/FormStatusForm";
import OptimisticForm from "../components/React19Forms/OptimisticForm";

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

      <Card title="React 19 Actions 简介" style={{ marginBottom: "24px" }}>
        <Alert
          message="为什么要引入 Actions？"
          description={
            <>
              <p>
                在往下看之前，先看看 <strong>示例1</strong>{" "}
                的传统写法。你需要写一堆样板代码：阻止默认事件、受控组件绑定、手动管理
                Loading 和 Error。
              </p>
              <p>
                React 19 引入了 <strong>Actions</strong>（示例2 和
                示例3）。你可以直接将一个异步函数传递给{" "}
                <code>&lt;form action=&#123;myAction&#125;&gt;</code>。配合新的
                Hooks，React 会自动接管表单的生命周期，大大简化了代码！
              </p>
            </>
          }
          type="info"
          showIcon
        />
      </Card>

      <LegacyForm />
      <BasicActionForm />
      <ActionStateForm />
      <FormStatusForm />
      <OptimisticForm />
    </div>
  );
};

export default React19FormTest;
