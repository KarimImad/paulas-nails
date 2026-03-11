import { chromium } from 'playwright';

const inputPath = '/Users/karimimad/Documents/paulas-nails/docs/dossier/dossier.html';
const outputPath = '/Users/karimimad/Documents/paulas-nails/docs/dossier/Dossier_Projet_Paulas_Nails.pdf';

const fileUrl = `file://${inputPath}`;

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(fileUrl, { waitUntil: 'load' });
await page.waitForTimeout(1000);

await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' },
});

await browser.close();
console.log('PDF generated:', outputPath);
