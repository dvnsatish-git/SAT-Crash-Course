import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  { ignores: [".next/**", "node_modules/**"] },
  {
    rules: {
      // These React Compiler-oriented rules flag standard patterns used
      // throughout this app (loading data on mount, Date.now() in handlers)
      // that are not compiler-unsafe here since the app doesn't opt into it.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;
