/**
 * Regenerates the static link-preview images.
 *   npm run og        →  src/app/opengraph-image.jpg + twitter-image.jpg (+ .alt.txt)
 * Re-run after changing scripts/og/card.tsx, the hero photo or brand assets.
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import renderCard, { alt } from "./card";

async function main() {
  const res = await renderCard();
  const png = Buffer.from(await res.arrayBuffer());
  const jpg = await sharp(png).jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
  for (const name of ["opengraph-image", "twitter-image"]) {
    await writeFile(`src/app/${name}.jpg`, jpg);
    await writeFile(`src/app/${name}.alt.txt`, alt);
  }
  console.log(`OG image: ${(jpg.length / 1024).toFixed(0)} KB (PNG would be ${(png.length / 1024).toFixed(0)} KB)`);
}
main().catch((e) => { console.error(e); process.exit(1); });
