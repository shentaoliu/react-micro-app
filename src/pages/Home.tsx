import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Alert,
  Row,
  Col,
  Statistic,
  Space,
  Spin,
  Button,
} from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

// 模拟的图表组件 (使用原生 div 和 CSS 模拟简单的柱状图，避免引入重量级依赖影响演示)
const SimpleBarChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        height: 200,
        gap: 16,
        padding: "16px 0",
      }}
    >
      {data.map((val, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            height: "100%",
          }}
        >
          <span style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
            {val}
          </span>
          <div
            style={{
              width: "100%",
              height: `${(val / max) * 100}%`,
              background: "linear-gradient(180deg, #1890ff 0%, #bae0ff 100%)",
              borderRadius: "4px 4px 0 0",
              transition: "height 0.5s ease-out",
            }}
          />
        </div>
      ))}
    </div>
  );
};

function Home() {
  // 模拟从服务端获取的数据
  const [ssrData, setSsrData] = useState<{
    users: number;
    sales: number;
    chartData: number[];
  } | null>(null);

  // 模拟当前环境是否在“服务端”渲染阶段
  const [isServer, setIsServer] = useState(true);

  // 模拟 SSR 过程：假设我们在真实 SSR 环境中，数据是在服务端就准备好的
  // 但因为这是个纯前端 React 项目，我们用一段同步逻辑 + 立即改变的状态来"假装" SSR 过程

  // 初始化一个假数据（代表服务端注水的数据）
  const initialData = {
    users: 1024,
    sales: 99800,
    chartData: [120, 200, 150, 80, 70, 110, 130],
  };

  useEffect(() => {
    // 组件挂载后，意味着进入了客户端阶段 (CSR / Hydration 完成)
    setIsServer(false);

    // 模拟客户端挂载后发起请求，获取最新数据（替换掉 SSR 的老数据）
    const timer = setTimeout(() => {
      setSsrData({
        users: 1056,
        sales: 102300,
        chartData: [150, 220, 180, 100, 90, 140, 180],
      });
    }, 2000); // 2秒后数据更新，模拟网络延迟

    return () => clearTimeout(timer);
  }, []);

  // 决定当前渲染使用的数据：如果有 CSR 获取的新数据就用新的，否则用 SSR 注水的初始数据
  const displayData = ssrData || initialData;

  return (
    <div style={{ padding: "24px" }}>
      <Typography>
        <Title level={2}>首页看板 (SSR 渲染体验模拟)</Title>
        <Paragraph>
          这里模拟了 <strong>Server-Side Rendering (SSR)</strong> +{" "}
          <strong>客户端 Hydration</strong> 的典型场景体验。
        </Paragraph>
      </Typography>

      <Alert
        message="如何在这个项目中用 Node.js 真正模拟 SSR？"
        description={
          <>
            <p>
              <strong>
                当前的 Vite + React 项目默认是纯 CSR (客户端渲染) 的。
              </strong>{" "}
              如果你想用 Node.js 真正跑起来
              SSR，你需要对项目架构进行大改，或者单独写一个极简的 Node
              脚本来体验。以下是核心步骤（面试常考的 SSR 原理）：
            </p>
            <ol>
              <li>
                <strong>服务端 (Node.js/Express)：</strong> 引入{" "}
                <code>react-dom/server</code> 中的 <code>renderToString</code>
                （或 React 18 的 <code>renderToPipeableStream</code>）。
              </li>
              <li>
                <strong>渲染 HTML：</strong> 在 Express 路由里，将{" "}
                <code>&lt;App /&gt;</code> 组件作为参数传给{" "}
                <code>renderToString(&lt;App /&gt;)</code>，它会返回一段长长的
                HTML 字符串。
              </li>
              <li>
                <strong>数据注水 (Dehydrate)：</strong>{" "}
                如果组件需要请求数据，必须在 Node 侧先发请求拿数据，把数据作为{" "}
                <code>props</code> 传给组件，同时把这份数据挂载到全局变量（如{" "}
                <code>window.__INITIAL_DATA__</code>）上，拼接到最终的 HTML
                里发给浏览器。
              </li>
              <li>
                <strong>客户端脱水 (Hydrate)：</strong> 浏览器拿到 HTML
                后立刻显示。然后下载客户端的 React JS 代码。客户端代码不能用{" "}
                <code>createRoot</code>，而是要用{" "}
                <code>
                  hydrateRoot(document.getElementById('root'), &lt;App /&gt;)
                </code>
                。React 会读取 <code>window.__INITIAL_DATA__</code>
                ，并只做事件绑定，不重新生成 DOM。
              </li>
            </ol>
            <p>
              <strong>注意：</strong> 自己从零搭建 SSR
              非常痛苦（要处理路由同步、Redux 状态同步、CSS
              样式抽取等），所以真实生产环境中，大家都会直接使用{" "}
              <strong>Next.js</strong> 或 <strong>Remix</strong>{" "}
              这样的成熟框架。
            </p>
          </>
        }
        type="info"
        style={{ marginBottom: 24 }}
      />

      <Alert
        message={
          isServer
            ? "当前状态：模拟服务端直出 HTML (页面已可见)"
            : ssrData
              ? "当前状态：客户端接管完毕，数据已通过 CSR 更新"
              : "当前状态：客户端正在 Hydration 并请求最新数据..."
        }
        description={
          <>
            <p>
              <strong>体验要点：</strong>
            </p>
            <ol>
              <li>
                页面一刷新，图表和数字是<strong>立刻可见</strong>
                的（这代表服务端直出的 <code>initialData</code>，没有白屏
                Loading）。
              </li>
              <li>
                2 秒后，图表柱子长高了，数字变大了（这代表客户端{" "}
                <code>useEffect</code> 请求到了最新数据，发生了重新渲染）。
              </li>
              <li>
                在真实的 SSR（如 Next.js）中，首屏能被 SEO
                爬虫直接抓取，且用户不需要等待 JS 下载完就能看到满屏内容。
              </li>
            </ol>
          </>
        }
        type={isServer ? "warning" : ssrData ? "success" : "info"}
        showIcon
        style={{ marginBottom: 24 }}
        action={
          <Button
            size="small"
            type="primary"
            onClick={() => window.location.reload()}
          >
            刷新重体验
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card>
            <Statistic
              title="今日活跃用户 (服务端直出 -> 客户端更新)"
              value={displayData.users}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ArrowUpOutlined />}
              suffix="人"
            />
            {ssrData ? (
              <Text type="success" style={{ fontSize: 12 }}>
                数据已是最新 (CSR)
              </Text>
            ) : (
              <Space>
                <Spin size="small" />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  正在获取实时数据...
                </Text>
              </Space>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="本月销售额"
              value={displayData.sales}
              precision={2}
              valueStyle={{ color: "#cf1322" }}
              prefix={<ArrowDownOutlined />}
              suffix="¥"
            />
            {ssrData ? (
              <Text type="success" style={{ fontSize: 12 }}>
                数据已是最新 (CSR)
              </Text>
            ) : (
              <Space>
                <Spin size="small" />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  正在获取实时数据...
                </Text>
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="流量趋势图" style={{ marginTop: 16 }}>
        <SimpleBarChart data={displayData.chartData} />
      </Card>
    </div>
  );
}

export default Home;
