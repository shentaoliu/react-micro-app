/**
 * Web Worker 专用线程文件
 * 面试考点：
 * 1. 复杂计算（如海量数据生成、排序）脱离主线程，避免页面卡顿（白屏）
 * 2. 任务分片（Batching）与事件循环（Event Loop）让出执行权
 * 3. 竞态控制与任务取消机制
 */

// 记录当前正在执行的任务 ID，用于实现“竞态控制”和“任务取消”
// 数据直接在 Worker 中生成，避免主线程复制 10 万个对象带来的通信序列化开销。
let activeTask = 0;

// 监听主线程发送过来的消息
self.onmessage = async ({
  data,
}: MessageEvent<{ type: "start" | "cancel" }>) => {
  // 每次收到新消息（如 start），任务 ID 累加
  const task = ++activeTask;

  // 如果主线程要求取消任务
  if (data.type === "cancel") {
    self.postMessage({ type: "cancelled" });
    return; // 直接终止当前操作
  }

  // 记录开始时间，用于性能耗时统计
  const started = performance.now();
  const result: { id: number; amount: number }[] = [];
  const total = 100_000; // 模拟生成 10 万条数据
  const batchSize = 2000; // 每次（每批次）处理 2000 条

  // 将 10 万次循环分批次处理（任务分片）
  for (let offset = 0; offset < total; offset += batchSize) {
    // 【竞态控制核心】：如果在分批执行的间隙，activeTask 被更新了（比如主线程又发了 start 或 cancel）
    // 则当前任务直接废弃，停止执行
    if (task !== activeTask) return;

    // 处理当前批次的数据
    for (let i = offset; i < Math.min(offset + batchSize, total); i++) {
      const price = (i % 500) + 1;
      const quantity = (i % 10) + 1;
      const amount = price * quantity;
      // 模拟复杂过滤逻辑：只要金额大于等于 1000 的数据
      if (amount >= 1000) result.push({ id: i + 1, amount });
    }

    // 每一批次处理完，向主线程发送进度报告，便于主线程更新进度条 UI
    self.postMessage({
      type: "progress",
      progress: Math.round(((offset + batchSize) / total) * 100),
    });

    // 【面试核心】：让出执行权，以接收取消消息。
    // 为什么用 setTimeout(0) 而不是 Promise.resolve()？
    // 答：setTimeout 是宏任务（Macro-task），它会让当前调用栈清空，使得 Worker 的事件循环有机会去
    // 处理消息队列中的其他事件（比如主线程刚刚发过来的 cancel 消息）。
    // 如果用 Promise.resolve() 它是微任务（Micro-task），微任务队列会在当前宏任务结束前全部执行完，
    // 依然会阻塞事件循环，导致无法及时响应 cancel 消息。
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  // 所有批次执行完毕后，再次检查是否被取消或覆盖
  if (task !== activeTask) return;

  // 【为了演示效果人为增加的延迟】
  // 因为 V8 引擎对于几万条数据的 sort 排序非常快（通常不到 20ms）
  // 这会导致主线程瞬间收到 done 消息，从而覆盖掉 progress===100 时的“正在排序…”状态
  // 这里故意停顿 800ms，让你能在页面上清晰地看到“正在排序…”这几个字
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 同步排序期间不能响应取消，但因为是在 Worker 线程中，
  // 所以就算耗时再长，也【不会阻塞页面主线程】，用户的 UI 依然可以交互。
  result.sort((a, b) => b.amount - a.amount);

  // 处理完成，把最终结果发送给主线程
  self.postMessage({
    type: "done",
    count: result.length,
    result, // 全量返回筛选、排序后的订单，由主线程使用虚拟列表展示
    elapsed: Math.round(performance.now() - started),
  });
};

export {};
