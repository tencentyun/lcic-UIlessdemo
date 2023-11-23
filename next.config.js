/** @type {import('next').NextConfig} */
let path = require("path");
const nextConfig = {
  basePath: process.env.NEXT_BASE_PATH,
  webpack: (config) => {
    config.resolve.alias["@styles"] = path.join(__dirname, "src", "assets");
    return config;
  },
};

module.exports = nextConfig;
