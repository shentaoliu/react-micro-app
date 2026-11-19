import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Spin } from "antd";

// 与主应用路由 /apps/sub-a 对齐：子应用据此设置 BrowserRouter 的 basename。
// 保持默认 search 路由模式，子应用路由写入 URL query，主应用 pathname 维持 /apps/sub-a。
const APP_NAME = "sub-a";
const APP_URL = "http://localhost:3000/";
const BASE_ROUTE = "/apps/sub-a";

type LoadPhase = "loading" | "ready" | "error";

// 覆盖层：micro-app-container 已是 position:relative，覆盖层绝对定位其中。
const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "var(--bg)",
};

const SubAppA: React.FC = () => {
  const [phase, setPhase] = useState<LoadPhase>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDismissed, setErrorDismissed] = useState(false);
  // 通过改变 key 重建元素来实现“重新加载”；初始为 0。
  const [retryKey, setRetryKey] = useState(0);
  const appRef = useRef<HTMLElement | null>(null);

  // micro-app 的 mounted / error 生命周期事件派发在 <micro-app> 元素自身且不冒泡，
  // 因此直接在该元素上监听；重建或卸载时移除本实例注册的监听，避免重复监听。
  useEffect(() => {
    const el = appRef.current;
    if (!el) return;

    const handleMounted = () => {
      setPhase("ready");
    };
    const handleError = (event: Event) => {
      const error = (event as CustomEvent<{ error?: unknown }>).detail?.error;
      setErrorMessage(
        error instanceof Error ? error.message : String(error ?? "子应用资源加载失败"),
      );
      setErrorDismissed(false);
      setPhase("error");
    };

    el.addEventListener("mounted", handleMounted);
    el.addEventListener("error", handleError);
    return () => {
      el.removeEventListener("mounted", handleMounted);
      el.removeEventListener("error", handleError);
    };
  }, [retryKey]);

  // 重试：重建 <micro-app> 元素以重新请求子应用资源。
  // 错误态下 micro-app 卸载时会强制销毁实例缓存（源码 unmount: destroy || state === LOAD_FAILED），
  // 重建走 handleCreateApp 重新加载；仅影响本子应用，不刷新主应用。
  const handleRetry = useCallback(() => {
    setErrorMessage("");
    setErrorDismissed(false);
    setPhase("loading");
    setRetryKey((key) => key + 1);
  }, []);

  return (
    <div className="app-content">
      <div className="micro-app-container">
        <micro-app
          key={retryKey}
          ref={appRef}
          name={APP_NAME}
          url={APP_URL}
          baseroute={BASE_ROUTE}
        ></micro-app>

        {phase === "loading" && (
          <div style={overlayStyle}>
            <Spin size="large" />
            <span style={{ marginTop: 12 }}>子应用加载中…</span>
          </div>
        )}

        {phase === "error" && !errorDismissed && (
          <div style={overlayStyle}>
            <Alert
              type="error"
              showIcon
              title="子应用加载失败"
              description={errorMessage || `请确认子应用服务已启动：${APP_URL}`}
              action={
                <Button type="primary" onClick={handleRetry}>
                  重试
                </Button>
              }
              closable={{ onClose: () => setErrorDismissed(true) }}
              style={{ maxWidth: 440, margin: 16 }}
            />
          </div>
        )}

        {phase === "error" && errorDismissed && (
          <div style={overlayStyle}>
            <Button onClick={handleRetry}>重新加载子应用</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubAppA;
