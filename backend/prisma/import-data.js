import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('prisma/mysql-export.json', 'utf-8'));

  for (const u of data.users) {
    await prisma.user.create({ data: u });
  }
  console.log(`Users imported: ${data.users.length}`);

  for (const c of data.catchReports) {
    await prisma.catchReport.create({ data: c });
  }
  console.log(`Catch reports imported: ${data.catchReports.length}`);

  for (const z of data.fishingZones) {
    await prisma.fishingZone.create({ data: z });
  }
  console.log(`Fishing zones imported: ${data.fishingZones.length}`);

  for (const m of data.marketPrices) {
    await prisma.marketPrice.create({ data: m });
  }
  console.log(`Market prices imported: ${data.marketPrices.length}`);

  for (const a of data.alerts) {
    await prisma.alert.create({ data: a });
  }
  console.log(`Alerts imported: ${data.alerts.length}`);

  for (const d of data.purchaseDeals) {
    await prisma.purchaseDeal.create({ data: d });
  }
  console.log(`Purchase deals imported: ${data.purchaseDeals.length}`);

  console.log('Import finished successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());