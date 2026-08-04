import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:5175/__preview-gantt', { waitUntil: 'networkidle' });
await page.waitForSelector('.gantt_grid', { timeout: 15000 });
await page.waitForTimeout(500);

console.log('--- Loaded at 1400px ---');
let sidebarBox = await page.locator('aside').first().boundingBox();
let gridDataBox = await page.locator('.gantt_grid_data').first().boundingBox();
console.log('sidebar:', JSON.stringify(sidebarBox), 'gridData:', JSON.stringify(gridDataBox));

// Now LIVE resize the viewport down, in steps, like a user dragging the
// browser window narrower — without reloading the page.
for (const w of [1200, 1000, 800, 700, 600]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(400);
  sidebarBox = await page.locator('aside').first().boundingBox().catch(() => null);
  gridDataBox = await page.locator('.gantt_grid_data').first().boundingBox().catch(() => null);
  const sidebarRight = sidebarBox ? sidebarBox.x + sidebarBox.width : null;
  const overlap = sidebarBox && gridDataBox ? gridDataBox.x < sidebarRight : null;
  console.log(`--- resized live to ${w}px ---`);
  console.log('sidebar:', JSON.stringify(sidebarBox));
  console.log('gridData:', JSON.stringify(gridDataBox));
  console.log('sidebarRight:', sidebarRight, 'OVERLAP:', overlap);
  await page.screenshot({ path: `C:/Users/MSI-1/AppData/Local/Temp/claude/c--Projects-WorKXKloud/5edbe4dc-5662-4c5b-9219-ec6d28628e4e/scratchpad/liveresize-${w}.png` });
}

await browser.close();
