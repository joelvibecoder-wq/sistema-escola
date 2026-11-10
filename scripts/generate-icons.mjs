import sharp from "sharp";import {readFile} from "node:fs/promises";import {fileURLToPath} from "node:url";import path from "node:path";
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..","public");
const svg=await readFile(path.join(dir,"icon.svg"));
for(const size of [192,512]){await sharp(svg).resize(size,size).png().toFile(path.join(dir,"icon-"+size+".png"));}
console.log("Ícones PWA 192 e 512 gerados");
