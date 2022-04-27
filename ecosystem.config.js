module.exports = {
  apps: [
    {
      name: "API Server",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8000,
        NODE_ENV: "production",
      },
      exec_mode: "cluster",
      instances: "4",
    },
  ],
};
