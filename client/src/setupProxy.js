const { createProxyMiddleware } = require('http-proxy-middleware');



module.exports = function(app) {
    app.use('/api',
        createProxyMiddleware({
            target: "https://ritmovu.dev:3001",
            changeOrigin: true,
            pathRewrite: {
                '^/api/': "/"
            },
            logLevel: 'debug',
            secure: false,
            onError: (err, req, res) => {
                console.error(err);
            }
        })
    );

    app.use('/cdn',
        createProxyMiddleware({
            target: "https://cdn.ritmovu.dev:3001",
            changeOrigin: true,
            secure: false,
            pathRewrite: {
                '^/cdn/': "/"
            },
            logLevel: 'debug'
        })
    );

    app.use('/socket',
        createProxyMiddleware({
            target: "wss://ritmovu.dev:3001/",
            changeOrigin: true,
            ws: true,
            logLevel: 'debug'
        })
    );
};