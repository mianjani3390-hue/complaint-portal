import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const adminRoot = path.join(root, "Admin UI");
const userRoot = path.join(
  root,
  "User UI",
  "Complaint-system",
  "bano-qabil-compliant-system"
);

const adminUrl = "http://localhost:5173/admin/";
const userUrl = "http://localhost:5174/";

async function isUrlReady(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

function npmRunArgs(script) {
  return process.platform === "win32"
    ? {
        command: process.env.ComSpec || "cmd.exe",
        args: ["/d", "/s", "/c", "npm", "run", script],
      }
    : {
        command: "npm",
        args: ["run", script],
      };
}

function runNpmScript(cwd, script, label) {
  const { command, args } = npmRunArgs(script);
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
    }
  });
  return child;
}

const devServersAlreadyRunning = (await isUrlReady(adminUrl)) && (await isUrlReady(userUrl));

if (devServersAlreadyRunning) {
  console.log("Dev servers are already running:");
  console.log(`  Admin UI: ${adminUrl}`);
  console.log(`  User UI:  ${userUrl}`);
} else {
  const admin = runNpmScript(adminRoot, "dev", "admin");
  const user = runNpmScript(userRoot, "dev:user-only", "user");

  function shutdown() {
    admin.kill("SIGTERM");
    user.kill("SIGTERM");
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  admin.on("exit", () => {
    if (!user.killed) user.kill("SIGTERM");
  });
  user.on("exit", () => {
    if (!admin.killed) admin.kill("SIGTERM");
  });
}
