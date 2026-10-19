import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 本项目额外忽略：这些目录里混入了构建产物，不该被当作源码检查。
    // .claude/worktrees 下可能带 .next；.workbuddy 是编辑器数据；
    // .next_old_* 是本地清理缓存时留下的临时目录。
    ".claude/**",
    ".workbuddy/**",
    ".next_old_*/**",
  ]),
]);

export default eslintConfig;
