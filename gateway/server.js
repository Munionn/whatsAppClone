const express = require('express');
const cors = require('cors');
const proxy = require("express-http-proxy")


const app  = express();
const PORT = process.env.PORT || 3000;

app.get('/some', (req, res) => {
    res.json({name: 'Gateway Server', someText: 'Gateway Server'});
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.url}`);
})

// Proxy for authentication server
app.use('/auth', proxy('http://localhost:3001'));

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
})