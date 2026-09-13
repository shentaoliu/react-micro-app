import React, { useState } from "react";
import { Card, Typography, Button, Input, message, Space } from "antd";
import { mockLoginApi } from "../../pages/React19FormTest";

const { Paragraph } = Typography;

const BasicActionForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // React 19 Action 处理函数
  const loginAction = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // 1. 直接通过原生的 FormData API 获取表单数据
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      console.log("Action 获取到的表单数据:", { username, password });

      // 2. 调用异步请求
      await mockLoginApi({ username, password });
      message.success("登录成功！");
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      title="2. 基础 Action 示例：LoginForm"
      style={{ marginBottom: "24px" }}
    >
      <Paragraph>
        这就是你提供的那个例子。注意观察代码：我们没有写{" "}
        <code>e.preventDefault()</code>，也没有通过受控组件（
        <code>onChange</code>）去绑定输入框的值。直接利用原生的{" "}
        <code>name</code> 属性和 <code>FormData</code> 即可完成数据收集。
      </Paragraph>

      {/* 注意：在 React 19 中，form 的 action 属性可以直接接收一个异步函数 */}
      <form
        onSubmit={(e) => {
          // 因为在这个基础示例中我们自己管理 loading 状态
          // 在提交时为了防止重复点击，我们需要拦截一下，或者交由按钮的 loading 状态处理
          // React 19 的 action 会在 submit 事件之后执行
        }}
        action={loginAction}
        style={{ maxWidth: "300px" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <label>用户名：</label>
            {/* 必须要有 name 属性，FormData 才能提取到 */}
            <Input name="username" placeholder="请输入 admin" />
          </div>
          <div>
            <label>密码：</label>
            <Input.Password name="password" placeholder="请输入 123456" />
          </div>

          {/* 目前我们先手动用 useState 控制 loading，后续示例会引入 useFormStatus */}
          {/* 这里有个坑：如果在 form action 中使用 useState，React 19 的并发渲染可能会导致 UI 没有立即更新 loading 状态 */}
          {/* 这是因为 action 本身被包裹在了 transition 中，所以 state 更新变成了低优先级 */}
          {/* 这也正是为什么 React 19 强烈推荐使用 useActionState 或 useFormStatus 的原因！ */}
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </Space>
      </form>
    </Card>
  );
};

export default BasicActionForm;
