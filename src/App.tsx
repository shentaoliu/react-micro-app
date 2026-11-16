import { useSkin } from "./theme";
import React, { useState, useMemo } from "react";
import { Layout, Menu, theme, Select, ColorPicker, Space, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DesktopOutlined,
  PieChartOutlined,
  UserOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ToolOutlined,
  TeamOutlined,
  SafetyOutlined,
  HomeOutlined,
  FormOutlined,
  ApiOutlined,
  BookOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import reactLogo from "./assets/react.svg";
import "./App.less";

const { Header, Content, Sider } = Layout;

// 一级导航菜单枚举 key (与路由第一层 path 对应)
const TOP_MENU_KEYS = {
  WORKSPACE: "workspace",
  APPS: "apps",
  SETTINGS: "settings",
};

// 一级导航菜单
const topMenuItems: MenuProps["items"] = [
  { key: TOP_MENU_KEYS.WORKSPACE, label: "工作台" },
  { key: TOP_MENU_KEYS.APPS, label: "应用管理" },
  { key: TOP_MENU_KEYS.SETTINGS, label: "系统设置" },
];

// 辅助函数用于生成二级导航菜单项
type MenuItem = Required<MenuProps>["items"][number];
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

// 定义不同一级导航对应的二级菜单数据映射
// key 对应路由中的最后一段 path
const sideMenuMap: Record<string, MenuItem[]> = {
  [TOP_MENU_KEYS.WORKSPACE]: [
    getItem("首页", "home", <HomeOutlined />),
    getItem("总览看板", "overview", <PieChartOutlined />),
    getItem("跨域请求示例", "todo", <AppstoreOutlined />),
    getItem("快捷工具", "tools", <ToolOutlined />),
    getItem("样式测试", "style-test", <ToolOutlined />),
    getItem("React测试", "react-test", <AppstoreOutlined />),
    getItem("React19表单测试", "react-19-form", <FormOutlined />),
    getItem("自定义Hook", "custom-hooks", <ApiOutlined />),
    getItem("React复习示例", "react-review", <BookOutlined />),
    getItem("大数据渲染", "big-data", <DatabaseOutlined />),
    getItem("响应式渲染系统", "reactive-rendering", <ApiOutlined />),
  ],
  [TOP_MENU_KEYS.APPS]: [
    getItem("微前端子应用", "apps-micro", <DesktopOutlined />, [
      getItem("子应用 A", "sub-a"),
      getItem("子应用 B", "sub-b"),
    ]),
    getItem("应用配置", "config", <SettingOutlined />),
  ],
  [TOP_MENU_KEYS.SETTINGS]: [
    getItem("用户管理", "settings-users", <TeamOutlined />, [
      getItem("用户列表", "user-list"),
      getItem("角色管理", "roles"),
    ]),
    getItem("权限配置", "auth", <SafetyOutlined />),
    getItem("系统日志", "logs", <UserOutlined />),
  ],
};

const App: React.FC = () => {
  // 这里只更新配置；持久化、广播以及组件样式更新由 SkinProvider 统一处理。
  const { skin, setSkin } = useSkin();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 从当前路由 URL 中解析出选中的顶级菜单和侧边栏菜单
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const activeTopMenu = pathSnippets[0] || TOP_MENU_KEYS.WORKSPACE;
  const activeSideMenu = pathSnippets[pathSnippets.length - 1] || "home";

  // 根据当前一级导航选中状态，动态计算左侧菜单
  const currentSideMenuItems = useMemo(() => {
    return sideMenuMap[activeTopMenu] || [];
  }, [activeTopMenu]);

  // 处理顶部菜单切换
  const handleTopMenuClick = (key: string) => {
    const firstMenu = sideMenuMap[key]?.[0];
    if (firstMenu) {
      const firstKey = (firstMenu as any).children
        ? (firstMenu as any).children[0].key
        : firstMenu.key;
      // 导航到 /top-key/side-key
      navigate(`/${key}/${firstKey}`);
    } else {
      navigate(`/${key}`);
    }
  };

  // 处理左侧菜单切换
  const handleSideMenuClick = (key: string) => {
    navigate(`/${activeTopMenu}/${key}`);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 顶部一级导航 */}
      <Header
        style={{ display: "flex", alignItems: "center", padding: "0 24px" }}
      >
        <div className="demo-logo">
          <img src={reactLogo} alt="Logo" style={{ height: "32px" }} />
          <span
            style={{
              color: "var(--text-h)",
              marginLeft: "12px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Micro Platform
          </span>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeTopMenu]}
          onClick={(e) => handleTopMenuClick(e.key)}
          items={topMenuItems}
          style={{ flex: 1, minWidth: 0, marginLeft: "40px" }}
        />
        {/* 修改一个配置字段时保留另一个字段；颜色统一转成六位 hex，与消息校验规则一致。 */}
        <Space>
          <Select aria-label="主题模式" value={skin.mode} style={{ width: 100 }}
            options={[{ value: "light", label: "浅色" }, { value: "dark", label: "深色" }]}
            onChange={(mode) => setSkin({ ...skin, mode })} />
          <ColorPicker aria-label="主题色" value={skin.color} disabledAlpha
            onChange={color => setSkin({ ...skin, color: color.toHexString() })} />
          <Button onClick={() => setSkin({ mode: "light", color: "#1677ff" })}>重置皮肤</Button>
        </Space>
      </Header>

      <Layout>
        {/* 左侧二级导航 */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          width={220}
          style={{ background: colorBgContainer }}
        >
          <Menu
            mode="inline"
            selectedKeys={[activeSideMenu]}
            onClick={(e) => handleSideMenuClick(e.key)}
            defaultOpenKeys={["apps-micro", "settings-users"]}
            style={{ height: "100%", borderRight: 0 }}
            items={currentSideMenuItems}
          />
        </Sider>

        {/* 右侧主内容区 */}
        <Layout style={{ padding: "24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflow: "auto",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
