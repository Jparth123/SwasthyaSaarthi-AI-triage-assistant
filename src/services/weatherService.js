/**
 * Weather Forecast & Climate Service
 * Provides realistic seasonal weather projections and packing intelligence.
 */

export function getWeatherForecastForDay(dateStr, _location = 'Tokyo') {
  const date = new Date(dateStr);
  const month = isNaN(date.getTime()) ? 10 : date.getMonth() + 1; // 1-12

  // Realistic temperature and condition by season in Honshu (Tokyo/Kyoto/Osaka)
  if (month >= 3 && month <= 5) {
    // Spring
    return {
      tempC: 18,
      tempF: 64,
      condition: 'Pleasant & Mild',
      icon: 'Sun',
      precipitationProb: '15%',
      packingAdvice: 'Light layers, comfortable walking shoes, and a light cardigan for cool evenings.',
    };
  } else if (month >= 6 && month <= 8) {
    // Summer
    return {
      tempC: 29,
      tempF: 84,
      condition: 'Warm & Sunny',
      icon: 'SunDim',
      precipitationProb: '35%',
      packingAdvice: 'Breathable linen or cotton clothing, UV parasol or hat, and electrolyte hydration.',
    };
  } else if (month >= 9 && month <= 11) {
    // Autumn
    return {
      tempC: 21,
      tempF: 70,
      condition: 'Crisp & Clear',
      icon: 'CloudSun',
      precipitationProb: '10%',
      packingAdvice: 'Crisp autumn weather! Bring a stylish trench or medium jacket for nighttime temple illuminations.',
    };
  } else {
    // Winter
    return {
      tempC: 11,
      tempF: 52,
      condition: 'Sunny & Brisk',
      icon: 'Snowflake',
      precipitationProb: '10%',
      packingAdvice: 'Warm wool coat, scarf, gloves, and thermal heattech innerwear.',
    };
  }
}
