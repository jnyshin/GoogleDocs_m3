module.exports = {
  apps: [
    {
      name: "docs",
      script: "packages/server/app.js",
      watch: true,
      instance_var: "INSTANCE_ID",
      env: {
        PORT: 8000,
        NODE_ENV: "development",
      },
      exec_mode: "cluster",
      instances: "3",
    },
  ],
};
