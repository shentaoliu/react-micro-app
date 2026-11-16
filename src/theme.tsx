import microApp from "@micro-zoe/micro-app";
import { ConfigProvider, theme } from "antd";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

// 跨应用只传递可序列化的配置，不传 React Context 或 Ant Design 算法函数。
export type Skin = { mode: "light" | "dark"; color: string };
const defaults: Skin = { mode: "light", color: "#1677ff" };
// 两端采用相同存储键；localStorage 按 origin 隔离，跨端同步仍依赖 micro-app。
const key = "micro-platform-theme";
// 缓存和基座消息都属于外部输入：校验模式与六位十六进制颜色，非法配置不应用。
function parse(value: unknown): Skin | undefined {
  const skin = value as Partial<Skin> | undefined;
  return skin &&
    (skin.mode === "light" || skin.mode === "dark") &&
    typeof skin.color === "string" &&
    /^#[0-9a-f]{6}$/i.test(skin.color)
    ? (skin as Skin)
    : undefined;
}
// 初始化时恢复偏好；缓存损坏或浏览器禁用存储时回退默认值，保证页面可以渲染。
function read(): Skin {
  try {
    return parse(JSON.parse(localStorage.getItem(key) || "null")) || defaults;
  } catch {
    return defaults;
  }
}
// Context 只在当前 React 应用内共享状态；基座与子应用各有自己的 Provider。
const SkinContext = createContext({
  skin: defaults,
  setSkin: (_skin: Skin) => {},
});
// 页面通过此 Hook 读取主题或调用 setSkin，无需自己维护另一份主题状态。
export const useSkin = () => useContext(SkinContext);
export function SkinProvider({ children }: { children: ReactNode }) {
  // 传入函数实现惰性初始化：只在组件首次初始化时读取缓存。
  const [skin, setSkin] = useState<Skin>(read);

  useEffect(() => {
    // 每次主题变化都保存偏好；写入失败不会阻断本次换肤。
    try {
      localStorage.setItem(key, JSON.stringify(skin));
    } catch {
      /* Storage may be disabled. */
    }
    // 全局数据会保留最新值，已挂载及后续挂载的子应用都可订阅 platformTheme。
    microApp.setGlobalData({ platformTheme: skin });
  }, [skin]);
  return (
    <SkinContext.Provider value={{ skin, setSkin }}>
      {/* 算法生成深浅模式的整套颜色；colorPrimary 控制按钮、选中态等品牌色。 */}
      <ConfigProvider
        theme={{
          algorithm:
            skin.mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: { colorPrimary: skin.color },
        }}
      >
        <SkinSurface>{children}</SkinSurface>
      </ConfigProvider>
    </SkinContext.Provider>
  );
}
// 必须放在 ConfigProvider 内部，useToken 才能取得当前主题计算后的 Token。
// 将 Token 映射成 CSS 变量，让普通 div、Less 和动态创建的列表节点一起换肤。
function SkinSurface({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  const { skin } = useSkin();
  return (
    <div
      style={
        {
          minHeight: "100vh",
          color: token.colorText,
          background: token.colorBgLayout,
          "--text-h": token.colorText,
          "--bg": token.colorBgContainer,
          "--border": token.colorBorder,
          "--accent": token.colorPrimary,
          "--code-bg": token.colorFillSecondary,
          // 所有自定义区域共享 Ant Design 派生的语义颜色。
          "--surface": token.colorFillAlter,
          "--muted": token.colorTextSecondary,
          "--text": token.colorText,
          "--shadow": token.boxShadow,
          // 状态色保留成功、警告、错误语义，背景和边框也使用对应的深浅色派生值。
          "--success": token.colorSuccess,
          "--success-bg": token.colorSuccessBg,
          "--success-border": token.colorSuccessBorder,
          "--warning": token.colorWarning,
          "--warning-bg": token.colorWarningBg,
          "--warning-border": token.colorWarningBorder,
          "--error": token.colorError,
          "--error-bg": token.colorErrorBg,
          "--error-border": token.colorErrorBorder,
          "--info-bg": token.colorPrimaryBg,
          "--info-border": token.colorPrimaryBorder,
          "--accent-bg": token.colorPrimaryBg,
          "--accent-border": token.colorPrimaryBorder,
          "--social-bg": token.colorFillAlter,
          // 同步浏览器原生控件和滚动条的配色模式。
          colorScheme: skin.mode,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
