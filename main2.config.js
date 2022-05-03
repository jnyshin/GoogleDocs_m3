module.exports = {
  apps: [
    {
      name: "API Server 1",
      script: "packages/server/app.js",
      instance_var: "9",
      env: {
        PORT: 9000,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },
    {
      name: "API Server 2",
      script: "packages/server/app.js",
      instance_var: "10",
      env: {
        PORT: 9001,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },

    {
      name: "API Server 3",
      script: "packages/server/app.js",
      instance_var: "11",
      env: {
        PORT: 9002,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },

    {
      name: "API Server 4",
      script: "packages/server/app.js",
      instance_var: "12",
      env: {
        PORT: 9003,
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },
  ],
};
