// Copia el núcleo de ffmpeg.wasm a public/ para auto-hospedarlo (sin CDN).
// Se ejecuta automáticamente en postinstall.
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "node_modules", "@ffmpeg", "core", "dist", "esm");
const dest = join(root, "public", "ffmpeg-core");

mkdirSync(dest, { recursive: true });
for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  cpSync(join(src, file), join(dest, file));
}
console.log(`ffmpeg-core copiado a ${dest}`);
