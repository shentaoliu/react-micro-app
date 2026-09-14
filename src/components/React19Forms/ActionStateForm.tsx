import React, { useActionState } from "react";
import { Card, Typography, Button, Input, message, Space, Alert } from "antd";
import { mockLoginApi } from "../../pages/React19FormTest";

const { Paragraph } = Typography;

// 1. 定义 Action 函数
// 注意：使用 useActionState 时，Action 函数的第一个参数是前一次的状态 (prevState)，第二个参数才是 FormData
const submitAction = async (prevState: any, formData: FormData) => {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // 简单校验
    // ⚠️ 重点：如果代码走到这个 if 分支，它会直接 return！
    // 因为这里没有触发任何 await 异步操作，所以对于 React 而言，这个 Action 是“瞬间执行完毕”的。
    // 这就是为什么当你没输入内容点击登录时，按钮的 loading 效果会一闪而过的原因。
    if (!username || !password) {
      return { success: false, errorMsg: "用户名和密码不能为空！", username };
    }

    // 调用异步请求 (必须使用 await，否则 pending 状态会一闪而过)
    await mockLoginApi({ username, password });

    // 直接在 Action 内部触发副作用弹窗
    message.success("登录成功！(来自 useActionState)");

    // 成功后返回新的状态
    return { success: true, errorMsg: null, username: "" };
  } catch (error: any) {
    message.error(error.message);
    // 失败后返回错误信息，并保留刚才填写的 username，防止用户重新输入
    return {
      success: false,
      errorMsg: error.message,
      username: formData.get("username") as string,
    };
  }
};

const ActionStateForm: React.FC = () => {
  // 2. 使用 useActionState (React 19 新特性)
  // 参数1: Action 处理函数
  // 参数2: 初始状态 (initialState)
  // 返回值: [当前状态, 绑定给 form 的 action, 是否处于 pending 状态]
  const [state, formAction, isPending] = useActionState(submitAction, {
    success: false,
    errorMsg: null,
    username: "",
  });

  return (
    <Card
      title="3. 进阶示例：使用 useActionState 管理状态"
      style={{ marginBottom: "24px" }}
    >
      <Paragraph>
        在基础示例中，我们还需要手动写 <code>useState</code> 来管理{" "}
        <code>isLoading</code> 和错误信息。 React 19 提供了{" "}
        <strong>
          <code>useActionState</code>
        </strong>
        ，它可以帮我们把表单的<strong>提交结果(state)</strong>和
        <strong>挂起状态(isPending)</strong>全部接管！
      </Paragraph>

      {/* 这里的 formAction 是由 useActionState 返回的，它包装了我们原始的 submitAction */}
      <form action={formAction} style={{ maxWidth: "300px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* 如果服务端返回了错误信息，直接在这里展示 */}
          {state.errorMsg && (
            <Alert message={state.errorMsg} type="error" showIcon />
          )}

          <div>
            <label>用户名：</label>
            {/* defaultValue 绑定 state 里的 username，即使提交失败，也能保留上次输入的值 */}
            <Input
              name="username"
              defaultValue={state.username}
              placeholder="请输入 admin"
            />
          </div>
          <div>
            <label>密码：</label>
            {/* 密码出于安全考虑通常不保留 defaultValue */}
            <Input.Password name="password" placeholder="请输入 123456" />
          </div>

          {/* 直接使用 useActionState 提供的 isPending 状态，不再需要自己写 useState */}
          <Button type="primary" htmlType="submit" loading={isPending} block>
            {isPending ? "登录中..." : "登录"}
          </Button>
        </Space>
      </form>
    </Card>
  );
};

export default ActionStateForm;
