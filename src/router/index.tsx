import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import WorkspaceOverview from "../pages/WorkspaceOverview";
import PlaceholderPage from "../pages/PlaceholderPage";
import MyTodo from "../pages/MyTodo";
import ShortcutTools from "../pages/ShortcutTools";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/workspace/overview" replace />,
      },
      // 工作台模块
      {
        path: "workspace",
        children: [
          {
            path: "overview",
            element: <WorkspaceOverview />,
          },
          {
            path: "todo",
            element: <MyTodo />,
          },
          {
            path: "tools",
            element: <ShortcutTools />,
          },
        ],
      },
      // 应用管理模块
      {
        path: "apps",
        children: [
          {
            path: "sub-a",
            element: <PlaceholderPage title="子应用 A" />,
          },
          {
            path: "sub-b",
            element: <PlaceholderPage title="子应用 B" />,
          },
          {
            path: "config",
            element: <PlaceholderPage title="应用配置" />,
          },
        ],
      },
      // 系统设置模块
      {
        path: "settings",
        children: [
          {
            path: "user-list",
            element: <PlaceholderPage title="用户列表" />,
          },
          {
            path: "roles",
            element: <PlaceholderPage title="角色管理" />,
          },
          {
            path: "auth",
            element: <PlaceholderPage title="权限配置" />,
          },
          {
            path: "logs",
            element: <PlaceholderPage title="系统日志" />,
          },
        ],
      },
    ],
  },
]);
