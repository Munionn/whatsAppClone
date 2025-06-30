const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ name: 'Gateway Server', someText: 'Gateway Server' });
});

app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.url}`);
    next();
});

// Proxy for authentication server
app.use('/auth', proxy('http://auth-service:3001', {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        return proxyReqOpts;
    },
    proxyReqBodyDecorator: (bodyContent, srcReq) => {
        return bodyContent;
    },
    userResDecorator: async (proxyRes, proxyResData, userReq, userRes) => {
        // Optionally log or modify the response here
        return proxyResData;
    }
}));

// // Proxy to User Service
// app.use('/users', createProxyMiddleware({
//     target: 'http://user-service:4002',
//     changeOrigin: true
// }));

// // Proxy to Chat Service
// app.use('/chats', createProxyMiddleware({
//     target: 'http://chat-service:4003',
//     changeOrigin: true
// }));

// // Proxy to Message Service
// app.use('/messages', createProxyMiddleware({
//     target: 'http://message-service:4004',
//     changeOrigin: true
// }));

// // Proxy to Presence Service (WebSocket)
// app.use('/presence', createProxyMiddleware({
//     target: 'http://presence-service:4005',
//     changeOrigin: true
// }));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});