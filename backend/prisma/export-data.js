import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = {
    users: await prisma.user.findMany(),
    catchReports: await prisma.catchReport.findMany(),
    purchaseDeals: await prisma.purchaseDeal.findMany(),
    marketPrices: await prisma.marketPrice.findMany(),
    alerts: await prisma.alert.findMany(),
    fishingZones: await prisma.fishingZone.findMany(),
  };

  fs.writeFileSync('prisma/mysql-export.json', JSON.stringify(data, null, 2));
  console.log('Exported:', Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v.length])
  ));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());