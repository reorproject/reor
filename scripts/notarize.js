/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs') // Import the filesystem module
const os = require('os')
const path = require('path')
require('dotenv').config()

const { notarize } = require('@electron/notarize')

const { version } = require('../package.json')

// Recursive function to print directory tree
function printDirectoryTree(startPath, indent = '') {
  const filesAndDirs = fs.readdirSync(startPath)

  filesAndDirs.forEach((file, index) => {
    const filePath = path.join(startPath, file)
    const stats = fs.statSync(filePath)
    const isLast = index === filesAndDirs.length - 1

    console.log(`${indent}${isLast ? '└──' : '├──'} ${file}`)
    if (stats.isDirectory()) {
      printDirectoryTree(filePath, indent + (isLast ? '    ' : '│   '))
    }
  })
}

async function notarizeApp() {
  console.log('Notarizing the app...')
  const productName = 'Reor'

  // Get the current platform
  const platform = os.platform()
  const arch = os.arch()

  // Check if the current platform is macOS and the architecture is Intel or ARM
  if (platform === 'darwin' && (arch === 'x64' || arch === 'arm64')) {
    const platformDir = arch === 'x64' ? 'mac-x64' : 'mac-arm64'

    const appPath = path.join(__dirname, '..', 'release', version, platformDir, `${productName}.app`)

    // Check if the app file exists
    if (fs.existsSync(appPath)) {
      console.log(`Found ${productName}.app at ${appPath}`)
      console.log(`Notarizing ${productName}.app`)
      await notarize({
        appPath: appPath,
        teamId: 'ZHJMNQM65Q',
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      })
      console.log(`Notarization complete for ${productName}.app`)
    } else {
      console.error(`Error: ${productName}.app does not exist at ${appPath}`)
      // Print the tree of files starting from the release directory
      const releasePath = path.join(__dirname, '..', 'release')
      console.log(`Directory tree of ${releasePath}:`)
      printDirectoryTree(releasePath)
    }
  } else {
    console.log('Notarization is only supported on macOS (Intel or ARM).')
  }
}

notarizeApp().catch((error) => {
  console.error(error)
  process.exit(1)
})
