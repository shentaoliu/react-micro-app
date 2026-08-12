import { Card, Typography, Alert, Divider } from "antd";
import "./StyleTest.css";

const { Title, Paragraph, Text } = Typography;

function StyleTest() {
  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Typography>
          <Title level={2}>样式测试页面</Title>
          <Paragraph>
            这是一个用于测试 CSS 样式、布局以及各种前端 UI 面试题的沙盒页面。
          </Paragraph>
        </Typography>
        {/* 在这里添加您的样式测试内容 */}
        <Divider>CSS Hack 示例 (面试考点)</Divider>
        <Alert
          message="什么是 CSS Hack？"
          description={
            <>
              <p>
                由于早期不同浏览器（特别是 IE 的各个版本）对 CSS
                的解析规则不同，前端开发者为了让页面在所有浏览器中显示一致，针对不同浏览器编写了特殊的
                CSS 代码，这种技术被称为 CSS Hack。
              </p>
              <p>
                <strong>注意：</strong> 随着现代浏览器的普及（Chrome、Edge
                等）以及 IE 的退役，CSS Hack 在实际开发中已经很少使用，但
                <strong>在老旧项目维护和部分前端面试中仍会被提及</strong>。
              </p>
            </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginTop: 24, border: "1px dashed #ccc", padding: 16 }}>
          <Title level={4}>1. 属性级 Hack (以背景色为例)</Title>
          <Paragraph>
            下面这个方块在现代浏览器（如 Chrome, Firefox）中背景是
            <Text strong style={{ color: "green" }}>
              绿色
            </Text>
            。<br />
            如果在旧版 IE 浏览器中打开，它会解析出不同的颜色：
            <ul>
              <li>
                <code>_background: blue;</code> —— 仅 IE6 识别（蓝色）
              </li>
              <li>
                <code>*background: red;</code> —— 仅 IE6 和 IE7 识别（红色）
              </li>
              <li>
                <code>background: yellow\9;</code> —— 仅 IE6, IE7, IE8, IE9
                识别（黄色）
              </li>
            </ul>
          </Paragraph>

          {/* 这里应用了定义在 StyleTest.css 中的 hack-box 类 */}
          <div className="hack-box">
            我是一个用于测试 CSS Hack 的方块。
            <br />
            (如果你现在用的是现代浏览器，我应该是绿色的)
          </div>

          <Divider />
          <Title level={4}>2. 选择器级 Hack (补充扩展)</Title>
          <Paragraph>
            除了在属性前加符号，还可以在选择器上做文章：
            <ul>
              <li>
                <code>*html .box &#123; ... &#125;</code> —— 仅 IE6 生效
              </li>
              <li>
                <code>*+html .box &#123; ... &#125;</code> —— 仅 IE7 生效
              </li>
            </ul>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
}

export default StyleTest;
