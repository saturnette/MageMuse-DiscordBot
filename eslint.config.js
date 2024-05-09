import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { languageOptions: { globals: { ...globals.browser, process: true, Buffer: true } } },
  pluginJs.configs.recommended,
];