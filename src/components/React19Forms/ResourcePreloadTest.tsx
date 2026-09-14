import React, { useState } from "react";
// ⚠️ 面试考点：预加载 API 是从 react-dom 中引入的，而不是 react！
import { preconnect, prefetchDNS, preload } from "react-dom";
import { Card, Typography, Button, Space, Alert } from "antd";

const { Paragraph, Text } = Typography;

// --- 预加载触发组件 ---
const ResourcePreloader = () => {
  // 1. preload (预加载具体资源)
  // 我们预加载一张 React 官方的大图
  preload("https://react.dev/images/uwu.png", { as: "image" });

  // 2. prefetchDNS (预解析 DNS)
  // 提前把域名解析成 IP，省去后续 DNS 查询的几十毫秒。
  prefetchDNS("https://api.github.com");

  // 3. preconnect (预连接)
  // 比 prefetchDNS 更进一步，不仅解析 DNS，还提前完成 TCP 握手和 TLS 协商。
  // 注意：preconnect 很耗资源，浏览器通常只允许维持几个，不要滥用。
  preconnect("https://api.github.com");

  return (
    <div
      style={{
        padding: "16px",
        background: "#e6f4ff",
        borderRadius: "8px",
        border: "1px solid #91caff",
      }}
    >
      <Text strong type="success">
        ✅ 资源预加载指令已发送！
      </Text>
      <ul
        style={{ margin: "8px 0 0 0", paddingLeft: "20px", fontSize: "14px" }}
      >
        <li>已预加载 (preload)：uwu.png 大图</li>
        <li>
          已预连接 (preconnect) / 预解析 (prefetchDNS)：https://api.github.com
        </li>
      </ul>
      <Text
        type="secondary"
        style={{ fontSize: "12px", display: "block", marginTop: "8px" }}
      >
        (您可以按 F12 打开 Network 面板查看图片下载。稍后我们会向 Github API
        发起请求，体会预连接带来的速度提升。)
      </Text>
    </div>
  );
};

// --- 真实渲染资源与请求数据的组件 ---
const HeavyResourceRenderer = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchGithubData = async () => {
    setLoading(true);
    try {
      // 这个请求的域名 (api.github.com) 刚刚已经被 preconnect 过了！
      // 所以此时浏览器不需要再去查 DNS、不需要再去经历 3 次握手，而是直接发送 HTTP 请求！
      const res = await fetch("https://api.github.com/repos/facebook/react");
      const data = await res.json();
      setApiData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "16px",
        display: "flex",
        gap: "24px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: "200px" }}>
        <Text strong>1. 预加载图片展示</Text>
        <Paragraph type="secondary">
          这张图片因为被 preload 过，所以瞬间就渲染出来了：
        </Paragraph>
        <img
          src="https://react.dev/images/uwu.png"
          alt="React uwu"
          style={{
            width: "100%",
            maxWidth: "200px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: "200px" }}>
        <Text strong>2. 预连接 API 测试</Text>
        <Paragraph type="secondary">
          由于刚才已经对 api.github.com 进行了 preconnect，下面的请求会省去 DNS
          和 TCP 握手的时间，速度极快！
        </Paragraph>
        <Button type="primary" onClick={fetchGithubData} loading={loading}>
          获取 React 仓库信息
        </Button>
        {apiData && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px",
              background: "#f0f0f0",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            🌟 <strong>{apiData.full_name}</strong>
            <br />⭐ Stars: {apiData.stargazers_count}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 主页面组件 ---
const ResourcePreloadTest: React.FC = () => {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  return (
    <Card
      title="10. 资源预加载 API (Resource Preloading)"
      style={{ marginBottom: "24px", borderColor: "#13c2c2" }}
    >
      <Paragraph>
        <strong>面试考点：</strong> 在 React 19
        之前，如果我们想做首屏优化（比如预加载字体、图片或脚本），只能在{" "}
        <code>index.html</code> 的 <code>&lt;head&gt;</code> 里手动写{" "}
        <code>&lt;link rel="preload"&gt;</code>
        ，或者自己写各种复杂的懒加载逻辑。
      </Paragraph>
      <Paragraph>
        <strong>新特性：</strong> React 19 从 <code>react-dom</code>{" "}
        导出了原生的 <code>preconnect</code>, <code>prefetchDNS</code>,{" "}
        <code>preload</code> 等 API。你可以在组件的
        <strong>任何地方（包括事件回调中）</strong>调用它们，React
        会在底层智能地处理重复调用，并将指令通知给浏览器，极大提升了首屏和路由切换的性能！
      </Paragraph>

      <Alert
        message="互动演示：体验预加载的魔法"
        description="请打开浏览器的 Network (网络) 面板，选择 Img (图片) 过滤器。然后依次点击下面的按钮。"
        type="info"
        showIcon
        style={{ marginBottom: "16px" }}
      />

      <Space direction="vertical" style={{ width: "100%" }}>
        <Space>
          <Button
            type={step === 0 ? "primary" : "default"}
            onClick={() => setStep(1)}
            disabled={step > 0}
          >
            第一步：触发预加载 (Preload)
          </Button>

          <Button
            type={step === 1 ? "primary" : "default"}
            onClick={() => setStep(2)}
            disabled={step !== 1}
          >
            第二步：渲染大图 (瞬间出现)
          </Button>

          <Button danger onClick={() => setStep(0)} disabled={step === 0}>
            重置
          </Button>
        </Space>

        {/* 步骤 1：触发预加载 */}
        {step >= 1 && <ResourcePreloader />}

        {/* 步骤 2：真实渲染 */}
        {step === 2 && <HeavyResourceRenderer />}
      </Space>
    </Card>
  );
};

export default ResourcePreloadTest;
