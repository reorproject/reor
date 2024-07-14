/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs"); // Import the filesystem module
const os = require("os");
const path = require("path");
require("dotenv").config();

const { notarize } = require("@electron/notarize");

const { version } = require("../package.json");

// Recursive function to print directory tree
function printDirectoryTree(startPath, indent = "") {
  const filesAndDirs = fs.readdirSync(startPath);

  filesAndDirs.forEach((file, index) => {
    const filePath = path.join(startPath, file);
    const stats = fs.statSync(filePath);
    const isLast = index === filesAndDirs.length - 1;

    ;
    if (stats.isDirectory()) {
      printDirectoryTree(filePath, indent + (isLast ? "    " : "│   "));
    }
  });
}

async function notarizeApp() {
  const productName = "Reor";

  // Get the current platform
  const platform = os.platform();
  const arch = os.arch();

  // Check if the current platform is macOS and the architecture is Intel or ARM
  if (platform === "darwin" && (arch === "x64" || arch === "arm64")) {
    const platformDir = arch === "x64" ? "mac-x64" : "mac-arm64";

    const appPath = path.join(
      __dirname,
      "..",
      "release",
      version,
      platformDir,
      `${productName}.app`
    );

    // Check if the app file exists
    if (fs.existsSync(appPath)) {
      ;
      ;
      await notarize({
        appPath: appPath,
        teamId: "ZHJMNQM65Q",
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      });
      ;
    } else {
      ;
      // Print the tree of files starting from the release directory
      const releasePath = path.join(__dirname, "..", "release");
      ;
      printDirectoryTree(releasePath);
    }
  } else {
    .");
  }
}

notarizeApp().catch((error) => {
  ;
  process.exit(1);
});
