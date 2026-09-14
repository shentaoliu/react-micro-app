import React, { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, Typography, Button, Input, message, Space, Alert } from "antd";
import { mockLoginApi } from "../../pages/React19FormTest";

const { Paragraph } = Typography;

type LoginState = {
  success: boolean;
  errorMsg: string | null;
  username: string;
};

const showMessageUntilClose = (
  type: "success" | "error",
  content: string,
) => {
  return new Promise<void>((resolve) => {
    message.open({
      type,
      content,
      duration: 2,
      onClose: resolve,
    });
  });
};

// --- 子组件：独立的提交按钮 ---
const SubmitButton: React.FC<{ messagePending: boolean }> = ({
  messagePending,
}) => {
  const { pending, data } = useFormStatus();
  const loading = pending || messagePending;

  const submittingUser = data?.get("username");
  const loadingText = submittingUser
    ? `正在登录 ${submittingUser}...`
    : "正在登录...";

  return (
    <Button
      disabled={loading}
      type="primary"
      htmlType="submit"
      loading={loading}
      block
    >
      {loading ? loadingText : "登录"}
    </Button>
  );
};

// --- 主组件 ---
const FormStatusForm: React.FC = () => {
  const [messagePending, setMessagePending] = useState(false);

  // --- Action 函数 ---
  const submitAction = async (
    _prevState: LoginState,
    formData: FormData,
  ): Promise<LoginState> => {
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");

    try {
      if (!username || !password) {
        setMessagePending(true);
        await showMessageUntilClose("error", "用户名和密码不能为空！");
        setMessagePending(false);

        return {
          success: false,
          errorMsg: "用户名和密码不能为空！",
          username,
        };
      }

      await mockLoginApi({ username, password });

      setMessagePending(true);
      await showMessageUntilClose("success", "登录成功！(结合 useFormStatus)");
      setMessagePending(false);

      return {
        success: true,
        errorMsg: null,
        username: "",
      };
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "登录失败，请稍后重试";

      setMessagePending(true);
      await showMessageUntilClose("error", errorMsg);
      setMessagePending(false);

      return {
        success: false,
        errorMsg,
        username,
      };
    }
  };

  const [state, formAction] = useActionState(submitAction, {
    success: false,
    errorMsg: null,
    username: "",
  });

  return (
    <Card
      title="4. 终极组件拆分：结合 useFormStatus"
      style={{ marginBottom: "24px" }}
    >
      <Paragraph>
        <strong>面试常考点：</strong> 为什么有了 <code>useActionState</code>{" "}
        返回的 <code>isPending</code>，还需要 <code>useFormStatus</code>？
      </Paragraph>

      <Paragraph>
        想象一个复杂的场景：你的表单组件非常庞大，提交按钮被拆分到了很深的子组件中。如果用{" "}
        <code>isPending</code>，你需要一层层地把状态作为 props 传下去（Prop
        Drilling）。
        <br />而 <code>useFormStatus</code> 就像一个内置的
        Context。只要你把它写在 <code>&lt;form&gt;</code>{" "}
        内部的任何层级的子组件中，它就能自动读取到外层表单的提交状态和提交数据！
      </Paragraph>

      <form action={formAction} style={{ maxWidth: "300px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {state.errorMsg && (
            <Alert message={state.errorMsg} type="error" showIcon />
          )}

          <div>
            <label>用户名：</label>
            <Input
              name="username"
              defaultValue={state.username}
              placeholder="请输入 admin"
            />
          </div>

          <div>
            <label>密码：</label>
            <Input.Password name="password" placeholder="请输入 123456" />
          </div>

          <SubmitButton messagePending={messagePending} />
        </Space>
      </form>
    </Card>
  );
};

export default FormStatusForm;
