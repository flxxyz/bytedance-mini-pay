import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import json from 'rollup-plugin-json'
import { uglify } from "rollup-plugin-uglify";

export default {
  input: "src/index.js",
  output: {
    dir: "lib",
    format: "cjs",
    exports: "named"
  },
  external: ["node-fetch"],
  experimentalCodeSplitting: true,
  plugins: [
    json(),
    resolve(),
    commonjs({
      include: ["node_modules/**"]
    }),
    babel({
      exclude: ["node_modules/**"]
    }),
    process.env.NODE_ENV === "production" && uglify()
  ]
};
