import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = "public/images";
const files = [];
const walk = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(jpg|jpeg|png)$/i.test(name)) files.push(p);
  }
};
walk(root);
for (const file of files) {
  const meta = await sharp(file).metadata();
  console.log(
    file.replaceAll("\\", "/").padEnd(46),
    `${meta.width}x${meta.height}`.padEnd(12),
    `${(fs.statSync(file).size / 1024).toFixed(0)}KB`
  );
}
