// blacklist.js
let blacklist = [];

function addToBlacklist(token) {
  if (!blacklist.includes(token)) {
    blacklist.push(token);
  }
}

function isBlacklisted(token) {
  return blacklist.includes(token);
}

module.exports = { addToBlacklist, isBlacklisted };
