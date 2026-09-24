const {
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");
const fs = require("fs"),
  path = require("path");
module.exports = function withLocalPreview(config) {
  if (process.env.EXPO_PUBLIC_LOCAL_PREVIEW !== "1") return config;
  const url = new URL(process.env.EXPO_PUBLIC_API_URL || "");
  if (
    !/^(127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(
      url.hostname,
    )
  )
    throw new Error("Local preview requires a private IPv4 address.");
  config.name = "Buyrun Test";
  config = withAndroidManifest(config, (c) => {
    const app = c.modResults.manifest.application[0];
    app.$["android:networkSecurityConfig"] = "@xml/buyrun_local_network";
    return c;
  });
  return withDangerousMod(config, [
    "android",
    async (c) => {
      const dir = path.join(
        c.modRequest.platformProjectRoot,
        "app/src/main/res/xml",
      );
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, "buyrun_local_network.xml"),
        `<?xml version="1.0" encoding="utf-8"?><network-security-config><base-config cleartextTrafficPermitted="false"/><domain-config cleartextTrafficPermitted="true"><domain includeSubdomains="false">${url.hostname}</domain></domain-config></network-security-config>`,
      );
      return c;
    },
  ]);
};
