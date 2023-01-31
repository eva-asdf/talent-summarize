module.exports = {
  productionSourceMap: false,
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'assets',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}