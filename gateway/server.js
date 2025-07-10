const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy for WebSocket (must be FIRST)
app.use(
    '/socket.io',
    createProxyMiddleware({
        target: 'http://main-service:3002',
        ws: true,
        changeOrigin: true,
        logLevel: 'debug'
    })
);

// Proxy for Auth Service (must be before body parsers)
app.use('/auth', require('express-http-proxy')('http://auth-service:3001'));

// Now add other middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Target services URLs from environment or default to Docker services names
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const MAIN_SERVICE_URL = process.env.MAIN_SERVICE_URL || 'http://main-service:3002';


app.use('/main', createProxyMiddleware({
    target: MAIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/main': '' },
}));

// Default routes
app.get('/', (req, res) => {
    res.json({ message: 'Gateway Server is running.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Gateway server is running on port ${PORT}`);
});
