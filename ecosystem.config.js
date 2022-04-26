module.exports = {
  apps: [
    {
      name: "APi Server",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8000,
        NODE_ENV: "production",
      },
      exec_mode: "cluster",
      instances: "2",
    },
    {
      name: "Media Server",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8002,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
    },
    {
      name: "OP Server",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8001,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
    },
  ],
};
