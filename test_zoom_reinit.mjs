import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto('http://localhost:5175/__preview-gantt', { waitUntil: 'networkidle' });
await page.waitForSelector('.gantt_grid', { timeout: 15000 });
await page.waitForTimeout(500);

async function check(label) {
  const sidebarBox = await page.locator('aside').first().boundingBox().catch(() => null);
  const gridDataBox = await page.locator('.gantt_grid_data').first().boundingBox().catch(() => null);
  const gridDataCount = await page.locator('.gantt_grid_data').count();
  const sidebarRight = sidebarBox ? sidebarBox.x + sidebarBox.width : null;
  const overlap = sidebarBox && gridDataBox ? gridDataBox.x < sidebarRight : null;
  console.log(`${label}: gridDataCount=${gridDataCount} gridData=${JSON.stringify(gridDataBox)} sidebarRight=${sidebarRight} OVERLAP=${overlap}`);
}

await check('initial (Day)');

// Click Month, then Year, then back to Day — repeated re-inits
await page.getByText('Month', { exact: true }).click();
await page.waitForTimeout(400);
await check('after Month click');

await page.getByText('Year', { exact: true }).click();
await page.waitForTimeout(400);
await check('after Year click');

await page.getByText('Day', { exact: true }).click();
await page.waitForTimeout(400);
await check('after Day click (back)');

// Toggle Critical path checkbox too
await page.locator('label', { hasText: 'Critical path' }).locator('input[type="checkbox"]').click();
await page.waitForTimeout(400);
await check('after Critical path toggle');

// Now, AFTER all that re-init churn, do a resize-drag — this is the
// combination the user's screenshot suggests: zoom around, then resize.
const gridRect = await page.evaluate(() => document.querySelector('.gantt_grid')?.getBoundingClientRect());
if (gridRect) {
  await page.mouse.move(gridRect.right - 4, gridRect.y + 80);
  await page.mouse.down();
  await page.mouse.move(gridRect.x + 30, gridRect.y + 80, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  await check('after resize-drag post-zoom-churn');
}

await page.screenshot({ path: 'C:/Users/MSI-1/AppData/Local/Temp/claude/c--Projects-WorKXKloud/5edbe4dc-5662-4c5b-9219-ec6d28628e4e/scratchpad/reinit-final.png' });

await browser.close();
