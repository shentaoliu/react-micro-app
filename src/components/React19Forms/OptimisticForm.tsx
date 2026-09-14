import React, { useOptimistic, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  List,
  Tag,
  message,
} from "antd";

const { Paragraph } = Typography;

// 模拟后端的添加待办 API
const mockAddTodoApi = async (
  text: string,
): Promise<{ id: number; text: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟偶尔的网络失败，方便演示乐观更新的回滚
      if (text.includes("error")) {
        reject(new Error("服务端保存失败！(测试用)"));
      } else {
        resolve({ id: Date.now(), text });
      }
    }, 2000); // 模拟 2 秒的超长网络延迟，让乐观更新的效果更明显
  });
};

type Todo = { id: number; text: string; pending?: boolean };

const OptimisticForm: React.FC = () => {
  // 真实的后端数据状态
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "学习 React 19" },
    { id: 2, text: "复习面试题" },
  ]);

  // 1. 使用 useOptimistic (React 19 新特性)
  // 参数1: 真实的真实状态 (todos)
  // 参数2: 乐观更新的回调函数 (如何把新数据合并到老数据中)
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (currentTodos, newTodoText: string) => [
      ...currentTodos,
      { id: Math.random(), text: newTodoText, pending: true }, // 打上 pending 标记
    ],
  );

  // 2. 表单 Action 函数
  const formAction = async (formData: FormData) => {
    const text = formData.get("todo") as string;
    if (!text.trim()) return;

    // 关键步骤 A：立刻触发乐观更新！
    // 这会让 UI 瞬间把新任务显示出来，不用等后端接口返回
    addOptimisticTodo(text);

    try {
      // 关键步骤 B：发起真实的异步请求
      const newTodo = await mockAddTodoApi(text);

      // 关键步骤 C：真实请求成功后，更新真实的 state
      // 当 setTodos 触发重新渲染时，useOptimistic 会自动用最新的 todos 覆盖掉之前的乐观状态，pending 标记也会消失
      setTodos((prev) => [...prev, newTodo]);
      message.success("已保存到服务器");
    } catch (error: any) {
      // 如果失败了，我们只需要弹出提示。
      // 因为真实的 todos 并没有被修改，所以重新渲染后，刚刚那条乐观更新的数据会自动消失（回滚）！
      message.error(error.message);
    }
  };

  return (
    <Card
      title="5. 极致体验：useOptimistic 乐观更新"
      style={{ marginBottom: "24px" }}
    >
      <Paragraph>
        <strong>面试常考点：</strong> 什么是乐观更新？
        <br />
        当我们向服务器发请求时（比如点赞、发评论），不要等服务器返回成功才更新
        UI。而是“乐观地”假设请求一定会成功，<strong>立刻</strong>
        把结果画在屏幕上。等真实请求返回后，再做静默替换；如果失败了，则自动回滚。
      </Paragraph>
      <Paragraph>
        在这个例子中，我设置了 <strong>2 秒钟的网络延迟</strong>
        。您可以输入任务并点击添加，看看 UI 是不是瞬间响应的！(可以尝试输入包含{" "}
        <code>error</code> 的文本，观察失败回滚效果)
      </Paragraph>

      <form action={formAction} style={{ maxWidth: "400px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <Input name="todo" placeholder="输入待办事项，例如 '吃饭'" />
            <Button type="primary" htmlType="submit">
              添加
            </Button>
          </div>
        </Space>
      </form>

      <List
        style={{ marginTop: "16px", maxWidth: "400px" }}
        bordered
        dataSource={optimisticTodos}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text style={{ opacity: item.pending ? 0.5 : 1 }}>
              {item.text}
            </Typography.Text>
            {item.pending && (
              <Tag color="processing" style={{ marginLeft: 8 }}>
                提交中...
              </Tag>
            )}
          </List.Item>
        )}
      />
    </Card>
  );
};

export default OptimisticForm;
