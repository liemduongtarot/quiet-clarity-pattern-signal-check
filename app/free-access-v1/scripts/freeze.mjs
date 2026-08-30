import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(appRoot, "../..");
const qualificationDirectory = resolve(appRoot, "qualification");
const qualificationPath = resolve(qualificationDirectory, "qualification.json");
const qualification = JSON.parse(readFileSync(qualificationPath, "utf8"));
if (qualification.verdict !== "PASS") throw new Error("Track B may be frozen only after qualification PASS");

const packagePath = resolve(qualificationDirectory, "free-access-v1-qualification.tgz");
const sidecarPath = `${packagePath}.sha256`;
const manifestPath = resolve(qualificationDirectory, "FREEZE_MANIFEST.sha256");

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function walk(directory) {
  return readdirSync(directory).sort().flatMap((name) => {
    const path = resolve(directory, name);
    if (path === packagePath || path === sidecarPath || path === manifestPath) return [];
    if (name === ".data") return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function archiveName(path) {
  if (path.startsWith(appRoot)) return `free-access-v1/${relative(appRoot, path).replaceAll("\\", "/")}`;
  return `free-access-v1/${relative(repositoryRoot, path).replaceAll("\\", "/")}`;
}

const workflow = resolve(repositoryRoot, ".github/workflows/free-access-v1.yml");
const contentFiles = [...walk(appRoot), workflow].sort((a, b) => archiveName(a).localeCompare(archiveName(b)));
const manifest = contentFiles
  .map((path) => `${sha256(readFileSync(path))}  ${archiveName(path)}`)
  .join("\n");
writeFileSync(manifestPath, `${manifest}\n`);

function writeString(buffer, offset, length, value) {
  Buffer.from(value).copy(buffer, offset, 0, length);
}

function writeOctal(buffer, offset, length, value) {
  const text = value.toString(8).padStart(length - 1, "0");
  writeString(buffer, offset, length, `${text}\0`);
}

function tarHeader(name, size) {
  if (Buffer.byteLength(name) > 100) throw new Error(`Archive path is too long: ${name}`);
  const header = Buffer.alloc(512, 0);
  writeString(header, 0, 100, name);
  writeOctal(header, 100, 8, 0o644);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  writeString(header, 257, 6, "ustar\0");
  writeString(header, 263, 2, "00");
  writeString(header, 265, 32, "psc-free-access");
  writeString(header, 297, 32, "psc-free-access");
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  writeString(header, 148, 8, `${checksum.toString(8).padStart(6, "0")}\0 `);
  return header;
}

const archiveFiles = [...contentFiles, manifestPath].sort((a, b) => archiveName(a).localeCompare(archiveName(b)));
const blocks = [];
for (const path of archiveFiles) {
  const body = readFileSync(path);
  blocks.push(tarHeader(archiveName(path), body.length), body);
  const remainder = body.length % 512;
  if (remainder) blocks.push(Buffer.alloc(512 - remainder));
}
blocks.push(Buffer.alloc(1024));
const archive = gzipSync(Buffer.concat(blocks), { level: 9, mtime: 0 });
writeFileSync(packagePath, archive);
const digest = sha256(archive);
writeFileSync(sidecarPath, `${digest}  ${relative(qualificationDirectory, packagePath).replaceAll("\\", "/")}\n`);
console.log(JSON.stringify({
  event: "track_b_frozen",
  package: relative(appRoot, packagePath).replaceAll("\\", "/"),
  sha256: digest,
  integrationStatus: qualification.integrationStatus,
}));
