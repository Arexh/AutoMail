const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api/zhihuituanjian',
    createProxyMiddleware({
      target: 'https://tuanapi.12355.net',
      changeOrigin: true,
      headers: {
        Connection: 'keep-alive',
      },
      pathRewrite: { '^/api/zhihuituanjian': '/' },
    })
  );
  app.use(
    '/api/qingniandaxuexi',
    createProxyMiddleware({
      target: 'https://youthstudy.12355.net',
      changeOrigin: true,
      headers: {
        Connection: 'keep-alive',
      },
      pathRewrite: { '^/api/qingniandaxuexi': '/' },
    })
  );
};
