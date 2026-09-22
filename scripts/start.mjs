import { cp, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import nextEnv from "@next/env";

const projectDirectory = fileURLToPath(new URL("../", import.meta.url));
const standaloneDirectory = join(projectDirectory, ".next/standalone");
const args = process.argv.slice(2);
const options = {};
for (let index = 0; index < args.length; index += 2) {
  const option = args[index];
  const value = args[index + 1];
  if (!["--port", "-p", "--hostname", "-H"].includes(option) || !value) {
    console.error("Kullanım: npm run start -- [--port 3000] [--hostname 0.0.0.0]");
    process.exit(1);
  }
  options[option === "--port" || option === "-p" ? "PORT" : "HOSTNAME"] = value;
}

try {
  await access(join(standaloneDirectory, "server.js"));
} catch {
  console.error("Üretim derlemesi bulunamadı. Önce npm run build komutunu çalıştırın.");
  process.exit(1);
}

// Standalone starts in its own directory. Load local runtime values before that move
// and keep a relative data directory anchored to the project, as in development.
nextEnv.loadEnvConfig(projectDirectory, false);
await Promise.all([
  cp(join(projectDirectory, "public"), join(standaloneDirectory, "public"), { recursive: true }),
  cp(join(projectDirectory, ".next/static"), join(standaloneDirectory, ".next/static"), { recursive: true }),
]);
const child = spawn(process.execPath, [join(standaloneDirectory, "server.js")], {
  cwd: standaloneDirectory,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    HOSTNAME: "0.0.0.0",
    DATA_DIR: resolve(projectDirectory, process.env.DATA_DIR || "data"),
    ...options,
  },
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", (error) => {
  console.error(`Sunucu başlatılamadı: ${error.message}`);
  process.exit(1);
});
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
