const { spawn } = require("child_process");
const path = require("path");

function startProcess(command, args, options) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    ...options,
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      process.exitCode = code || 1;
    }
  });

  return child;
}

const rootDir = path.resolve(__dirname, "..");
const frontendDir = path.join(rootDir, "frontend");

const server = startProcess("node", ["server/index.js"], {
  cwd: rootDir,
});

const frontend = startProcess("npm", ["run", "dev"], {
  cwd: frontendDir,
});

function shutdown() {
  server.kill();
  frontend.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
