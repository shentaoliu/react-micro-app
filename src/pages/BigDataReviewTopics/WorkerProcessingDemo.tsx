import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Progress, Space, Table, Typography } from "antd";

type WorkerResult = {
  type: "progress" | "done" | "cancelled";
  progress: number;
  count: number;
  elapsed: number;
  result: { id: number; amount: number }[];
};

export default function WorkerProcessingDemo() {
  const workerRef = useRef<Worker | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("等待处理");
  const [orders, setOrders] = useState<WorkerResult["result"]>([]);
  const [clicks, setClicks] = useState(0);

  useEffect(() => () => workerRef.current?.terminate(), []);

  function start() {
    // 每次任务使用独立 Worker，避免旧任务的消息覆盖新结果。
    workerRef.current?.terminate();
    setProgress(0);
    setOrders([]);
    setRunning(true);
    setStatus("正在扫描 10 万条订单…");
    try {
      // import.meta.url：当前模块的地址
      // 这里指的是写下这行代码的文件，也就是 WorkerProcessingDemo.tsx 对应的模块地址。
      // 它不是当前页面的路由地址，也不是 Worker 文件的地址。

      // new URL(...)：确定 Worker 文件在哪里

      // 意思是：以当前模块为基准，找到同目录下的 order.worker.ts。
      const worker = new Worker(new URL("./order.worker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current = worker;
      worker.onmessage = ({ data }: MessageEvent<WorkerResult>) => {
        if (workerRef.current !== worker) return;
        if (data.type === "progress") {
          setProgress(data.progress);
          if (data.progress === 100) setStatus("扫描完成，正在排序…");
        } else {
          setRunning(false);
          if (data.type === "done") {
            setOrders(data.result);
            setStatus(
              `处理完成：符合条件 ${data.count} 条，耗时 ${data.elapsed} ms（含分块等待）`,
            );
          } else {
            setStatus("任务已取消");
          }
          worker.terminate();
          workerRef.current = null;
        }
      };
      worker.onerror = () => {
        setStatus("处理失败，请重试");
        setRunning(false);
        worker.terminate();
        workerRef.current = null;
      };
      worker.postMessage({ type: "start" });
    } catch {
      setRunning(false);
      setStatus("Worker 启动失败，请重试");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>
        Worker + 分块处理 10 万条订单
      </Typography.Title>
      <Typography.Paragraph>
        Worker 生成订单、计算金额、筛选金额 ≥ 1000 的订单并降序排序。每批处理
        2000 条，通过 setTimeout 让出执行权，接收取消消息。全部筛选结果一次性返回主线程，
        再通过虚拟列表按需渲染可视区域，滚动即可浏览所有结果。
      </Typography.Paragraph>
      <Space wrap>
        <Button type="primary" onClick={start} disabled={running}>
          开始处理
        </Button>
        <Button
          disabled={!running}
          onClick={() => workerRef.current?.postMessage({ type: "cancel" })}
        >
          取消处理
        </Button>
        <Button onClick={() => setClicks((n) => n + 1)}>
          测试主线程交互：{clicks}
        </Button>
      </Space>
      <Progress percent={progress} />
      <Typography.Paragraph role="status">{status}</Typography.Paragraph>
      <Alert
        type="info"
        showIcon
        title="观察要点"
        description="处理期间可以点击交互按钮。扫描进度不包含排序；同步排序期间 Worker 无法接收取消消息。10 万条简单计算可能很快完成，分块等待也会增加总耗时。"
      />
      <Typography.Paragraph style={{ marginTop: 16 }}>
        全量数据保存在主线程内存中，虚拟列表只减少 DOM 数量，不能消除消息复制和内存开销。
        下方展示全部符合筛选条件的订单，并非原始 10 万条订单。
      </Typography.Paragraph>
      <Card title={`全部筛选结果（${orders.length} 条，金额降序）`} style={{ marginTop: 16 }}>
        <Table
          // Ant Design 虚拟表格：固定视口，只挂载可视行及缓冲行。
          // 新任务开始时重建表格，将滚动位置重置到顶部。
          key={orders.length ? "results" : "empty"}
          virtual
          scroll={{ x: 500, y: 400 }}
          rowKey="id"
          dataSource={orders}
          pagination={false}
          size="small"
          columns={[
            { title: "订单 ID", dataIndex: "id" },
            { title: "金额（演示单位）", dataIndex: "amount" },
          ]}
        />
      </Card>
    </div>
  );
}
