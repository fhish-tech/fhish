#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// For local development, look in the sibling fhish-cli directory
// For production, this should ideally download/contain the binary
const localBinaryPath = path.join(__dirname, '../../../fhish-cli/bin/fhish');

function runBinary(binPath, args) {
  const proc = spawn(binPath, args, { stdio: 'inherit' });
  proc.on('close', (code) => {
    process.exit(code);
  });
}

if (fs.existsSync(localBinaryPath)) {
  runBinary(localBinaryPath, process.argv.slice(2));
} else {
  console.error("Fhish binary not found.");
  console.log("Please build it first in the fhish-cli directory:");
  console.log("  cd fhish-cli && make build");
}
