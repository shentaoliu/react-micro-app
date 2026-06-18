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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
