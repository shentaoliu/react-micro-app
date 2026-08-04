import {
  Card,
  Typography,
  Button,
  Space,
  message,
  Alert,
  Input,
  Divider,
} from "antd";
import { useState } from "react";

const { Title, Paragraph, Text } = Typography;

function ShortcutTools() {
  const [xssInput, setXssInput] = useState("");
  const [storedXss, setStoredXss] = useState<string[]>([]);
  // 设置 Cookie
  const setCookie = () => {
    document.cookie = `testCookie=HelloCookie; expires=${new Date(
      Date.now() + 86400000,
    ).toUTCString()}; path=/; SameSite=Lax`;
    message.success(
      "Cookie 'testCookie' 设置成功，包含 Secure 和 SameSite 属性",
    );
  };

  // 读取 Cookie
  const getCookie = () => {
    const cookies = document.cookie;
    if (cookies) {
      message.info(`当前所有的 Cookie: ${cookies}`);
    } else {
      message.warning("当前没有 Cookie");
    }
  };

  // 删除 Cookie
  const deleteCookie = () => {
    document.cookie =
      "testCookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    message.success("Cookie 'testCookie' 已删除");
  };

  // --- LocalStorage ---
  const setLocalStorage = () => {
    localStorage.setItem("testLocal", "HelloLocalStorage");
    message.success("LocalStorage 'testLocal' 设置成功");
  };

  const getLocalStorage = () => {
    const val = localStorage.getItem("testLocal");
    if (val) {
      message.info(`读取 LocalStorage: testLocal = ${val}`);
    } else {
      message.warning("LocalStorage 'testLocal' 不存在");
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("testLocal");
    message.success("LocalStorage 'testLocal' 已删除");
  };

  // --- SessionStorage ---
  const setSessionStorage = () => {
    sessionStorage.setItem("testSession", "HelloSessionStorage");
    message.success("SessionStorage 'testSession' 设置成功");
  };

  const getSessionStorage = () => {
    const val = sessionStorage.getItem("testSession");
    if (val) {
      message.info(`读取 SessionStorage: testSession = ${val}`);
    } else {
      message.warning("SessionStorage 'testSession' 不存在");
    }
  };

  const clearSessionStorage = () => {
    sessionStorage.removeItem("testSession");
    message.success("SessionStorage 'testSession' 已删除");
  };

  // 模拟提交 XSS 评论
  const handleXssSubmit = () => {
    if (xssInput) {
      setStoredXss([...storedXss, xssInput]);
      setXssInput("");
      message.success("评论已提交（如果包含恶意脚本，渲染时可能会被执行）");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Typography>
        <Title level={2}>前端安全与存储复习工具</Title>
        <Paragraph>
          用于面试复习：观察 Storage 行为差异，并模拟 XSS 和 CSRF 攻击场景。
        </Paragraph>
      </Typography>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* --- XSS 攻击模拟区 --- */}
        <Card title="⚠️ XSS (跨站脚本) 攻击模拟">
          <Alert
            message="XSS 原理与防御"
            description={
              <ul>
                <li>
                  <strong>原理：</strong> 攻击者在页面中注入恶意的 JavaScript
                  代码。当其他用户浏览该页面时，脚本被执行，从而窃取
                  Cookie、Token 等敏感信息，或模拟用户操作。
                </li>
                <li>
                  <strong>防御：</strong> 对用户输入进行转义（React
                  默认已做）、对输出进行净化、设置 Cookie 的{" "}
                  <code>HttpOnly</code> 属性（防止通过{" "}
                  <code>document.cookie</code> 读取）。
                </li>
              </ul>
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text type="secondary">
              尝试输入：&lt;img src="x" onerror="alert('XSS攻击成功！Cookie: ' +
              document.cookie)"&gt;
            </Text>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={xssInput}
                onChange={(e) => setXssInput(e.target.value)}
                placeholder="输入包含恶意脚本的评论..."
              />
              <Button type="primary" danger onClick={handleXssSubmit}>
                提交评论
              </Button>
            </Space.Compact>
            <Divider>评论列表</Divider>
            <div
              style={{ padding: 16, background: "#f5f5f5", borderRadius: 4 }}
            >
              {storedXss.length === 0 ? (
                <Text type="secondary">暂无评论</Text>
              ) : null}
              {storedXss.map((item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 16,
                    borderBottom: "1px dashed #ddd",
                    paddingBottom: 8,
                  }}
                >
                  <div style={{ marginBottom: 4 }}>
                    <Text type="danger" strong>
                      【未防御 XSS (危险渲染)】：
                    </Text>
                    {/* 故意暴露漏洞的写法：使用 dangerouslySetInnerHTML 直接渲染未经转义的 HTML */}
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                  <div>
                    <Text type="success" strong>
                      【已防御 XSS (安全渲染)】：
                    </Text>
                    {/* 安全的写法：React 默认会转义，将其作为纯文本显示 */}
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
            <Text type="warning" style={{ fontSize: 12 }}>
              注：为了直观对比，上面同时展示了存在漏洞的渲染方式（会导致弹窗窃取
              Cookie）和 React 默认的安全渲染方式（将脚本显示为文本）。
            </Text>
          </Space>
        </Card>

        {/* --- CSRF 攻击模拟区 --- */}
        <Card title="🎣 CSRF (跨站请求伪造) 攻击说明">
          <Alert
            message="CSRF 原理与防御"
            description={
              <ul>
                <li>
                  <strong>原理：</strong>{" "}
                  攻击者诱导已登录的用户访问恶意网站，在恶意网站中向受信任网站发起跨站请求。浏览器会自动携带受信任网站的
                  Cookie（包含登录态），导致受信任网站误以为是用户的真实操作。
                </li>
                <li>
                  <strong>核心：</strong> 利用了浏览器自动携带 Cookie
                  的机制，攻击者并没有窃取到 Cookie，只是“借用”了它。
                </li>
                <li>
                  <strong>防御：</strong>
                  <ol>
                    <li>验证 Token（如 JWT），不依赖 Cookie 传登录态。</li>
                    <li>
                      设置 Cookie 的 <code>SameSite=Lax</code> 或{" "}
                      <code>Strict</code> 属性（防止跨站请求携带 Cookie）。
                    </li>
                    <li>验证 HTTP Referer 或 Origin 字段。</li>
                  </ol>
                </li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Paragraph>
            <strong>模拟场景：</strong> 假设你在银行网站登录了（有了
            Cookie），然后你不小心访问了一个恶意网页，里面有一段隐藏代码：
            <pre style={{ background: "#fafafa", padding: 8, marginTop: 8 }}>
              {`<form action="http://bank.com/transfer" method="POST" id="hackForm">
  <input type="hidden" name="toAccount" value="HackerAccount" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.getElementById("hackForm").submit();</script>`}
            </pre>
            如果你银行的 Cookie 没有设置 <code>SameSite</code>{" "}
            防御，这笔钱就会在你不知情的情况下被转走。
          </Paragraph>
          <Button
            onClick={() => {
              message.info(
                "这只是一个原理演示，实际 CSRF 攻击发生在第三方网站上，诱导你发起对本站的请求。",
              );
            }}
          >
            点击了解
          </Button>
        </Card>

        <Divider>以下为存储机制复习</Divider>

        {/* --- 原有存储测试区 --- */}
        <Card title="1. Cookie">
          <Alert
            message="Cookie 特点"
            description={
              <ul>
                <li>每次 HTTP 请求都会自动携带（增加网络负担）。</li>
                <li>大小限制约 4KB。</li>
                <li>
                  可以通过设置 expires/max-age
                  控制生命周期，不设置则为会话级别的 Session Cookie。
                </li>
                <li>
                  安全性：支持 HttpOnly (防止 XSS)、Secure (仅 HTTPS)、SameSite
                  (防 CSRF)。
                </li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Space>
            <Button type="primary" onClick={setCookie}>
              设置 Cookie
            </Button>
            <Button onClick={getCookie}>读取 Cookie</Button>
            <Button danger onClick={deleteCookie}>
              删除 Cookie
            </Button>
          </Space>
        </Card>

        <Card title="2. LocalStorage (Web Storage)">
          <Alert
            message="LocalStorage 特点"
            description={
              <ul>
                <li>持久化存储，除非主动清除，否则永远存在。</li>
                <li>容量大，一般为 5MB 左右。</li>
                <li>不参与和服务器的通信（不在 HTTP Header 中）。</li>
                <li>
                  受同源策略限制。同一个域名下的所有页面共享相同的
                  LocalStorage。
                </li>
              </ul>
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Space>
            <Button type="primary" onClick={setLocalStorage}>
              设置 LocalStorage
            </Button>
            <Button onClick={getLocalStorage}>读取 LocalStorage</Button>
            <Button danger onClick={clearLocalStorage}>
              删除 LocalStorage
            </Button>
          </Space>
        </Card>

        <Card title="3. SessionStorage (Web Storage)">
          <Alert
            message="SessionStorage 特点"
            description={
              <ul>
                <li>会话级别存储，关闭当前浏览器标签页或窗口后就会被清除。</li>
                <li>容量一般也是 5MB。</li>
                <li>不参与和服务器的通信。</li>
                <li>
                  <strong>隔离性：</strong>即使是同一个
                  URL，在不同的标签页中打开，SessionStorage
                  也是独立的（相互隔离的）。
                </li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Space>
            <Button type="primary" onClick={setSessionStorage}>
              设置 SessionStorage
            </Button>
            <Button onClick={getSessionStorage}>读取 SessionStorage</Button>
            <Button danger onClick={clearSessionStorage}>
              删除 SessionStorage
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
}

export default ShortcutTools;
