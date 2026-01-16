/**
 * Script to generate OpenSCAD parameter files for all phone models
 * Run with: npx tsx scripts/generate-openscad-params.ts
 */

import { PHONE_MODELS } from '../src/lib/types'
import { generateOpenScadParams, getOpenScadFilename } from '../src/lib/openscad-generator'
import * as fs from 'fs'
import * as path from 'path'

const outputDir = path.join(__dirname, '../../openscad-params')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

console.log(`Generating OpenSCAD parameter files for ${PHONE_MODELS.length} phone models...`)
console.log(`Output directory: ${outputDir}\n`)

for (const model of PHONE_MODELS) {
  const filename = getOpenScadFilename(model)
  const content = generateOpenScadParams(model)
  const filepath = path.join(outputDir, filename)
  fs.writeFileSync(filepath, content)
  console.log(`✓ ${filename} (${model.brand} ${model.name})`)
}

console.log(`\n✅ Done! Generated ${PHONE_MODELS.length} parameter files.`)
console.log(`\nTo use with OpenSCAD:`)
console.log(`1. Open Phone_cover_base.scad`)
console.log(`2. Change the include line to use your desired phone model:`)
console.log(`   include <openscad-params/iphone-16-pro-max_param.scad>`)
