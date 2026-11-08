import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "public", "images");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "NepalTravelSiteBuilder/1.0 (https://nepaltravel.com; hello@nepaltravel.com)";
const force = process.argv.includes("--force");
const only = process.argv.find((arg) => arg.startsWith("--only="))?.split("=")[1]?.toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = [
  { file: "hero/hero.jpg", landscape: true, queries: ["Everest panorama Kala Patthar", "Khumbu glacier panorama", "Himalaya mountain range panorama"] },
  { file: "fallback/nepal.jpg", queries: ["Nepal Himalaya landscape", "Annapurna panorama Nepal", "Himalaya mountains Nepal"] },
  { file: "destinations/everest.jpg", queries: ["Mount Everest from Kala Patthar", "Everest north face Tibet", "Everest Khumbu icefall"] },
  { file: "destinations/everest-thumb.jpg", copyFrom: "destinations/everest.jpg" },
  { file: "destinations/annapurna.jpg", queries: ["Annapurna South", "Annapurna massif Nepal", "Annapurna Base Camp"] },
  { file: "destinations/pokhara.jpg", queries: ["Phewa Lake Pokhara", "Phewa Tal", "Pokhara lake"] },
  { file: "destinations/chitwan.jpg", queries: ["Chitwan National Park rhinoceros", "Chitwan National Park", "Greater one-horned rhinoceros Nepal"] },
  { file: "destinations/kathmandu.jpg", queries: ["Boudhanath stupa", "Kathmandu Swayambhunath", "Kathmandu Durbar Square"] },
  { file: "destinations/bhaktapur.jpg", queries: ["Bhaktapur Durbar Square", "Bhaktapur Nepal temple"] },
  { file: "destinations/lumbini.jpg", queries: ["Maya Devi Temple Lumbini", "Lumbini Nepal monastery", "Lumbini pillar"] },
  { file: "destinations/langtang.jpg", queries: ["Langtang valley", "Langtang National Park"] },
  { file: "destinations/manaslu.jpg", queries: ["Manaslu", "Manaslu Himal"] },
  { file: "destinations/mustang.jpg", queries: ["Upper Mustang Nepal", "Lo Manthang", "Mustang Nepal landscape"] },
  { file: "destinations/bandipur.jpg", queries: ["Bandipur Nepal", "Bandipur Tanahun"] },
  { file: "destinations/nagarkot.jpg", queries: ["Nagarkot Nepal", "Nagarkot sunrise Himalaya"] },
  { file: "destinations/rara.jpg", queries: ["Rara Lake", "Rara Lake Nepal"] },
  { file: "destinations/ilam.jpg", queries: ["Ilam Nepal tea garden", "Ilam tea estate"] },
  { file: "destinations/nepal-hills.jpg", queries: ["Nepal terraced fields", "Nepal hill village", "Nepal landscape hills"] },
  { file: "trips/ebc.jpg", queries: ["Everest Base Camp trek", "Khumbu glacier", "Gorakshep Everest"] },
  { file: "trips/everest-base-camp.jpg", queries: ["Kala Patthar Everest", "Everest Base Camp Nepal"] },
  { file: "trips/abc.jpg", queries: ["Annapurna Base Camp", "Annapurna Sanctuary"] },
  { file: "trips/circuit.jpg", queries: ["Thorong La", "Annapurna Circuit Nepal"] },
  { file: "trips/poonhill.jpg", queries: ["Poon Hill", "Ghorepani Nepal"] },
  { file: "trips/classic.jpg", queries: ["Kathmandu Durbar Square", "Kathmandu temple square"] },
  { file: "trips/heritage.jpg", queries: ["Patan Durbar Square", "Patan Nepal temple"] },
  { file: "trips/bhaktapur-nagarkot.jpg", queries: ["Nagarkot Nepal", "Bhaktapur Nepal"] },
  { file: "trips/chitwan-safari.jpg", queries: ["Chitwan safari", "Chitwan National Park elephant", "Chitwan jungle"] },
  { file: "trips/pokhara-adventure.jpg", queries: ["Paragliding Pokhara", "Pokhara Nepal adventure", "Phewa Lake"] },
  { file: "trips/mountain-flight.jpg", queries: ["Mountain flight Everest", "Yeti Airlines Nepal", "Himalaya aerial Nepal"] },
  { file: "trips/langtang.jpg", queries: ["Langtang trek", "Langtang valley Nepal"] },
  { file: "trips/manaslu.jpg", queries: ["Manaslu trek", "Manaslu Nepal"] },
  { file: "trips/mustang.jpg", queries: ["Upper Mustang", "Mustang Nepal"] },
  { file: "trips/bandipur.jpg", queries: ["Bandipur Nepal", "Bandipur bazaar"] },
  { file: "trips/lumbini.jpg", queries: ["Maya Devi Temple Lumbini", "Ashoka pillar Lumbini", "Lumbini sacred garden"] },
  { file: "trips/rara.jpg", queries: ["Rara Lake Nepal", "Rara national park"] },
  { file: "trips/ilam.jpg", queries: ["Ilam tea garden Nepal", "Ilam Nepal"] },
  { file: "stories/bhaktapur-pottery.jpg", queries: ["Bhaktapur potter wheel", "Pottery Nepal Bhaktapur", "Nepali potter"] },
  { file: "stories/chitwan-rhino.jpg", queries: ["Chitwan rhinoceros", "One-horned rhino Nepal"] },
  { file: "stories/everest-sunrise.jpg", queries: ["Everest sunrise", "Himalaya sunrise Nepal"] },
  { file: "stories/ghorepani.jpg", queries: ["Ghorepani", "Poon Hill sunrise"] },
  { file: "stories/mustang-desert.jpg", queries: ["Upper Mustang landscape", "Mustang desert Nepal"] },
  { file: "stories/pokhara-slow.jpg", queries: ["Phewa Lake boat", "Pokhara boats"] },
  { file: "stories/thorong-la.jpg", queries: ["Thorong La pass", "Thorong La"] },
  { file: "community/post-1.jpg", queries: ["Nepal trekking", "Nepal trekker Himalaya"] },
  { file: "community/post-2.jpg", queries: ["Nepal festival", "Indra Jatra Kathmandu"] },
  { file: "community/post-3.jpg", queries: ["Momo Nepal", "Nepali food"] },
  { file: "community/post-4.jpg", queries: ["Nepal mountains", "Himalaya Nepal"] },
];

