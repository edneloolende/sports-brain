import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logosDir = join(__dirname, '../public/logos')

const exports = [
  { file: 'logo-circle-800.svg',        out: 'sportygenius-circle-800.png',        width: 800,  height: 800  },
  { file: 'logo-square-800.svg',         out: 'sportygenius-square-800.png',         width: 800,  height: 800  },
  { file: 'logo-horizontal-lockup.svg',  out: 'sportygenius-horizontal-lockup.png',  width: 1200, height: 300  },
  { file: 'logo-icon-512.svg',           out: 'sportygenius-icon-512.png',           width: 512,  height: 512  },
  { file: 'logo-email-signature.svg',    out: 'sportygenius-email-signature.png',    width: 600,  height: 120  },
]

mkdirSync(join(logosDir, 'png'), { recursive: true })

for (const { file, out, width, height } of exports) {
  const svg = readFileSync(join(logosDir, file))
  await sharp(svg)
    .resize(width, height)
    .png()
    .toFile(join(logosDir, 'png', out))
  console.log(`✓ ${out}`)
}

console.log('\nAll PNGs exported to public/logos/png/')
