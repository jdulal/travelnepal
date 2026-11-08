import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const bin = process.env.XAMPP_MYSQL_BIN || "D:/xampp/mysql/bin";
const datadir = path.join(root, ".mysql-data");
const mysqld = path.join(bin, "mysqld.exe");
const mysqladmin = path.join(bin, "mysqladmin.exe");
const port = "3307";
const action = process.argv[2] || "start";

if (!fs.existsSync(datadir)) {
  console.error("No local database found at .mysql-data.");
  console.error(`Initialize it once with: "${path.join(bin, "mysql_install_db.exe")}" --datadir="${datadir}" --password="" --port=${port}`);
  process.exit(1);
}

if (action === "start") {
  if (!fs.existsSync(mysqld)) {
    console.error(`mysqld not found at ${mysqld}. Set XAMPP_MYSQL_BIN to your MySQL bin folder.`);
    process.exit(1);
  }
  const child = spawn(mysqld, ["--defaults-file=" + path.join(datadir, "my.ini")], {
    detached: true,
    stdio: "ignore",
    cwd: root,
  });
  child.unref();
  console.log(`MariaDB starting on 127.0.0.1:${port} (pid ${child.pid}).`);
  console.log("Wait a few seconds, then run `npm run db:setup` if the database is new.");
} else if (action === "stop") {
  const r = spawnSync(mysqladmin, ["-u", "root", "-h", "127.0.0.1", "-P", port, "shutdown"], { stdio: "inherit" });
  process.exit(r.status ?? 0);
} else {
  console.log("Usage: node scripts/db.mjs [start|stop]");
}
