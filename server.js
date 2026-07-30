import express from "express";

const app = express();
const PORT = 3001; // React 默认在 5173，Node 运行在 3001 形成跨域（不同端口）

// 核心：手动配置 CORS 跨域响应头（没有这部分页面接口请求会报错）
app.use((req, res, next) => {
  // 1. 允许哪些客户端源访问（* 表示允许所有源，生产环境建议写具体的域名，如 'http://localhost:5173'）
  res.setHeader("Access-Control-Allow-Origin", "*");
  // 2. 允许哪些 HTTP 请求方法
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  // 3. 允许客户端发送哪些自定义请求头
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 4. 快速响应 OPTIONS 预检请求 (Preflight Request)
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

// 定义一个基础接口
app.get("/api/data", (req, res) => {
  res.json({
    message: "这是一条来自 Node.js 本地服务的数据！",
    timestamp: new Date().toISOString(),
    source: "Local Node Server",
  });
});

app.listen(PORT, () => {
  console.log(`Node 服务已启动，正在监听端口: ${PORT}`);
  console.log(`测试接口: http://localhost:${PORT}/api/data`);
});
