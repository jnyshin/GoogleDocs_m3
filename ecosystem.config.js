module.exports = {
  apps: [
    {
      name: "API Server 1",
      script: "packages/server/app.js",
      instance_var: "1",
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
      instance_var: "2",
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
      instance_var: "3",
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
      instance_var: "4",
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
      instance_var: "8",
      env: {
        PORT: 8008,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
    },
    // {
    //   name: "API Server 9",
    //   script: "packages/server/app.js",
    //   instance_var: "9",
    //   env: {
    //     PORT: 8009,
    //     NODE_ENV: "production",
    //   },
    //   exec_mode: "fork",
    //   instances: "1",
    // },
    // {
    //   name: "API Server 10",
    //   script: "packages/server/app.js",
    //   instance_var: "10",
    //   env: {
    //     PORT: 8010,
    //     NODE_ENV: "production",
    //   },
    //   exec_mode: "fork",
    //   instances: "1",
    // },
  ],
};
