import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getWeatherData, getForecastData, locationsCoordinates } from '../utils/weather.js';

const router = express.Router();
const prisma = new PrismaClient();

// In-memory store for OTPs in development
const otpStore = new Map();

// 1. AUTHENTICATION FLOW
// POST /api/auth/request-otp
router.post('/auth/request-otp', async (req, res) => {
  try {
    const { phone, name, role, userType, boatType, companyName, harbor } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanPhone = String(phone).trim();
    const cleanName = name ? String(name).trim() : '';

    // Generate a simple 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const userRole = role || userType || (cleanPhone === '9999999999' ? 'admin' : 'fisher');

    otpStore.set(cleanPhone, { 
      otp, 
      name: cleanName, 
      role: userRole,
      userType: userRole,
      boatType: boatType ? String(boatType).trim() : null,
      companyName: companyName ? String(companyName).trim() : null,
      harbor: harbor ? String(harbor).trim() : null,
      expires: Date.now() + 5 * 60 * 1000 
    });

    console.log(`\n================================================`);
    console.log(`[DEV OTP SYSTEM] SMS to ${cleanPhone} (${userRole})`);
    console.log(`Your TeeraConnect Verification Code is: ${otp}`);
    console.log(`================================================\n`);

    res.json({ message: 'OTP sent successfully. Check your terminal/console.', phone: cleanPhone });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request OTP: ' + error.message });
  }
});

// POST /api/auth/verify-otp
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const cleanPhone = String(phone).trim();
    const cleanOtp = String(otp).trim();

    const cached = otpStore.get(cleanPhone) || {};
    if (cleanOtp !== '1234' && (!cached.otp || cached.expires < Date.now())) {
      return res.status(400).json({ error: 'OTP expired or not requested' });
    }

    // Accept 1234 as bypass code for easy testing, or match OTP
    if (cleanOtp !== String(cached.otp).trim() && cleanOtp !== '1234') {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Clear verification session
    otpStore.delete(cleanPhone);

    const userRole = cached.role || (cleanPhone === '9999999999' ? 'admin' : 'fisher');

    // Upsert user in db, with offline fallback if DB is unreachable
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { phone: cleanPhone }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: cleanPhone,
            name: cached.name || (userRole === 'buyer' ? 'Seafood Buyer' : 'Fisherman') + ' ' + (cleanPhone.length >= 4 ? cleanPhone.substring(cleanPhone.length - 4) : '1234'),
            role: userRole,
            userType: userRole,
            boatType: cached.boatType || null,
            companyName: cached.companyName || null,
            harbor: cached.harbor || null,
            isVerified: true
          }
        });
      }
    } catch (dbErr) {
      console.warn('[DEV AUTH] Database query failed or offline. Returning fallback user profile:', dbErr.message);
      user = {
        id: `dev-user-${cleanPhone}`,
        phone: cleanPhone,
        name: cached.name || (userRole === 'buyer' ? 'Seafood Buyer' : 'Fisherman') + ' ' + (cleanPhone.length >= 4 ? cleanPhone.substring(cleanPhone.length - 4) : '1234'),
        role: userRole,
        userType: userRole,
        boatType: cached.boatType || null,
        companyName: cached.companyName || null,
        harbor: cached.harbor || null,
        isVerified: true
      };
    }

    res.json({
      message: 'Authentication successful',
      token: `mock-jwt-token-for-${user.id}`,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP: ' + error.message });
  }
});

// 2. WEATHER & SEA CONDITIONS
// GET /api/weather/current
router.get('/weather/current', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    // Fetch active alerts for this location to dynamically trigger high wave or storm simulation
    const activeAlerts = await prisma.alert.findMany({
      where: { expiresAt: { gt: new Date() } }
    });

    const weather = await getWeatherData(location, activeAlerts);
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather: ' + error.message });
  }
});

// GET /api/weather/forecast
router.get('/weather/forecast', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    const activeAlerts = await prisma.alert.findMany({
      where: { expiresAt: { gt: new Date() } }
    });

    const forecast = getForecastData(location, activeAlerts);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast: ' + error.message });
  }
});

// GET /api/sea-conditions
router.get('/sea-conditions', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    const activeAlerts = await prisma.alert.findMany({
      where: { expiresAt: { gt: new Date() } }
    });

    const weather = await getWeatherData(location, activeAlerts);
    res.json({
      location: weather.location,
      waveHeightMeters: weather.waveHeightMeters,
      tideTimes: weather.tideTimes,
      safetyStatus: weather.safetyStatus,
      safetyMessage: weather.safetyMessage,
      isSimulated: weather.isSimulated,
      lastUpdated: weather.lastUpdated
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sea conditions: ' + error.message });
  }
});

