module.exports = {
  apps: [
    {
      name: 'innate-backend',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        HTTP_PORT: 8000,
        WS_PORT: 8080
      },
      env_production: {
        NODE_ENV: 'production',
        HTTP_PORT: 8000,
        WS_PORT: 8080
      }
    }
  ]
};
