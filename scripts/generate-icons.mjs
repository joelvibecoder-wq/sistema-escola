import sharp from "sharp";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..","public");
const svg=await readFile(path.join(dir,"icon.svg"));
// Arquivos antigos para compatibilidade; nomes novos forçam atualização do PWA instalado.
const outputs=[
  [192,"icon-192.png"],
  [512,"icon-512.png"],
  [180,"icon-urna-3d-180.png"],
  [192,"icon-urna-3d-192.png"],
  [512,"icon-urna-3d-512.png"],
];
for(const [size,name] of outputs){
  await sharp(svg).resize(size,size).png().toFile(path.join(dir,name));
}
console.log("Kennedy Vota: ícones da urna 3D para PWA (192, 512) e iOS (180) gerados.");
