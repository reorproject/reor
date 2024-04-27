/* eslint-disable @typescript-eslint/no-var-requires */
const { notarize } = require("@electron/notarize");
const { version } = require("../package.json");
const path = require("path");

async function notarizeApp() {
  const buildVersion = version;
  const productName = "Reor"; // Replace with your actual product name
  const platform = "mac-arm64"; // Adjust this based on your target platform

  const appPath = path.join(
    __dirname,
    "..",
    "release",
    buildVersion,
    platform,
    `${productName}.app`
  );

  await notarize({
    tool: "notarytool",
    appPath: appPath,
    teamId: "ZHJMNQM65Q",
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
  });

  //   console.log(`Notarization complete for ${build.productName}.app`);
}

notarizeApp().catch((error) => {
  console.error(error);
  process.exit(1);
});
