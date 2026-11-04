import { useState, useRef, useMemo, useCallback } from "react";
import { Alert, Card, Divider, Typography } from "antd";

type ListItem = {
  id: number;
  content: string;
};

type VirtualListProps = {
  data: ListItem[];
  itemHeight?: number;
};

export default function VariableHeightVirtualListDemo() {
  const mockData = useMemo(() => {
    return Array.from({ length: 100000 }, (_, i) => {
      // 演示数据按原示例随机生成，不用于持久化或服务端渲染。
      // eslint-disable-next-line react-hooks/purity
      const randomRepeat = Math.floor(Math.random() * 20) + 1;
      return {
        id: i,
        content:
          `第 ${i + 1} 条数据：` +
          "欢迎学习不定高虚拟列表 🚀。".repeat(randomRepeat),
      };
    });
  }, []);

  return (
    <Card title="不定高虚拟列表原理演示" variant="borderless">
      <Typography.Paragraph>
        当列表内容长度不同、文字会自动换行时，每条数据的高度就不再固定。
        这个示例包含 10 万条数据，仅渲染可视区域及上下缓冲区中的内容。
      </Typography.Paragraph>
      <Alert
        type="info"
        showIcon
        title="不定高列表如何定位？"
        description={
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>未渲染的行先按 50px 预估高度，撑开列表滚动空间。</li>
            <li>根据累计高度和滚动位置，计算需要渲染的数据范围。</li>
            <li>行挂载后通过 offsetHeight 测量真实高度，并更新高度缓存。</li>
            <li>累加起始行之前的高度，用 translateY 将内容移动到对应位置。</li>
          </ol>
        }
      />
      <Divider>交互演示</Divider>
      <VirtualList data={mockData} />
      <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
        提示：可拖动滚动条观察渲染范围变化。此示例采用遍历方式计算位置，便于理解；
        未测量部分使用预估高度，因此首次浏览时滚动条长度可能调整，内容也可能出现位置跳动。
      </Typography.Paragraph>
    </Card>
  );
}

function VirtualList({ data, itemHeight = 50 }: VirtualListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 500;
  const buffer = 3;

  // 已渲染的行保存实测高度，未渲染的行先使用 itemHeight 估算。
  const [itemHeights, setItemHeights] = useState<Record<number, number>>({});
  const updateHeight = useCallback((index: number, height: number) => {
    setItemHeights((prev) => {
      if (prev[index] === height) return prev;
      return { ...prev, [index]: height };
    });
  }, []);

  const [startIndex, endIndex, totalHeight] = useMemo(() => {
    let total = 0;
    let start = 0;
    let end = data.length;

    // 从头累计高度，找到滚动位置所在的行，再向上扩展缓冲区。
    for (let i = 0; i < data.length; i++) {
      const h = itemHeights[i] || itemHeight;
      if (total + h >= scrollTop) {
        start = Math.max(0, i - buffer);
        break;
      }
      total += h;
    }

    // 从起点累计一个视口的高度，再向下增加缓冲行。
    let visibleHeight = 0;
    for (let i = start; i < data.length; i++) {
      visibleHeight += itemHeights[i] || itemHeight;
      if (visibleHeight >= containerHeight) {
        end = Math.min(data.length, i + buffer * 2);
        break;
      }
    }

    // 所有行的实测或预估高度之和，用来撑开完整滚动空间。
    const allHeight = data.reduce((acc, _, index) => {
      return acc + (itemHeights[index] || itemHeight);
    }, 0);

    return [start, end, allHeight];
  }, [scrollTop, itemHeights, data, itemHeight]);

  // 起点之前所有行的高度之和，即当前渲染切片的顶部偏移量。
  const offsetTop = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < startIndex; i++) {
      offset += itemHeights[i] || itemHeight;
    }
    return offset;
  }, [itemHeights, startIndex, itemHeight]);

  return (
    <>
    <Typography.Paragraph type="secondary">
      总数据量：{data.length.toLocaleString()} 条 · 当前渲染：{endIndex - startIndex} 条
      · 渲染范围：第 {startIndex + 1}～{endIndex} 条 · 上下缓冲：各 {buffer} 条
    </Typography.Paragraph>
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflowY: "auto", background: "#f9fafb", border: "1px solid #d9d9d9", borderRadius: 8 }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      {/* 占位层保留全部数据的滚动高度。 */}
      <div style={{ position: "relative", height: totalHeight }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            transform: `translateY(${offsetTop}px)`,
          }}
        >
          {data.slice(startIndex, endIndex).map((item, i) => (
            <div
              key={item.id}
              ref={(ref) => {
                // DOM 挂载后读取真实高度，用原始数据索引缓存。
                if (ref) {
                  const h = ref.offsetHeight;
                  if (h && itemHeights[startIndex + i] !== h) {
                    updateHeight(startIndex + i, h);
                  }
                }
              }}
              style={{
                borderBottom: "1px solid #e5e7eb",
                padding: 16,
                textAlign: "left",
                background: item.id % 2 === 0 ? "#fafafa" : "white",
                overflowWrap: "anywhere",
              }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
