const fs = require("fs");
const path = require("path");

const targetPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "aes-js",
  "lib.commonjs",
  "index.js"
);

const patchedSource = `"use strict";

const aesjs = require("../index.js");

module.exports = {
  AES: aesjs.AES,
  ModeOfOperation: aesjs.ModeOfOperation,
  CBC: aesjs.ModeOfOperation.cbc,
  CFB: aesjs.ModeOfOperation.cfb,
  CTR: aesjs.ModeOfOperation.ctr,
  ECB: aesjs.ModeOfOperation.ecb,
  OFB: aesjs.ModeOfOperation.ofb,
  pkcs7Pad: aesjs.padding.pkcs7.pad,
  pkcs7Strip: aesjs.padding.pkcs7.strip,
};
`;

if (!fs.existsSync(targetPath)) {
  process.exit(0);
}

const currentSource = fs.readFileSync(targetPath, "utf8");
if (currentSource === patchedSource) {
  process.exit(0);
}

fs.writeFileSync(targetPath, patchedSource, "utf8");
console.log("[DarkAgent] Patched aes-js CommonJS entry for ethers compatibility.");
