const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const AdmZip = require("adm-zip");
const tar = require('tar');

// Mapping of OS to binary info
const binariesInfo = {
  darwin: {
    url: "https://github.com/ollama/ollama/releases/download/v0.3.12/ollama-darwin",
    path: "../binaries/darwin/",
    binaryName: "ollama-darwin",
  },
  linux: {
    url: "https://github.com/ollama/ollama/releases/download/v0.3.12/ollama-linux-amd64.tgz",
    path: "../binaries/linux/",
    binaryName: "ollama",
  },
  win32: {
    url: "https://github.com/ollama/ollama/releases/download/v0.3.12/ollama-windows-amd64.zip",
    path: "../binaries/win32/",
    binaryName: "ollama.exe",
  },
};

function ensureDirectoryExistence(dirPath) {
  if (fs.existsSync(dirPath)) {
    return true;
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function setExecutable(filePath) {
  return new Promise((resolve, reject) => {
    fs.chmod(filePath, 0o755, (err) => {
      if (err) reject(err);
      else {
        console.log(`Set ${filePath} as executable`);
        resolve();
      }
    });
  });
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

function downloadAndExtractArchive(url, extractPath, archiveType, redirectCount = 0, timeout = 1000000) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error("Too many redirects"));
      return;
    }

    const tempPath = path.join(os.tmpdir(), `ollama-temp.${archiveType}`);
    const file = fs.createWriteStream(tempPath);
    let fileStream = null;

    const cleanupAndReject = (error) => {
      if (fileStream) fileStream.close();
      fs.unlink(tempPath, (unlinkError) => {
        if (unlinkError) {
          console.error(`Failed to delete temporary file ${tempPath}: ${unlinkError.message}`);
        }
        reject(error);
      });
    };

    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        fileStream = response.pipe(file);
        fileStream.on('finish', () => {
          fileStream.close(() => {
            console.log('Download completed, extracting...');
            try {
              if (archiveType === 'zip') {
                const zip = new AdmZip(tempPath);
                zip.extractAllTo(extractPath, true);
              } else if (archiveType === 'tgz') {
                fs.createReadStream(tempPath)
                  .pipe(tar.x({ C: extractPath }))
                  .on('finish', () => {
                    console.log('Extraction completed');
                    fs.unlink(tempPath, (unlinkError) => {
                      if (unlinkError) {
                        console.error(`Failed to delete temporary file ${tempPath}: ${unlinkError.message}`);
                      }
                      resolve();
                    });
                  });
                return;
              }
              fs.unlink(tempPath, (unlinkError) => {
                if (unlinkError) {
                  console.error(`Failed to delete temporary file ${tempPath}: ${unlinkError.message}`);
                }
                console.log('Extraction completed');

                // Windows-specific cleanup
                if (process.platform === 'win32') {
                  console.log('Performing Windows-specific cleanup...');
                  const cudaPath = path.join(extractPath, 'cuda');
                  const rocmPath = path.join(extractPath, 'rocm');
                  
                  removeDirectory(cudaPath);
                  removeDirectory(rocmPath);
                  
                  console.log('Cleanup completed');
                }

                resolve();
              });
            } catch (error) {
              cleanupAndReject(new Error(`Failed to extract archive: ${error.message}`));
            }
          });
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        file.close(() => {
          fs.unlink(tempPath, (unlinkError) => {
            if (unlinkError) {
              console.error(`Failed to delete temporary file ${tempPath}: ${unlinkError.message}`);
            }
            console.log(`Following redirect to: ${response.headers.location}`);
            downloadAndExtractArchive(response.headers.location, extractPath, archiveType, redirectCount + 1, timeout)
              .then(resolve)
              .catch(reject);
          });
        });
      } else {
        cleanupAndReject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
      }
    });

    request.on('error', (error) => {
      cleanupAndReject(new Error(`Network error during download: ${error.message}`));
    });

    request.on('timeout', () => {
      request.destroy();
      cleanupAndReject(new Error(`Download timed out after ${timeout}ms`));
    });

    request.setTimeout(timeout);

    file.on('error', (error) => {
      cleanupAndReject(new Error(`File system error: ${error.message}`));
    });
  });
}

async function downloadIfMissing(platformKey) {
  const info = binariesInfo[platformKey];
  const directoryPath = path.join(__dirname, info.path);
  ensureDirectoryExistence(directoryPath);
  console.log("Checking", platformKey, "binary in", directoryPath);
  const filePath = path.join(directoryPath, info.binaryName);

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    console.log(`${platformKey} binary already exists`);
    if (platformKey !== "win32") {
      await setExecutable(filePath);
    }
  } catch (err) {
    console.log(`${platformKey} binary not found, downloading...`);
    try {
      if (platformKey === 'win32') {
        await downloadAndExtractArchive(info.url, directoryPath, 'zip');
        console.log('Windows binary downloaded and extracted');
      } else if (platformKey === 'linux') {
        await downloadAndExtractArchive(info.url, directoryPath, 'tgz');
        console.log('Linux binary downloaded and extracted');
        const extractedBinaryPath = path.join(directoryPath, 'bin', 'ollama');
        await fs.promises.rename(extractedBinaryPath, filePath);
        await setExecutable(filePath);
      } else {
        await downloadAndExtractArchive(info.url, directoryPath, 'binary');
        await setExecutable(filePath);
      }
    } catch (error) {
      console.error(`Error processing ${platformKey} binary:`, error.message);
      throw error; // Re-throw the error to be caught by the caller
    }
  }
}

async function main() {
  const platform = os.platform();
  try {
    if (process.argv[2] === "all") {
      await Promise.all(Object.keys(binariesInfo).map(downloadIfMissing));
    } else {
      await downloadIfMissing(platform);
    }
    console.log("All operations completed successfully");
  } catch (error) {
    console.error("An error occurred during the process:", error.message);
    process.exit(1); // Exit with an error code
  }
}

main();