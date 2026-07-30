import express from 'express';

const app = express();
const PORT = 3001; // React 默认在 5173，Node 运行在 3001 形成跨域（不同端口）

// 定义一个基础接口
app.get('/api/data', (req, res) => {
  res.json({
    message: '这是一条来自 Node.js 本地服务的数据！',
    timestamp: new Date().toISOString(),
    source: 'Local Node Server'
  });
});

app.listen(PORT, () => {
  console.log(`Node 服务已启动，正在监听端口: ${PORT}`);
  console.log(`测试接口: http://localhost:${PORT}/api/data`);
});