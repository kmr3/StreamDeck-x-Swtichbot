import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

function createPlugins(outDir) {
  return [
    typescript({
      compilerOptions: {
        declaration: false,
        noEmit: false,
        outDir,
      },
      noForceEmit: true,
      tsconfig: "./tsconfig.json",
    }),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
  ];
}

export default [
  {
    input: "src/plugin.ts",
    output: {
      file: "com.example.switchbot.sdPlugin/bin/plugin.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: createPlugins("com.example.switchbot.sdPlugin/bin"),
  },
  {
    input: "src/workspace/plugin.ts",
    output: {
      file: "com.example.workspace.sdPlugin/bin/plugin.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: createPlugins("com.example.workspace.sdPlugin/bin"),
  },
];
