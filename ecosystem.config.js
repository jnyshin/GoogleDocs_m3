module.exports = {
  apps: [
    {
      name: "app1",
      script: "packages/server/app.js",
    },
  ],
  deploy: {
    production: {
      host: "209.94.56.137",
    },
  },
};
