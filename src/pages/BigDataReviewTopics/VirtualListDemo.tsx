import React, { useState, useRef, useMemo } from "react";
import type { UIEvent } from "react";
import { Card, Typography, Divider, Alert, Space, Button } from "antd";

const { Title, Paragraph, Text } = Typography;

// 模拟海量数据
const TOTAL_COUNT = 100000;
const ITEM_HEIGHT = 50; // 固定每项高度
const CONTAINER_HEIGHT = 400; // 容器可视区域高度

const VirtualListDemo: React.FC = () => {
  // 生成 10 万条测试数据
  const listData = useMemo(() => {
    return Array.from({ length: TOTAL_COUNT }, (_, index) => ({
      id: index,
      content: `我是虚拟列表的第 ${index + 1} 条数据`,
    }));
  }, []);

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 计算列表总高度 (用于撑开滚动条)
  const totalHeight = listData.length * ITEM_HEIGHT;

  // 2. 计算可视区域能渲染的元素个数 (向上取整) + 预渲染数量
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);
  const bufferCount = 5; // 缓冲条数，防止快速滚动时出现白屏

  // 3. 计算起始索引和结束索引
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ITEM_HEIGHT) - bufferCount,
  );
  const endIndex = Math.min(
    listData.length,
    startIndex + visibleCount + bufferCount * 2,
  );

  // 4. 截取需要实际渲染的数据
  const visibleData = listData.slice(startIndex, endIndex);

  // 5. 计算当前渲染列表的偏移量 (使其在可视区域内)
  const offsetY = startIndex * ITEM_HEIGHT;

  // 监听滚动事件
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    // 使用 requestAnimationFrame 节流，保证滚动丝滑
    window.requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  };

  return (
    <Card title="虚拟列表 (Virtual List) 原理演示" bordered={false}>
      <Paragraph>
        <strong>面试官提问：</strong>即使使用了时间分片，如果 DOM 节点达到了 10
        万个，页面仍然会因为内存占用过大和重绘重排代价过高而卡顿，如何彻底解决？
      </Paragraph>
      <Paragraph>
        <strong>满分回答：</strong>使用<strong>虚拟列表 (Virtual List)</strong>
        。其核心思想是：无论数据有多少条，我们
        <strong>只渲染用户可视区域内的 DOM 节点</strong>
        。当用户滚动时，动态计算出需要显示的起始和结束索引，替换容器内渲染的 DOM
        节点，并用绝对定位或 <code>transform</code> 调整它们在可视区域内的位置。
      </Paragraph>

      <Alert
        message="虚拟列表核心要素"
        description={
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li>
              一个有确定高度且 <code>overflow-y: auto</code> 的可视区域容器。
            </li>
            <li>
              一个用来撑开总高度的虚拟占位容器（<code>数据总数 × 单项高度</code>
              ）。
            </li>
            <li>
              一个绝对定位的真实渲染区，根据当前 <code>scrollTop</code>{" "}
              动态截取数据并设置 <code>transformY</code>。
            </li>
          </ul>
        }
        type="success"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Divider>交互演示（当前渲染 10 万条数据）</Divider>

      <Space style={{ marginBottom: "16px" }}>
        <Text type="secondary">
          当前仅在 DOM 中渲染 <strong>{visibleData.length}</strong> 个节点
          (起始索引: {startIndex}, 结束索引: {endIndex})
        </Text>
      </Space>

      {/* 外层容器：固定高度，设置滚动条 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: `${CONTAINER_HEIGHT}px`,
          overflowY: "auto",
          border: "1px solid #d9d9d9",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        {/* 占位元素：用来撑开滚动条总高度 */}
        <div style={{ height: `${totalHeight}px` }} />

        {/* 实际渲染列表区域：绝对定位，根据 scrollTop 动态计算偏移量 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            transform: `translate3d(0, ${offsetY}px, 0)`, // 使用 translate3d 开启 GPU 加速
          }}
        >
          {visibleData.map((item) => (
            <div
              key={item.id}
              style={{
                height: `${ITEM_HEIGHT}px`,
                lineHeight: `${ITEM_HEIGHT}px`,
                padding: "0 16px",
                borderBottom: "1px solid #f0f0f0",
                background: item.id % 2 === 0 ? "#fafafa" : "#fff",
                boxSizing: "border-box",
              }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default VirtualListDemo;