function strip(html = "") {
  return html.replace(/<[^>]*>?/g, "").replace(/\s+/g, " ").trim();
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: "json", origin: "*" })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function findImage(queries, minRatio = 0) {
  for (const query of queries) {
    let data;
    try {
      data = await api({
        action: "query",
        generator: "search",
        gsrsearch: `${query} filetype:bitmap`,
        gsrnamespace: "6",
        gsrlimit: "12",
        gsrsort: "relevance",
        prop: "imageinfo",
        iiprop: "url|mime|size|extmetadata",
        iiurlwidth: "1600",
      });
    } catch (error) {
      console.warn(`  search failed: ${error.message}`);
      continue;
    }
    const pages = Object.values(data?.query?.pages ?? {});
    const candidates = pages
      .map((page) => ({ ...(page.imageinfo?.[0] ?? {}), title: page.title }))
      .filter(
        (image) =>
          image &&
          image.mime === "image/jpeg" &&
          image.width >= 1000 &&
          image.width / image.height >= minRatio &&
          !/map|logo|diagram|chart|stamp|coin|book|poster|document|signature|portrait of/i.test(image.title)
      );
    if (!candidates.length) continue;

    const ratio = (image) => image.width / image.height;
    candidates.sort((a, b) => {
      const score = (image) => (ratio(image) >= 1.15 && ratio(image) <= 2.8 ? 0 : 1);
      return score(a) - score(b) || b.width - a.width;
    });
    return candidates[0];
  }
  return null;
}

async function getByTitle(title) {
  const data = await api({
    action: "query",
    titles: `File:${title}`,
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: "1600",
  });
  const page = Object.values(data?.query?.pages ?? {})[0];
  const image = page?.imageinfo?.[0];
  if (!image || image.mime !== "image/jpeg") return null;
  return { ...image, title: page.title };
}

async function download(url, destination, attempt = 1) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    if (attempt < 3) {
      await sleep(800 * attempt);
      return download(url, destination, attempt + 1);
    }
    throw new Error(`download ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 20_000) throw new Error("file too small");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, buffer);
}

const credits = [];
let downloaded = 0;
let skipped = 0;
const failures = [];

for (const target of targets) {
  if (only && !target.file.toLowerCase().includes(only)) continue;
  const destination = path.join(ROOT, target.file);
  if (!force && fs.existsSync(destination) && fs.statSync(destination).size > 20_000) {
    skipped++;
    continue;
  }
  if (target.copyFrom) {
    const source = path.join(ROOT, target.copyFrom);
    if (fs.existsSync(source)) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
      downloaded++;
      console.log(`copied ${target.file}`);
      continue;
    }
    failures.push(`${target.file}: source missing`);
    continue;
  }
  process.stdout.write(`fetching ${target.file} … `);
  try {
    const image = (target.title ? await getByTitle(target.title) : null) ?? (await findImage(target.queries, target.landscape ? 1.6 : 0));
    if (!image) throw new Error("no suitable image found");
    await download(image.thumburl || image.url, destination);
    const meta = image.extmetadata ?? {};
    credits.push({
      file: target.file,
      title: strip(image.title),
      page: image.descriptionurl,
      author: strip(meta.Artist?.value ?? "Unknown"),
      license: strip(meta.LicenseShortName?.value ?? "See source"),
    });
    downloaded++;
    console.log("ok");
  } catch (error) {
    failures.push(`${target.file}: ${error.message}`);
    console.log(`FAILED (${error.message})`);
  }
  await sleep(250);
}

if (credits.length) {
  const lines = [
    "# Image credits",
    "",
    "Photography sourced from Wikimedia Commons. Each file is used under the licence noted below.",
    "If you replace an image, update this file.",
    "",
    ...credits.map(
      (credit) =>
        `## ${credit.file}\n- **Source:** [${credit.title}](${credit.page})\n- **Author:** ${credit.author}\n- **Licence:** ${credit.license}\n`
    ),
  ];
  const creditPath = path.join(ROOT, "ATTRIBUTIONS.md");
  const existing = fs.existsSync(creditPath) ? fs.readFileSync(creditPath, "utf8").replace(/^[\s\S]*?## /, "## ") : "";
  fs.writeFileSync(creditPath, lines.join("\n") + (existing ? `\n## Previously downloaded\n${existing}` : ""));
}

console.log(`\nDownloaded ${downloaded}, skipped ${skipped}, failed ${failures.length}.`);
if (failures.length) {
  console.log(failures.join("\n"));
  process.exitCode = 1;
}
