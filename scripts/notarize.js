/* eslint-disable @typescript-eslint/no-var-requires */
const { notarize } = require("@electron/notarize");
const { version } = require("../package.json");
const path = require("path");
const os = require("os");

async function notarizeApp() {
  const productName = "Reor"; // Replace with your actual product name

  // Get the current platform
  const platform = os.platform();
  const arch = os.arch();

  // Check if the current platform is macOS and the architecture is Intel or ARM
  if (platform === "darwin" && arch === "arm64") {
    const platformDir = arch === "x64" ? "mac-x64" : "mac-arm64";

    const appPath = path.join(
      __dirname,
      "..",
      "release",
      version,
      platformDir,
      `${productName}.app`
    );

    console.log(`Notarizing ${productName}.app`);
    await notarize({
      tool: "notarytool",
      appPath: appPath,
      teamId: "ZHJMNQM65Q",
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    });
  }

  //   console.log(`Notarization complete for ${build.productName}.app`);
}

notarizeApp().catch((error) => {
  console.error(error);
  process.exit(1);
});
