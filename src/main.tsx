import { SkinProvider } from "./theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import microApp from "@micro-zoe/micro-app";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "./store";
import { router } from "./router";
import "./index.css";

// 初始化 micro-app
microApp.start();

// 主题 Provider 包住所有路由，使每个页面共享配置与 Ant Design 主题。
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SkinProvider><Provider store={store}>
      <RouterProvider router={router} />
    </Provider></SkinProvider>
  </StrictMode>,
);
