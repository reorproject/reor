/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");

// Mapping of OS to binary info
const binariesInfo = {
  darwin: {
    url: "https://github.com/ollama/ollama/releases/download/v0.3.6/ollama-darwin",
    path: "../binaries/darwin/",
    binaryName: "ollama-darwin",
  },
  linux: {
    url: "https://github.com/ollama/ollama/releases/download/v0.3.6/ollama-linux-amd64",
    path: "../binaries/linux/",
    binaryName: "ollama-linux-amd64",
  },
  // win32: {
  //   url: "https://github.com/ollama/ollama/releases/download/v0.3.6/ollama-windows-amd64.zip",
  //   path: "../binaries/win32",

  // },
};

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

function setExecutable(filePath) {
  fs.chmod(filePath, 0o755, (err) => {
    if (err) throw err;
    ;
  });
}

function downloadIfMissing(platformKey) {
  const info = binariesInfo[platformKey];
  const directoryPath = path.join(__dirname, info.path);
  ensureDirectoryExistence(directoryPath);
  console.log("Downloading", platformKey, "binary to", directoryPath);

  const filePath = path.join(directoryPath, info.binaryName);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    console.log("in access err", err);
    if (err) {
      ;
      console.log("err", err);
      const request = https.get(info.url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          response.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              ;
              // Set as executable if not on Windows
              if (platformKey !== "win32") {
                setExecutable(filePath);
              }
            });
          });
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirection (if any)
          ;
          console.log("Redirecting to", response.headers.location);
          binariesInfo[platformKey].url = response.headers.location;
          downloadIfMissing(platformKey); // Retry with the new URL
        } else {
          throw new Error(
            `Failed to download ${platformKey} binary: ${response.statusCode} ${response.statusMessage}`
          );
        }
      });
      request.on("error", (error) => {
        console.error(
          `Error downloading ${platformKey} binary: ${error.message}`
        );
      });
    } else {
      ;
      // Ensure it's executable if it already exists and not on Windows
      if (platformKey !== "win32") {
        setExecutable(filePath);
      }
    }
  });
}

const platform = os.platform();

if (process.argv[2] === "all") {
  Object.keys(binariesInfo).forEach(downloadIfMissing);
} else {
  downloadIfMissing(platform);
}