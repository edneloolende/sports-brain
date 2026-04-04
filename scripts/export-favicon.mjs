import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appDir = resolve(__dirname, '../app')

// Base SVG scaled to 512×512 for high-quality downsampling
const svgSrc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <circle cx="256" cy="256" r="256" fill="#000000"/>
  <rect x="64" y="128" width="384" height="256" rx="32" fill="rgba(255,255,255,0.05)" stroke="#16a34a" stroke-width="20"/>
  <line x1="256" y1="148" x2="256" y2="364" stroke="rgba(255,255,255,0.18)" stroke-width="10"/>
  <text x="168" y="335" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="200" fill="#ffffff">S</text>
  <text x="344" y="335" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="200" fill="#4ade80">G</text>
</svg>`

const svgBuffer = Buffer.from(svgSrc)

const exports = [
  // apple-icon.png — 180×180, used for iOS home screen
  { file: `${appDir}/apple-icon.png`, size: 180 },
  // icon.png — 32×32, fallback favicon for older browsers
  { file: `${appDir}/icon.png`, size: 32 },
]

for (const { file, size } of exports) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(file)
  console.log(`✓ ${size}×${size} → ${file.split('/').slice(-2).join('/')}`)
}

console.log('\nFavicon PNGs exported.')
