import { chromium } from 'playwright';

const browser = await chromium.launch();
const widths = [480, 700, 768, 900, 1024, 1200];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto('http://localhost:5175/__preview-gantt', { waitUntil: 'networkidle' });
  await page.waitForSelector('.gantt_grid', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(400);

  const sidebarBox = await page.locator('aside').first().boundingBox().catch(() => null);
  const gridDataBox = await page.locator('.gantt_grid_data').first().boundingBox().catch(() => null);

  console.log(`\n=== width ${width} ===`);
  console.log('sidebar:', JSON.stringify(sidebarBox));
  console.log('gantt_grid_data:', JSON.stringify(gridDataBox));

  if (sidebarBox && gridDataBox) {
    const sidebarRight = sidebarBox.x + sidebarBox.width;
    const overlapsLeft = gridDataBox.x < sidebarRight;
    console.log('sidebarRight:', sidebarRight, 'gridData.x:', gridDataBox.x, 'OVERLAP:', overlapsLeft);
  }

  await page.screenshot({ path: `C:/Users/MSI-1/AppData/Local/Temp/claude/c--Projects-WorKXKloud/5edbe4dc-5662-4c5b-9219-ec6d28628e4e/scratchpad/narrow-${width}.png` });

  // Now try a resize-drag at this width too
  const gridRect = await page.evaluate(() => document.querySelector('.gantt_grid')?.getBoundingClientRect());
  if (gridRect) {
    await page.mouse.move(gridRect.right - 4, gridRect.y + 80);
    await page.mouse.down();
    await page.mouse.move(gridRect.x + 20, gridRect.y + 80, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const sidebarBox2 = await page.locator('aside').first().boundingBox().catch(() => null);
    const gridDataBox2 = await page.locator('.gantt_grid_data').first().boundingBox().catch(() => null);
    if (sidebarBox2 && gridDataBox2) {
      const sidebarRight2 = sidebarBox2.x + sidebarBox2.width;
      const overlapsLeft2 = gridDataBox2.x < sidebarRight2;
      console.log('AFTER DRAG sidebarRight:', sidebarRight2, 'gridData.x:', gridDataBox2.x, 'OVERLAP:', overlapsLeft2);
    }
    await page.screenshot({ path: `C:/Users/MSI-1/AppData/Local/Temp/claude/c--Projects-WorKXKloud/5edbe4dc-5662-4c5b-9219-ec6d28628e4e/scratchpad/narrow-${width}-afterdrag.png` });
  }

  await page.close();
}

await browser.close();
