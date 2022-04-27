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
      instances: "3",
    },
    {
      name: "OP Server",
      script: "packages/opServer/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8002,
        NODE_ENV: "production",
      },
      exec_mode: "cluster",
      instances: "1",
    },
  ],
};
