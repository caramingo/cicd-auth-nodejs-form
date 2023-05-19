const fs = require('fs');

function readAuthFile() {
  return JSON.parse(fs.readFileSync('auth.json', 'utf8'));
}

exports.readAuthFile = readAuthFile;