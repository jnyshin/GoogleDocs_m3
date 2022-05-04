module.exports = {
  apps: [
    {
      name: "API Server 1",
      script: "packages/server/app.js",
      instance_var: "1",
      env: {
        PORT: 8000,
        WS_PORT: 8080,
        WS_IP: "10.9.4.238",
        MONGO_IP: "mongodb://10.9.4.238:27017/docs_clone",
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
      instance_var: "2",
      env: {
        PORT: 8001,
        WS_PORT: 8081,
        WS_IP: "10.9.4.238",
        MONGO_IP: "mongodb://10.9.4.238:27017/docs_clone",
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
      instance_var: "3",
      env: {
        PORT: 8002,
        WS_PORT: 8082,
        WS_IP: "10.9.4.238",
        MONGO_IP: "mongodb://10.9.4.238:27017/docs_clone",
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
      instance_var: "4",
      env: {
        PORT: 8003,
        WS_PORT: 8083,
        WS_IP: "10.9.4.238",
        MONGO_IP: "mongodb://10.9.4.238:27017/docs_clone",
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },
    {
      name: "API Server 5",
      script: "packages/server/app.js",
      instance_var: "5",
      env: {
        PORT: 8005,
        WS_PORT: 8080,
        WS_IP: "10.9.8.168",
        MONGO_IP: "mongodb://10.9.4.238:27017/docs_clone",
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },
    {
      name: "API Server 6",
      script: "packages/server/app.js",
      instance_var: "6",
      env: {
        PORT: 8006,
        WS_PORT: 8081,
        WS_IP: "10.9.8.168",
        MONGO_IP: "mongodb://10.9.4.238:27017/docs_clone",
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },
    {
      name: "API Server 7",
      script: "packages/server/app.js",
      instance_var: "7",
      env: {
        PORT: 8007,
        WS_PORT: 8082,
        WS_IP: "10.9.8.168",
        MONGO_IP: "mongodb://10.9.4.238:27017/docs_clone",
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },
    {
      name: "API Server 8",
      script: "packages/server/app.js",
      instance_var: "8",
      env: {
        PORT: 8008,
        WS_PORT: 8083,
        WS_IP: "10.9.8.168",
        MONGO_IP: "mongodb://10.9.4.238:27017/docs_clone",
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      instances: "1",
      out_file: "/dev/null",
      error_file: "/dev/null",
    },
    // {
    //   name: "API Server 9",
    //   script: "packages/server/app.js",
    //   instance_var: "9",
    //   env: {
    //     PORT: 8009,
    //     WS_PORT: 8080,
    //     NODE_ENV: "production",
    //   },
    //   exec_mode: "fork",
    //   instances: "1",
    //   out_file: "/dev/null",
    //   error_file: "/dev/null",
    // },
    // {
    //   name: "API Server 10",
    //   script: "packages/server/app.js",
    //   instance_var: "10",
    //   env: {
    //     PORT: 8010,
    //     WS_PORT: 8081,
    //     NODE_ENV: "production",
    //   },
    //   exec_mode: "fork",
    //   instances: "1",
    //   out_file: "/dev/null",
    //   error_file: "/dev/null",
    // },
    // {
    //   name: "API Server 11",
    //   script: "packages/server/app.js",
    //   instance_var: "11",
    //   env: {
    //     PORT: 8011,
    //     WS_PORT: 8082,
    //     NODE_ENV: "production",
    //   },
    //   exec_mode: "fork",
    //   instances: "1",
    //   out_file: "/dev/null",
    //   error_file: "/dev/null",
    // },
    // {
    //   name: "API Server 12",
    //   script: "packages/server/app.js",
    //   instance_var: "12",
    //   env: {
    //     PORT: 8012,
    //     WS_PORT: 8083,
    //     NODE_ENV: "production",
    //   },
    //   exec_mode: "fork",
    //   instances: "1",
    //   out_file: "/dev/null",
    //   error_file: "/dev/null",
    // },
  ],
};
