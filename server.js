import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const PORT = 3001; // React 默认在 5173，Node 运行在 3001 形成跨域（不同端口）

// --- 初始化 Socket.IO 并配置跨域 ---
// 注意：虽然 WebSocket 协议不受同源策略限制，但 socket.io 为了安全性
// 默认在建立握手时会校验 Origin，所以后端需要显式配置 cors
const io = new Server(httpServer, {
  cors: {
    origin: "*", // 允许任何前端域连接，生产环境应写具体的前端域名
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket.IO] 客户端已连接: ${socket.id}`);

  // 监听客户端发来的消息
  socket.on("clientMessage", (data) => {
    console.log(`[Socket.IO] 收到客户端 ${socket.id} 消息:`, data);

    // 模拟处理并回复客户端
    setTimeout(() => {
      socket.emit("serverMessage", `服务器已收到你的消息: "${data}"`);
    }, 500);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] 客户端已断开: ${socket.id}`);
  });
});

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

httpServer.listen(PORT, () => {
  console.log(`Node 服务已启动，正在监听端口: ${PORT}`);
  console.log(`测试 HTTP 接口: http://localhost:${PORT}/api/data`);
  console.log(`WebSocket 正在监听: ws://localhost:${PORT}`);
});