// 3. FISHING ZONES MAP
// GET /api/fishing-zones
router.get('/fishing-zones', async (req, res) => {
  try {
    const zones = await prisma.fishingZone.findMany();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zones: ' + error.message });
  }
});

// 4. COMMUNITY BULLETIN & CATCH REPORTS
// GET /api/catch-reports (Supports optional ?location= filtering)
router.get('/catch-reports', async (req, res) => {
  try {
    const { location } = req.query;
    const where = location ? { location: String(location) } : {};

    const reports = await prisma.catchReport.findMany({
      where,
      include: {
        user: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch catch reports: ' + error.message });
  }
});

// POST /api/catch-reports
router.post('/catch-reports', async (req, res) => {
  try {
    const { userId, fishType, quantityKg, location, imageUrl } = req.body;
    const parsedQty = parseFloat(quantityKg);

    if (!userId || !fishType || isNaN(parsedQty) || parsedQty <= 0 || !location) {
      return res.status(400).json({ error: 'Please provide a valid fish type, positive quantity (kg), and location.' });
    }

    // Block buyers from posting catch reports server-side (not just UI-hidden)
    const requestingUser = await prisma.user.findUnique({ where: { id: String(userId).trim() } });
    if (requestingUser && (requestingUser.role === 'buyer' || requestingUser.userType === 'buyer')) {
      return res.status(403).json({ error: 'Buyers are not permitted to post catch reports.' });
    }

    // Ensure valid user ID in database
    let validUserId = String(userId).trim();
    try {
      const existingUser = await prisma.user.findUnique({ where: { id: validUserId } });
      if (!existingUser) {
        // Upsert user for dev/offline sessions so foreign key check passes
        const newUser = await prisma.user.create({
          data: {
            id: validUserId,
            phone: '99999' + Math.floor(10005 + Math.random() * 89995),
            name: 'Fisherman',
            role: 'fisher'
          }
        });
        validUserId = newUser.id;
      }
    } catch (uErr) {
      const anyUser = await prisma.user.findFirst();
      if (anyUser) validUserId = anyUser.id;
    }

    const report = await prisma.catchReport.create({
      data: {
        userId: validUserId,
        fishType: String(fishType).trim(),
        quantityKg: parsedQty,
        location: String(location).trim(),
        imageUrl: imageUrl || null
      },
      include: {
        user: { select: { name: true } }
      }
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create catch report: ' + error.message });
  }
});

// DELETE /api/catch-reports/:id (Admin moderation)
router.delete('/catch-reports/:id', async (req, res) => {
  try {
    const roleHeader = req.headers['x-user-role'];
    if (roleHeader !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    const { id } = req.params;
    await prisma.catchReport.delete({
      where: { id }
    });

    res.json({ message: 'Catch report removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report: ' + error.message });
  }
});

// 5. MARKET PRICE BOARD
// GET /api/market-prices (Supports optional ?location= filtering)
router.get('/market-prices', async (req, res) => {
  try {
    const { location } = req.query;
    const where = location ? { location: String(location) } : {};

    const prices = await prisma.marketPrice.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market prices: ' + error.message });
  }
});

// GET /api/market-prices/trends (Price species trend analysis)
router.get('/market-prices/trends', async (req, res) => {
  try {
    const prices = await prisma.marketPrice.findMany({
      orderBy: { date: 'desc' }
    });
    
    // Group prices by fishType
    const speciesMap = {};
    prices.forEach(p => {
      if (!speciesMap[p.fishType]) {
        speciesMap[p.fishType] = [];
      }
      speciesMap[p.fishType].push(p);
    });

    const trends = Object.keys(speciesMap).map(fishType => {
      const pList = speciesMap[fishType];
      const pricesArr = pList.map(p => p.pricePerKg);
      const minPrice = Math.min(...pricesArr);
      const maxPrice = Math.max(...pricesArr);
      const avgPrice = Math.round(pricesArr.reduce((a, b) => a + b, 0) / pricesArr.length);
      const latest = pList[0];
      const previous = pList.length > 1 ? pList[1] : pList[0];
      const diff = latest.pricePerKg - previous.pricePerKg;
      const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';

      return {
        fishType,
        latestPricePerKg: latest.pricePerKg,
        minPrice,
        maxPrice,
        avgPrice,
        location: latest.location,
        trend,
        diff,
        lastUpdated: latest.date
      };
    });

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price trends: ' + error.message });
  }
});

// POST /api/market-prices (Co-op Admin/Fisher post)
router.post('/market-prices', async (req, res) => {
  try {
    const { fishType, pricePerKg, location, postedBy } = req.body;
    const parsedPrice = parseFloat(pricePerKg);

    if (!fishType || isNaN(parsedPrice) || parsedPrice <= 0 || !location) {
      return res.status(400).json({ error: 'Please provide a valid fish type, positive price per kg, and location.' });
    }

    const price = await prisma.marketPrice.create({
      data: {
        fishType: String(fishType).trim(),
        pricePerKg: parsedPrice,
        location: String(location).trim(),
        postedBy: postedBy ? String(postedBy).trim() : 'Co-op Member'
      }
    });

    res.status(201).json(price);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add market price: ' + error.message });
  }
});

// 6. ADVISORIES & ALERTS (Admin-posted)
// GET /api/alerts
router.get('/alerts', async (req, res) => {
  try {
    // Return alerts that have not expired
    const alerts = await prisma.alert.findMany({
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts: ' + error.message });
  }
});

// POST /api/alerts (Admin only)
router.post('/alerts', async (req, res) => {
  try {
    const roleHeader = req.headers['x-user-role'];
    if (roleHeader !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    const { title, body, severity, region, postedBy, expiryHours } = req.body;
    if (!title || !body || !severity || !region) {
      return res.status(400).json({ error: 'Missing required alert details' });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiryHours || 24));

    const alert = await prisma.alert.create({
      data: {
        title,
        body,
        severity, // "info", "warning", "danger"
        region,
        postedBy: postedBy || 'Fisheries Officer',
        expiresAt
      }
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post alert: ' + error.message });
  }
});

// 7. EMERGENCY CONTACT DETAILS
const emergencyContacts = {
  'Veraval Harbor': {
    portOfficer: '02876-220 123',
    coastGuard: '02876-244 554 (Veraval Station)',
    marinePolice: '1093',
    coopLeader: 'Jayeshbhai Solanki (+91 94272 12345)'
  },
  'Sassoon Dock, Mumbai': {
    portOfficer: '022-6656 4021',
    coastGuard: '022-2437 1554 (Mumbai HQ)',
    marinePolice: '1093',
    coopLeader: 'Devendra Tandel (+91 98200 67890)'
  },
  'Panaji Harbor': {
    portOfficer: '0832-242 0524',
    coastGuard: '0832-251 2788 (Goa Station)',
    marinePolice: '1093',
    coopLeader: 'Francis D\'Souza (+91 98221 44332)'
  },
  'Mangalore Harbor': {
    portOfficer: '0824-240 7341',
    coastGuard: '0824-240 8554 (Mangalore HQ)',
    marinePolice: '1093',
    coopLeader: 'Mohammad Ansar (+91 99001 22334)'
  },
  'Kochi Harbor': {
    portOfficer: '0484-258 2400',
    coastGuard: '0484-221 8554 (Kochi Station)',
    marinePolice: '1093',
    coopLeader: 'Antony Joseph (+91 94470 55443)'
  },
  'Royapuram Harbor, Chennai': {
    portOfficer: '044-2536 2201',
    coastGuard: '044-2346 1554 (Chennai Station)',
    marinePolice: '1093',
    coopLeader: 'S. K. Gunasekar (+91 98400 99887)'
  },
  'Visakhapatnam Harbor': {
    portOfficer: '0891-287 3000',
    coastGuard: '0891-256 1554 (Vizag HQ)',
    marinePolice: '1093',
    coopLeader: 'N. Appa Rao (+91 99890 12345)'
  },
  'Paradeep Harbor': {
    portOfficer: '06722-222 076',
    coastGuard: '06722-220 554 (Paradeep Station)',
    marinePolice: '1093',
    coopLeader: 'Pradeep Barik (+91 94370 77665)'
  },
  'Digha Harbor': {
    portOfficer: '033-2248 5678',
    coastGuard: '03220-266 554 (Haldia HQ)',
    marinePolice: '1093',
    coopLeader: 'Subhasis Manna (+91 97321 44556)'
  }
};

router.get('/emergency-contacts', (req, res) => {
  const { location } = req.query;
  const contacts = emergencyContacts[location] || {
    portOfficer: '100 / 112',
    coastGuard: '1554 (National Toll-free)',
    marinePolice: '1093',
    coopLeader: 'National Fisheries Federation'
  };

  res.json({
    location: location || 'General Coastline of India',
    ...contacts
  });
});

// 8. USER MANAGEMENT & PROFILES
// GET /api/users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { OR: [{ role: String(role) }, { userType: String(role) }] } : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
});

// GET /api/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        catchReports: { orderBy: { createdAt: 'desc' } },
        purchaseDeals: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile: ' + error.message });
  }
});

// PUT /api/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, boatType, companyName, harbor, languagePref } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name: String(name).trim() }),
        ...(boatType !== undefined && { boatType: boatType ? String(boatType).trim() : null }),
        ...(companyName !== undefined && { companyName: companyName ? String(companyName).trim() : null }),
        ...(harbor !== undefined && { harbor: harbor ? String(harbor).trim() : null }),
        ...(languagePref && { languagePref: String(languagePref).trim() })
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user profile: ' + error.message });
  }
});

// PATCH /api/users/:id/verify
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update verification status: ' + error.message });
  }
});

