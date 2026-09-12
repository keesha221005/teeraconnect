import axios from 'axios';

// Coordinates for Indian harbors
export const locationsCoordinates = {
  'Veraval Harbor': { lat: 20.9018, lng: 70.3683 },
  'Sassoon Dock, Mumbai': { lat: 18.9103, lng: 72.8182 },
  'Panaji Harbor': { lat: 15.5002, lng: 73.8242 },
  'Mangalore Harbor': { lat: 12.8732, lng: 74.8340 },
  'Kochi Harbor': { lat: 9.9674, lng: 76.2427 },
  'Royapuram Harbor, Chennai': { lat: 13.1114, lng: 80.2974 },
  'Visakhapatnam Harbor': { lat: 17.6896, lng: 83.2986 },
  'Paradeep Harbor': { lat: 20.2608, lng: 86.6669 },
  'Digha Harbor': { lat: 21.6244, lng: 87.5098 }
};

// Default coordinates if not found (centered off Indian coast)
const defaultCoords = { lat: 12.8732, lng: 74.8340 };

export async function getWeatherData(locationName, activeAlerts = []) {
  const coords = locationsCoordinates[locationName] || defaultCoords;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Check if we should simulate rough weather due to existing DB alerts for this location
  const hasDangerAlert = activeAlerts.some(
    a => a.severity === 'danger' && a.region.toLowerCase().includes(locationName.toLowerCase().split(',')[0].trim().toLowerCase())
  );
  const hasWarningAlert = activeAlerts.some(
    a => a.severity === 'warning' && a.region.toLowerCase().includes(locationName.toLowerCase().split(',')[0].trim().toLowerCase())
  );

  let responseData = {
    location: locationName,
    lat: coords.lat,
    lng: coords.lng,
    isSimulated: true,
    temp: 29,
    tempMin: 26,
    tempMax: 32,
    windSpeedKnots: 10,
    windDirection: 210, // SSW
    humidity: 78,
    rainChance: 20,
    weatherCondition: 'Partly Cloudy', // Sunny, Cloudy, Rainy, Stormy
    waveHeightMeters: 0.8,
    tideTimes: [
      { type: 'High', time: '08:45 AM', height: '1.6m' },
      { type: 'Low', time: '02:30 PM', height: '0.4m' },
      { type: 'High', time: '09:15 PM', height: '1.8m' }
    ],
    safetyStatus: 'safe', // safe, caution, danger
    safetyMessage: 'Safe to go out. Clear skies and mild waves.',
    lastUpdated: new Date().toISOString()
  };

  // Adjust mock data to match active alerts if any
  if (hasDangerAlert) {
    responseData.temp = 25;
    responseData.tempMin = 23;
    responseData.tempMax = 27;
    responseData.windSpeedKnots = 28;
    responseData.windDirection = 90; // East (offshore/cyclone)
    responseData.humidity = 95;
    responseData.rainChance = 90;
    responseData.weatherCondition = 'Stormy';
    responseData.waveHeightMeters = 3.5;
    responseData.safetyStatus = 'danger';
    responseData.safetyMessage = 'DANGER: Storm/Cyclone Warning. DO NOT venture into sea.';
  } else if (hasWarningAlert) {
    responseData.temp = 27;
    responseData.tempMin = 25;
    responseData.tempMax = 29;
    responseData.windSpeedKnots = 19;
    responseData.windDirection = 240; // WSW
    responseData.humidity = 88;
    responseData.rainChance = 60;
    responseData.weatherCondition = 'Rainy';
    responseData.waveHeightMeters = 2.2;
    responseData.safetyStatus = 'caution';
    responseData.safetyMessage = 'CAUTION: Heavy winds and high swells expected. Operates with care.';
  } else {
    // Normal fluctuations based on harbor coordinates (e.g. northern harbors are slightly warmer or colder, or random noise)
    const seed = locationName.charCodeAt(0) + locationName.charCodeAt(locationName.length - 1);
    const waveNoise = (seed % 10) / 10; // 0.0 to 0.9
    responseData.waveHeightMeters = parseFloat((0.6 + waveNoise).toFixed(1));
    responseData.windSpeedKnots = 6 + (seed % 12); // 6 to 17 knots
    responseData.temp = 28 + (seed % 5) - 2; // 26 to 31
    responseData.tempMin = responseData.temp - 3;
    responseData.tempMax = responseData.temp + 4;
    responseData.humidity = 70 + (seed % 20); // 70 to 90
    responseData.rainChance = (seed % 6) * 15; // 0 to 90%
    if (responseData.rainChance > 70) {
      responseData.weatherCondition = 'Rainy';
    } else if (responseData.rainChance > 40) {
      responseData.weatherCondition = 'Cloudy';
    } else {
      responseData.weatherCondition = 'Sunny';
    }

    // Determine safety status
    if (responseData.windSpeedKnots > 22 || responseData.waveHeightMeters > 2.5) {
      responseData.safetyStatus = 'danger';
      responseData.safetyMessage = 'DANGER: Very rough sea. Keep to harbor.';
    } else if (responseData.windSpeedKnots >= 15 || responseData.waveHeightMeters >= 1.5) {
      responseData.safetyStatus = 'caution';
      responseData.safetyMessage = 'CAUTION: Moderate waves and strong winds.';
    } else {
      responseData.safetyStatus = 'safe';
      responseData.safetyMessage = 'Safe to go out. Clear skies and mild waves.';
    }
  }

  // If OpenWeatherMap API key is active, try to fetch real data for temperatures, wind, humidity, weather type
  if (apiKey && apiKey.trim().length > 0) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${apiKey}&units=metric`;
      const apiRes = await axios.get(url);
      if (apiRes.data) {
        const d = apiRes.data;
        responseData.isSimulated = false;
        responseData.temp = Math.round(d.main.temp);
        responseData.tempMin = Math.round(d.main.temp_min);
        responseData.tempMax = Math.round(d.main.temp_max);
        responseData.humidity = d.main.humidity;
        // Convert wind speed from m/s to Knots (1 m/s = 1.94384 knots)
        responseData.windSpeedKnots = parseFloat((d.wind.speed * 1.94384).toFixed(1));
        responseData.windDirection = d.wind.deg || 0;
        
        // Map OpenWeather weather conditions
        const mainWeather = d.weather && d.weather[0] ? d.weather[0].main : 'Clear';
        if (mainWeather === 'Thunderstorm' || mainWeather === 'Extreme') {
          responseData.weatherCondition = 'Stormy';
        } else if (mainWeather === 'Rain' || mainWeather === 'Drizzle') {
          responseData.weatherCondition = 'Rainy';
        } else if (mainWeather === 'Clouds') {
          responseData.weatherCondition = 'Cloudy';
        } else {
          responseData.weatherCondition = 'Sunny';
        }

        // We still simulate wave height and tide since OpenWeatherMap doesn't offer wave/tide data in free tier
        // Adjust safety based on real OpenWeather wind speed
        if (responseData.windSpeedKnots > 22 || responseData.waveHeightMeters > 2.5) {
          responseData.safetyStatus = 'danger';
          responseData.safetyMessage = 'DANGER: Heavy winds detected. Operations suspended.';
        } else if (responseData.windSpeedKnots >= 15 || responseData.waveHeightMeters >= 1.5) {
          responseData.safetyStatus = 'caution';
          responseData.safetyMessage = 'CAUTION: Choppy waters and fresh breeze.';
        } else {
          responseData.safetyStatus = 'safe';
          responseData.safetyMessage = 'Safe to go out. Clear skies and mild waves.';
        }
      }
    } catch (err) {
      console.warn(`Weather API request failed, falling back to simulated data. Error: ${err.message}`);
      // Fallback is already constructed in responseData
    }
  }

  return responseData;
}

export function getForecastData(locationName, activeAlerts = []) {
  const coords = locationsCoordinates[locationName] || defaultCoords;
  const seed = locationName.charCodeAt(0) + locationName.charCodeAt(locationName.length - 1);
  const forecast = [];

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const baseDay = new Date();

  // Generate 7-day forecast
  for (let i = 0; i < 7; i++) {
    const forecastDay = new Date();
    forecastDay.setDate(baseDay.getDate() + i);
    const dayName = weekdays[forecastDay.getDay()];
    
    // Create daily shifts
    const daySeed = seed + i;
    const temp = 28 + (daySeed % 4) - 1;
    const tempMin = temp - 3;
    const tempMax = temp + 3;
    const windSpeed = 8 + (daySeed % 12);
    const waveHeight = parseFloat((0.5 + ((daySeed % 8) / 5)).toFixed(1));
    const rainChance = (daySeed % 5) * 20; // 0, 20, 40, 60, 80, 100
    
    let condition = 'Sunny';
    if (rainChance > 70) {
      condition = 'Stormy';
    } else if (rainChance > 40) {
      condition = 'Rainy';
    } else if (rainChance > 20) {
      condition = 'Cloudy';
    }

    forecast.push({
      day: i === 0 ? 'Today' : dayName,
      date: forecastDay.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      tempMin,
      tempMax,
      windSpeedKnots: windSpeed,
      waveHeightMeters: waveHeight,
      rainChance,
      condition
    });
  }

  // Adjust first 2 days if there are warnings
  const hasDangerAlert = activeAlerts.some(
    a => a.severity === 'danger' && a.region.toLowerCase().includes(locationName.toLowerCase().split(',')[0].trim().toLowerCase())
  );
  const hasWarningAlert = activeAlerts.some(
    a => a.severity === 'warning' && a.region.toLowerCase().includes(locationName.toLowerCase().split(',')[0].trim().toLowerCase())
  );

  if (hasDangerAlert) {
    forecast[0].condition = 'Stormy';
    forecast[0].waveHeightMeters = 3.6;
    forecast[0].windSpeedKnots = 30;
    forecast[0].rainChance = 95;
    
    forecast[1].condition = 'Stormy';
    forecast[1].waveHeightMeters = 2.9;
    forecast[1].windSpeedKnots = 24;
    forecast[1].rainChance = 80;
  } else if (hasWarningAlert) {
    forecast[0].condition = 'Rainy';
    forecast[0].waveHeightMeters = 2.3;
    forecast[0].windSpeedKnots = 18;
    forecast[0].rainChance = 70;
  }

  return {
    location: locationName,
    lat: coords.lat,
    lng: coords.lng,
    isSimulated: true,
    forecast
  };
}
