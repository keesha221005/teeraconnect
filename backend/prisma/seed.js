import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.catchReport.deleteMany({});
  await prisma.marketPrice.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.fishingZone.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Users (Fishers, Buyers, Admin)
  const fisherUser = await prisma.user.create({
    data: {
      phone: '9876543210',
      name: 'Ramesh Gowda',
      languagePref: 'kn',
      role: 'fisher',
      userType: 'fisher',
      boatType: 'Mechanized Trawler',
      harbor: 'Mangalore Harbor',
      isVerified: true
    }
  });

  const buyerUser = await prisma.user.create({
    data: {
      phone: '9888877777',
      name: 'Vikram Sethi',
      companyName: 'Konkan Seafood Exports',
      languagePref: 'en',
      role: 'buyer',
      userType: 'buyer',
      harbor: 'Sassoon Dock, Mumbai',
      isVerified: true
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      phone: '9999999999',
      name: 'Co-op Admin',
      languagePref: 'en',
      role: 'admin',
      userType: 'admin',
      harbor: 'Mangalore Harbor',
      isVerified: true
    }
  });

  console.log('Users seeded:', { fisherUser, buyerUser, adminUser });

  // 2. Seed Fishing Zones (Locations across India)
  const zones = [
    // Gujarat - Veraval
    { name: 'Veraval Coast - Zone 1', lat: 20.85, lng: 70.32, status: 'safe', notes: 'Clear water, moderate current. Excellent for Sardines.' },
    { name: 'Veraval Deep Sea - Zone 2', lat: 20.70, lng: 70.25, status: 'warning', notes: 'Slightly high wave heights expected. Caution advised.' },
    // Maharashtra - Mumbai
    { name: 'Sassoon Dock - Outer Channel', lat: 18.88, lng: 72.78, status: 'safe', notes: 'Active zone, clear weather. Pomfret sightings reported.' },
    { name: 'Alibaug Coast Zone', lat: 18.65, lng: 72.82, status: 'safe', notes: 'Safe coastal fishing. Low waves.' },
    // Goa - Panaji
    { name: 'Mormugao Bay Zone', lat: 15.42, lng: 73.78, status: 'safe', notes: 'Calm water conditions. Good for Mackerel.' },
    // Karnataka - Mangalore
    { name: 'Mangalore Outer Reef', lat: 12.82, lng: 74.78, status: 'safe', notes: 'Excellent visibility. High catch concentration.' },
    { name: 'Ullal Shore Zone', lat: 12.80, lng: 74.82, status: 'safe', notes: 'Calm water, safe for small vessels.' },
    // Kerala - Kochi
    { name: 'Kochi Channel Outer', lat: 9.95, lng: 76.18, status: 'warning', notes: 'Increased wave swell. Fishers advised to keep safety gear ready.' },
    { name: 'Fort Kochi Shore Zone', lat: 9.97, lng: 76.22, status: 'safe', notes: 'Calm, ideal for country boats.' },
    // Tamil Nadu - Chennai
    { name: 'Royapuram Deep Reef', lat: 13.15, lng: 80.35, status: 'danger', notes: 'Storm swell. Wave height > 3m. DO NOT VENTURE OUT.' },
    { name: 'Marina Coastal Strip', lat: 13.04, lng: 80.30, status: 'warning', notes: 'Choppy seas. Caution recommended.' },
    // Andhra Pradesh - Visakhapatnam
    { name: 'Vizag Outer Harbour', lat: 17.65, lng: 83.35, status: 'safe', notes: 'Good wind alignment. Moderate wave height.' },
    { name: 'Bheemili Coast Zone', lat: 17.88, lng: 83.45, status: 'safe', notes: 'Clear water, moderate current.' },
    // Odisha - Paradeep
    { name: 'Paradeep Offshore Zone', lat: 20.20, lng: 86.75, status: 'danger', notes: 'Cyclone advisory active. High wind speeds. Keep to harbor.' },
    // West Bengal - Digha
    { name: 'Digha Coastal waters', lat: 21.58, lng: 87.48, status: 'warning', notes: 'Heavy rainfall alert. Sea conditions moderately rough.' }
  ];

  for (const zone of zones) {
    await prisma.fishingZone.create({ data: zone });
  }
  console.log('Fishing Zones seeded.');

  // 3. Seed Market Prices for different harbors
  // 3. Seed Market Prices for different harbors
  const basePrices = [
    { fishType: 'Mackerel (Bangda)', pricePerKg: 180, location: 'Mangalore Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Kingfish (Surmai)', pricePerKg: 550, location: 'Mangalore Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Sardine (Tarli)', pricePerKg: 120, location: 'Mangalore Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Mackerel (Bangda)', pricePerKg: 200, location: 'Sassoon Dock, Mumbai', postedBy: 'Co-op Admin' },
    { fishType: 'Pomfret (White)', pricePerKg: 650, location: 'Sassoon Dock, Mumbai', postedBy: 'Co-op Admin' },
    { fishType: 'Pomfret (White)', pricePerKg: 600, location: 'Panaji Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Kingfish (Surmai)', pricePerKg: 520, location: 'Panaji Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Prawns (Medium)', pricePerKg: 380, location: 'Veraval Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Lobster (Rock)', pricePerKg: 1200, location: 'Veraval Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Sardine (Tarli)', pricePerKg: 110, location: 'Kochi Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Prawns (Tiger)', pricePerKg: 480, location: 'Kochi Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Kingfish (Surmai)', pricePerKg: 580, location: 'Royapuram Harbor, Chennai', postedBy: 'Co-op Admin' },
    { fishType: 'Red Snapper', pricePerKg: 420, location: 'Royapuram Harbor, Chennai', postedBy: 'Co-op Admin' },
    { fishType: 'Tuna (Yellowfin)', pricePerKg: 280, location: 'Visakhapatnam Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Ribbon Fish', pricePerKg: 160, location: 'Visakhapatnam Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Crab (Sea)', pricePerKg: 320, location: 'Paradeep Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Pomfret (Black)', pricePerKg: 490, location: 'Paradeep Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Hilsa (Ilish)', pricePerKg: 800, location: 'Digha Harbor', postedBy: 'Co-op Admin' },
    { fishType: 'Prawns (Small)', pricePerKg: 260, location: 'Digha Harbor', postedBy: 'Co-op Admin' }
  ];

  for (const price of basePrices) {
    await prisma.marketPrice.create({ data: price });
  }
  console.log('Market Prices seeded.');

  // 4. Seed Catch Reports across ALL harbors
  const catchReports = [
    { userId: fisherUser.id, fishType: 'Prawns (Medium)', quantityKg: 85, location: 'Veraval Harbor', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Pomfret (White)', quantityKg: 30, location: 'Sassoon Dock, Mumbai', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Mackerel (Bangda)', quantityKg: 75, location: 'Panaji Harbor', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Mackerel (Bangda)', quantityKg: 120, location: 'Mangalore Harbor', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Kingfish (Surmai)', quantityKg: 45, location: 'Mangalore Harbor', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Sardine (Tarli)', quantityKg: 210, location: 'Kochi Harbor', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Red Snapper', quantityKg: 50, location: 'Royapuram Harbor, Chennai', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Tuna (Yellowfin)', quantityKg: 95, location: 'Visakhapatnam Harbor', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Crab (Sea)', quantityKg: 40, location: 'Paradeep Harbor', imageUrl: null },
    { userId: fisherUser.id, fishType: 'Hilsa (Ilish)', quantityKg: 65, location: 'Digha Harbor', imageUrl: null }
  ];

  for (const report of catchReports) {
    await prisma.catchReport.create({ data: report });
  }
  console.log('Catch Reports seeded.');

  // 5. Seed Alerts (Advisories)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);

  const alerts = [
    {
      title: 'High Wave Advisory',
      body: 'Swell waves of 2.0 to 2.8 meters are expected along the Kerala coast from Fort Kochi to Vizhinjam. Small fishing vessels are advised to operate with caution.',
      severity: 'warning',
      region: 'Kochi Harbor',
      postedBy: 'Co-op Admin',
      expiresAt: tomorrow
    },
    {
      title: 'Cyclone Warning - Deep Depression',
      body: 'A deep depression in the Bay of Bengal is heading Northwest. Heavy rain and winds gusting up to 45 knots expected. Fishing operations suspended in Chennai and Visakhapatnam.',
      severity: 'danger',
      region: 'Royapuram Harbor, Chennai',
      postedBy: 'Government Fisheries Dept',
      expiresAt: tomorrow
    },
    {
      title: 'Cyclone Warning - Deep Depression',
      body: 'A deep depression in the Bay of Bengal is heading Northwest. Heavy rain and winds gusting up to 45 knots expected. Fishing operations suspended in Chennai and Visakhapatnam.',
      severity: 'danger',
      region: 'Visakhapatnam Harbor',
      postedBy: 'Government Fisheries Dept',
      expiresAt: tomorrow
    },
    {
      title: 'Monsoon Fishing Ban Notice',
      body: 'Annual mechanized fishing ban is in force. Traditional non-motorized boats are exempt but must monitor daily weather reports before sailing.',
      severity: 'info',
      region: 'Panaji Harbor',
      postedBy: 'Goa Directorate of Fisheries',
      expiresAt: tomorrow
    },
    {
      title: 'Rough Sea Advisory',
      body: 'High wave warning and heavy winds up to 35 knots. Fishers are advised to stay near the shoreline and not venture into deep seas.',
      severity: 'warning',
      region: 'Digha Harbor',
      postedBy: 'West Bengal Disaster Management',
      expiresAt: tomorrow
    }
  ];

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }
  console.log('Alerts seeded.');

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
