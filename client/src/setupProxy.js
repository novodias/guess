const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use('/api',
        createProxyMiddleware({
            target: "http://localhost:3001/",
            changeOrigin: true,
        })
    );

    app.use('/socket',
        createProxyMiddleware({
            target: "ws://localhost:3001/",
            changeOrigin: true,
            ws: true,
            logLevel: 'debug'
        })
    );
};