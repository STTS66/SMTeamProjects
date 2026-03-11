import { spawnSync } from "node:child_process";

const maxAttempts = 5;
const delayMs = 15000;
const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const prismaArgs = ["prisma", "migrate", "deploy"];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  console.log(
    `[prisma-deploy-retry] Attempt ${attempt}/${maxAttempts}: ${prismaCommand} ${prismaArgs.join(" ")}`
  );

  const result = spawnSync(prismaCommand, prismaArgs, {
    stdio: "inherit",
    shell: false,
    env: process.env
  });

  if (result.status === 0) {
    process.exit(0);
  }

  const isLastAttempt = attempt === maxAttempts;

  if (isLastAttempt) {
    process.exit(result.status ?? 1);
  }

  console.log(
    `[prisma-deploy-retry] prisma migrate deploy failed, waiting ${delayMs / 1000}s before retry...`
  );
  await sleep(delayMs);
}
