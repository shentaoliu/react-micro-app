import React, { useEffect, useState, useRef } from "react";
import { Card, Typography, Divider, Button, Alert, Space } from "antd";

const { Title, Paragraph, Text } = Typography;

const TimeSlicingDemo: React.FC = () => {
  const [renderCount, setRenderCount] = useState(0);
  const containerRef = useRef<HTMLUListElement>(null);

  // 面试考点：时间分片 (Time Slicing) 的核心实现
  const renderList = () => {
    // 每次渲染前，清空旧数据
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const total = 100000; // 我们将数据量提升到 10000 条，效果更明显
    const once = 20; // 每一帧渲染的条数
    let ul = containerRef.current;

    if (!ul) return;

    function loop(curTotal: number) {
      if (curTotal <= 0) return;

      // 计算本帧需要渲染的数量
      let pageCount = Math.min(curTotal, once);
      console.log(`当前帧渲染 ${pageCount} 条`);

      // 面试核心：使用 requestAnimationFrame 代替 setTimeout
      window.requestAnimationFrame(() => {
        // 面试核心：使用 DocumentFragment 减少 DOM 回流次数
        let fragment = document.createDocumentFragment();

        for (let i = 0; i < pageCount; i++) {
          let li = document.createElement("li");
          li.style.padding = "8px 16px";
          li.style.borderBottom = "1px solid #f0f0f0";
          li.style.background = i % 2 === 0 ? "#fafafa" : "#fff";
          li.innerHTML = `我是数据节点 ID: ${~~(Math.random() * total)} (剩余 ${curTotal - pageCount} 条)`;
          fragment.appendChild(li); // 先挂载到虚拟碎片上
        }

        // 这一帧的节点全部准备好后，一次性插入到真实 DOM 中，只会触发一次回流
        ul!.appendChild(fragment);

        // 递归调用，在下一帧渲染剩下的数据
        loop(curTotal - pageCount);
      });
    }

    loop(total);
    setRenderCount((prev) => prev + 1);
  };

  return (
    <Card title="时间分片 (Time Slicing) 原理演示" bordered={false}>
      <Paragraph>
        <strong>面试官提问：</strong>如果后端一次性返回了 10
        万条数据，要求你全部渲染在页面上，且页面不能卡顿（白屏死机），你会怎么做？
      </Paragraph>
      <Paragraph>
        <strong>满分回答：</strong>使用<strong>时间分片</strong>。我们可以利用{" "}
        <code>window.requestAnimationFrame</code>
        ，将庞大的渲染任务拆分成多个小的任务（比如每帧渲染 20 条）。配合{" "}
        <code>document.createDocumentFragment()</code>
        ，我们可以在内存中先组装好这 20 个节点，然后再一次性插入真实
        DOM，从而最大限度地减少回流（Reflow），保证主线程有时间去响应用户的操作，避免页面卡死。
      </Paragraph>

      <Alert
        message="为什么不用 setTimeout？"
        description="setTimeout 和 setInterval 的执行时间不精确，通常实际执行时间都要比其设定的时间晚一些。而 window.requestAnimationFrame 会把每一帧中的所有 DOM 操作集中起来，在一次重绘或回流中就完成。它的触发时间紧紧跟随浏览器的刷新频率（如果是 60Hz，就是严格的 16.7ms 执行一次），视觉效果最丝滑。"
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Divider>交互演示</Divider>

      <Space style={{ marginBottom: "16px" }}>
        <Button type="primary" onClick={renderList}>
          点击渲染 10000 条数据 (不会卡死)
        </Button>
        <Text type="secondary">当前渲染次数：{renderCount}</Text>
      </Space>

      <div
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #d9d9d9",
          borderRadius: "8px",
        }}
      >
        {/* 注意：在真实的 React 开发中，我们很少直接操作 DOM。
            这个例子主要是为了演示底层的时间分片思想。在 React 中实现类似效果，
            通常会使用 concurrent mode 提供的特性，或者手写虚拟列表。 */}
        <ul
          id="container"
          ref={containerRef}
          style={{ margin: 0, padding: 0, listStyle: "none" }}
        >
          <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
            暂无数据，请点击上方按钮加载
          </div>
        </ul>
      </div>
    </Card>
  );
};

export default TimeSlicingDemo;