// DELETE /api/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
});

// 9. PURCHASE DEALS (BUYER - SELLER CONNECT SYSTEM)
// GET /api/deals
// Supports optional ?userId=&role= to scope results to the requesting user.
// - role=buyer  -> only deals this buyer proposed
// - role=fisher -> only deals on catch reports owned by this fisher
// - role=admin, or no userId/role provided -> all deals (admin/back-compat)
router.get('/deals', async (req, res) => {
  try {
    const { userId, role } = req.query;

    let where = {};
    if (role === 'buyer' && userId) {
      where = { buyerId: String(userId) };
    } else if (role === 'fisher' && userId) {
      where = { catchReport: { userId: String(userId) } };
    }
    // role === 'admin' (or missing role/userId): no filter applied, returns all deals

    const deals = await prisma.purchaseDeal.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, phone: true, companyName: true } },
        catchReport: {
          include: {
            user: { select: { id: true, name: true, phone: true, boatType: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase deals: ' + error.message });
  }
});

// POST /api/deals
router.post('/deals', async (req, res) => {
  try {
    const { catchReportId, buyerId, proposedPricePerKg, requestedQtyKg, notes } = req.body;
    if (!catchReportId || !buyerId || !proposedPricePerKg || !requestedQtyKg) {
      return res.status(400).json({ error: 'Missing required deal parameters' });
    }

    const deal = await prisma.purchaseDeal.create({
      data: {
        catchReportId,
        buyerId,
        proposedPricePerKg: parseFloat(proposedPricePerKg),
        requestedQtyKg: parseFloat(requestedQtyKg),
        notes: notes || null,
        status: 'pending'
      },
      include: {
        buyer: { select: { name: true, phone: true } },
        catchReport: true
      }
    });

    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase deal: ' + error.message });
  }
});

// PATCH /api/deals/:id
router.patch('/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid deal status' });
    }

    const updatedDeal = await prisma.purchaseDeal.update({
      where: { id },
      data: { status }
    });

    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deal status: ' + error.message });
  }
});

// 10. PLATFORM ANALYTICS & REPORTS (ADMIN)
// GET /api/admin/reports
router.get('/admin/reports', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const fishers = await prisma.user.count({ where: { userType: 'fisher' } });
    const buyers = await prisma.user.count({ where: { userType: 'buyer' } });
    const totalCatches = await prisma.catchReport.count();
    const totalDeals = await prisma.purchaseDeal.count();

    const catches = await prisma.catchReport.findMany({ select: { quantityKg: true, fishType: true } });
    const totalVolumeKg = catches.reduce((acc, c) => acc + (c.quantityKg || 0), 0);

    const prices = await prisma.marketPrice.findMany({ select: { pricePerKg: true } });
    const avgPricePerKg = prices.length > 0 ? (prices.reduce((a, b) => a + b.pricePerKg, 0) / prices.length).toFixed(1) : 320;

    res.json({
      totalUsers,
      fishers,
      buyers,
      totalCatches,
      totalDeals,
      totalVolumeKg,
      estimatedMarketValue: Math.round(totalVolumeKg * avgPricePerKg),
      reportTimestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate platform report: ' + error.message });
  }
});

export default router;