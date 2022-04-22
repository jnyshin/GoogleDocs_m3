module.exports = {
  apps: [
    {
      name: "app1",
      script: "packages/server/app.js",
      env_production: {
        NODE_ENV: "production",
        NODE_PORT: "80",
        NODE_IP: "icloud.cse356.compas.cs.stonybrook.edu",
      },
    },
  ],
};
