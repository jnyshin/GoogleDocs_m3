module.exports = {
  apps: [
    {
      name: "API Server 1",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8000,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
    },
    {
      name: "API Server 2",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8001,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
    },

    {
      name: "API Server 3",
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
      name: "API Server 4",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8003,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
    },
    {
      name: "API Server 5",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8005,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
    },
    {
      name: "API Server 6",
      script: "packages/server/app.js",
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8006,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
    },
  ],
};
