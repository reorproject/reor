const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");

// Mapping of OS to binary info
const binariesInfo = {
  darwin: {
    url: "https://github.com/ollama/ollama/releases/download/v0.3.6/ollama-darwin",
    path: "../binaries/darwin/ollama-darwin",
  },
  linux: {
    url: "https://github.com/ollama/ollama/releases/download/v0.3.6/ollama-linux-amd64",
    path: "../binaries/linux/ollama-linux-amd64",
  },
  win32: {
    url: "https://github.com/ollama/ollama/releases/download/v0.3.6/ollama-windows-amd64.zip",
    path: "../binaries/win32/ollama.exe",
  },
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
    console.log(`Made ${filePath} executable`);
  });
}

function extractZip(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    const zip = new AdmZip(zipPath);
    zip.extractAllToAsync(extractPath, true, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function downloadIfMissing(platformKey) {
  const info = binariesInfo[platformKey];
  const filePath = path.join(__dirname, info.path);
  ensureDirectoryExistence(filePath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`Downloading ${platformKey} binary...`);
      const request = https.get(info.url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          response.pipe(file);
          file.on("finish", () => {
            file.close(async () => {
              console.log(`Downloaded ${platformKey} binary`);
              if (platformKey === "win32") {
                console.log("Extracting ZIP file...");
                const extractPath = path.dirname(filePath);
                await extractZip(filePath, extractPath);
                fs.unlinkSync(filePath); // Remove the ZIP file
                console.log("ZIP file extracted and removed");
              } else {
                setExecutable(filePath);
              }
            });
          });
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          console.log(`Redirecting to: ${response.headers.location}`);
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
      console.log(`${platformKey} binary already exists`);
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