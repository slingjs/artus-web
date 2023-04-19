module.exports = {
  apps: [
    {
      name: "artus-web",
      script: "pnpm start",
      exec_mode: "cluster",
      instances: 2,
      max_memory_restart: "260M",
      cwd: "/app",
      ignore_watch: ["node_modules"],
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
