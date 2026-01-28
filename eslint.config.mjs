import nextlint from "eslint-config-next";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  ...nextlint,
];
