const { useState, useEffect, useCallback, useRef, useMemo } = React;

// ─── NOTE ───────────────────────────────────────────────────────────────────
// All pure logic (REGIONS, shuffle, generateQuizQuestions, calculateXPBonus,
// shouldEndQuiz, filterStates, computeResults, processAnswer) is also exported
// from geography-app.logic.mjs for unit testing. When modifying logic here,
// keep that module in sync. Run: node --test geography-app.test.mjs
// See TESTING_RULES.md for the full policy.
// ─────────────────────────────────────────────────────────────────────────────

// ─── DATA ───────────────────────────────────────────────────────────────────
const REGIONS = {
  usa: {
    name: "United States",
    emoji: "🇺🇸",
    color: "#2563EB",
    states: [
      ["Alabama","Montgomery"],["Alaska","Juneau"],["Arizona","Phoenix"],["Arkansas","Little Rock"],
      ["California","Sacramento"],["Colorado","Denver"],["Connecticut","Hartford"],["Delaware","Dover"],
      ["Florida","Tallahassee"],["Georgia","Atlanta"],["Hawaii","Honolulu"],["Idaho","Boise"],
      ["Illinois","Springfield"],["Indiana","Indianapolis"],["Iowa","Des Moines"],["Kansas","Topeka"],
      ["Kentucky","Frankfort"],["Louisiana","Baton Rouge"],["Maine","Augusta"],["Maryland","Annapolis"],
      ["Massachusetts","Boston"],["Michigan","Lansing"],["Minnesota","Saint Paul"],["Mississippi","Jackson"],
      ["Missouri","Jefferson City"],["Montana","Helena"],["Nebraska","Lincoln"],["Nevada","Carson City"],
      ["New Hampshire","Concord"],["New Jersey","Trenton"],["New Mexico","Santa Fe"],["New York","Albany"],
      ["North Carolina","Raleigh"],["North Dakota","Bismarck"],["Ohio","Columbus"],["Oklahoma","Oklahoma City"],
      ["Oregon","Salem"],["Pennsylvania","Harrisburg"],["Rhode Island","Providence"],["South Carolina","Columbia"],
      ["South Dakota","Pierre"],["Tennessee","Nashville"],["Texas","Austin"],["Utah","Salt Lake City"],
      ["Vermont","Montpelier"],["Virginia","Richmond"],["Washington","Olympia"],["West Virginia","Charleston"],
      ["Wisconsin","Madison"],["Wyoming","Cheyenne"]
    ]
  },
  canada: {
    name: "Canada",
    emoji: "🇨🇦",
    color: "#DC2626",
    states: [
      ["Alberta","Edmonton"],["British Columbia","Victoria"],["Manitoba","Winnipeg"],
      ["New Brunswick","Fredericton"],["Newfoundland and Labrador","St. John's"],
      ["Nova Scotia","Halifax"],["Ontario","Toronto"],["Prince Edward Island","Charlottetown"],
      ["Quebec","Quebec City"],["Saskatchewan","Regina"],
      ["Northwest Territories","Yellowknife"],["Nunavut","Iqaluit"],["Yukon","Whitehorse"]
    ]
  },
  europe: {
    name: "Europe",
    emoji: "🇪🇺",
    color: "#7C3AED",
    states: [
      ["Albania","Tirana"],["Andorra","Andorra la Vella"],["Austria","Vienna"],["Belarus","Minsk"],
      ["Belgium","Brussels"],["Bosnia and Herzegovina","Sarajevo"],["Bulgaria","Sofia"],["Croatia","Zagreb"],
      ["Czech Republic","Prague"],["Denmark","Copenhagen"],["Estonia","Tallinn"],["Finland","Helsinki"],
      ["France","Paris"],["Germany","Berlin"],["Greece","Athens"],["Hungary","Budapest"],
      ["Iceland","Reykjavik"],["Ireland","Dublin"],["Italy","Rome"],["Latvia","Riga"],
      ["Lithuania","Vilnius"],["Luxembourg","Luxembourg City"],["Malta","Valletta"],
      ["Moldova","Chișinău"],["Monaco","Monaco"],["Montenegro","Podgorica"],
      ["Netherlands","Amsterdam"],["North Macedonia","Skopje"],["Norway","Oslo"],
      ["Poland","Warsaw"],["Portugal","Lisbon"],["Romania","Bucharest"],["Russia","Moscow"],
      ["San Marino","San Marino"],["Serbia","Belgrade"],["Slovakia","Bratislava"],
      ["Slovenia","Ljubljana"],["Spain","Madrid"],["Sweden","Stockholm"],
      ["Switzerland","Bern"],["Ukraine","Kyiv"],["United Kingdom","London"],["Vatican City","Vatican City"]
    ]
  },
  mexico: {
    name: "Mexico",
    emoji: "🇲🇽",
    color: "#16A34A",
    states: [
      ["Aguascalientes","Aguascalientes"],["Baja California","Mexicali"],["Baja California Sur","La Paz"],
      ["Campeche","San Francisco de Campeche"],["Chiapas","Tuxtla Gutiérrez"],["Chihuahua","Chihuahua"],
      ["Coahuila","Saltillo"],["Colima","Colima"],["Durango","Victoria de Durango"],
      ["Guanajuato","Guanajuato"],["Guerrero","Chilpancingo"],["Hidalgo","Pachuca"],
      ["Jalisco","Guadalajara"],["México","Toluca"],["Michoacán","Morelia"],
      ["Morelos","Cuernavaca"],["Nayarit","Tepic"],["Nuevo León","Monterrey"],
      ["Oaxaca","Oaxaca de Juárez"],["Puebla","Puebla"],["Querétaro","Santiago de Querétaro"],
      ["Quintana Roo","Chetumal"],["San Luis Potosí","San Luis Potosí"],["Sinaloa","Culiacán"],
      ["Sonora","Hermosillo"],["Tabasco","Villahermosa"],["Tamaulipas","Ciudad Victoria"],
      ["Tlaxcala","Tlaxcala"],["Veracruz","Xalapa"],["Yucatán","Mérida"],
      ["Zacatecas","Zacatecas"],["Mexico City","Mexico City"]
    ]
  }
};

// ─── GEO COORDINATES (state/country center + capital coords) ────────────────
const GEO_DATA = {
  usa: {
    "Alabama": { abbr: "AL", lat: 32.8, lng: -86.8, capLat: 32.38, capLng: -86.30, color: "#3B82F6" },
    "Alaska": { abbr: "AK", lat: 64.0, lng: -153.0, capLat: 58.30, capLng: -134.42, color: "#6366F1" },
    "Arizona": { abbr: "AZ", lat: 34.3, lng: -111.7, capLat: 33.45, capLng: -112.07, color: "#F59E0B" },
    "Arkansas": { abbr: "AR", lat: 34.8, lng: -92.4, capLat: 34.75, capLng: -92.29, color: "#EF4444" },
    "California": { abbr: "CA", lat: 37.2, lng: -119.5, capLat: 38.58, capLng: -121.49, color: "#F97316" },
    "Colorado": { abbr: "CO", lat: 39.0, lng: -105.5, capLat: 39.74, capLng: -104.98, color: "#8B5CF6" },
    "Connecticut": { abbr: "CT", lat: 41.6, lng: -72.7, capLat: 41.76, capLng: -72.68, color: "#06B6D4" },
    "Delaware": { abbr: "DE", lat: 39.0, lng: -75.5, capLat: 39.16, capLng: -75.52, color: "#14B8A6" },
    "Florida": { abbr: "FL", lat: 28.6, lng: -82.4, capLat: 30.44, capLng: -84.28, color: "#F97316" },
    "Georgia": { abbr: "GA", lat: 32.7, lng: -83.5, capLat: 33.75, capLng: -84.39, color: "#EC4899" },
    "Hawaii": { abbr: "HI", lat: 20.5, lng: -157.5, capLat: 21.31, capLng: -157.86, color: "#F43F5E" },
    "Idaho": { abbr: "ID", lat: 44.4, lng: -114.6, capLat: 43.62, capLng: -116.20, color: "#22C55E" },
    "Illinois": { abbr: "IL", lat: 40.0, lng: -89.2, capLat: 39.80, capLng: -89.65, color: "#3B82F6" },
    "Indiana": { abbr: "IN", lat: 39.9, lng: -86.3, capLat: 39.77, capLng: -86.16, color: "#EF4444" },
    "Iowa": { abbr: "IA", lat: 42.0, lng: -93.5, capLat: 41.59, capLng: -93.62, color: "#F59E0B" },
    "Kansas": { abbr: "KS", lat: 38.5, lng: -98.3, capLat: 39.05, capLng: -95.68, color: "#8B5CF6" },
    "Kentucky": { abbr: "KY", lat: 37.8, lng: -85.3, capLat: 38.20, capLng: -84.87, color: "#06B6D4" },
    "Louisiana": { abbr: "LA", lat: 31.1, lng: -91.9, capLat: 30.45, capLng: -91.19, color: "#A855F7" },
    "Maine": { abbr: "ME", lat: 45.4, lng: -69.2, capLat: 44.31, capLng: -69.78, color: "#22C55E" },
    "Maryland": { abbr: "MD", lat: 39.0, lng: -76.7, capLat: 38.98, capLng: -76.49, color: "#EF4444" },
    "Massachusetts": { abbr: "MA", lat: 42.3, lng: -71.8, capLat: 42.36, capLng: -71.06, color: "#3B82F6" },
    "Michigan": { abbr: "MI", lat: 44.3, lng: -85.4, capLat: 42.73, capLng: -84.56, color: "#14B8A6" },
    "Minnesota": { abbr: "MN", lat: 46.3, lng: -94.3, capLat: 44.95, capLng: -93.09, color: "#6366F1" },
    "Mississippi": { abbr: "MS", lat: 32.7, lng: -89.7, capLat: 32.30, capLng: -90.18, color: "#EC4899" },
    "Missouri": { abbr: "MO", lat: 38.4, lng: -92.5, capLat: 38.58, capLng: -92.17, color: "#F97316" },
    "Montana": { abbr: "MT", lat: 47.1, lng: -109.6, capLat: 46.60, capLng: -112.04, color: "#22C55E" },
    "Nebraska": { abbr: "NE", lat: 41.5, lng: -99.8, capLat: 40.81, capLng: -96.70, color: "#EF4444" },
    "Nevada": { abbr: "NV", lat: 39.3, lng: -116.6, capLat: 39.16, capLng: -119.77, color: "#A855F7" },
    "New Hampshire": { abbr: "NH", lat: 43.7, lng: -71.6, capLat: 43.21, capLng: -71.54, color: "#6366F1" },
    "New Jersey": { abbr: "NJ", lat: 40.1, lng: -74.7, capLat: 40.22, capLng: -74.76, color: "#F59E0B" },
    "New Mexico": { abbr: "NM", lat: 34.4, lng: -106.1, capLat: 35.69, capLng: -105.94, color: "#F43F5E" },
    "New York": { abbr: "NY", lat: 43.0, lng: -75.5, capLat: 42.65, capLng: -73.76, color: "#3B82F6" },
    "North Carolina": { abbr: "NC", lat: 35.5, lng: -79.8, capLat: 35.78, capLng: -78.64, color: "#06B6D4" },
    "North Dakota": { abbr: "ND", lat: 47.4, lng: -100.5, capLat: 46.81, capLng: -100.78, color: "#14B8A6" },
    "Ohio": { abbr: "OH", lat: 40.4, lng: -82.8, capLat: 39.96, capLng: -83.00, color: "#EF4444" },
    "Oklahoma": { abbr: "OK", lat: 35.6, lng: -97.5, capLat: 35.47, capLng: -97.52, color: "#8B5CF6" },
    "Oregon": { abbr: "OR", lat: 44.0, lng: -120.5, capLat: 44.94, capLng: -123.03, color: "#22C55E" },
    "Pennsylvania": { abbr: "PA", lat: 40.9, lng: -77.8, capLat: 40.26, capLng: -76.88, color: "#F59E0B" },
    "Rhode Island": { abbr: "RI", lat: 41.7, lng: -71.5, capLat: 41.82, capLng: -71.41, color: "#EC4899" },
    "South Carolina": { abbr: "SC", lat: 33.9, lng: -80.9, capLat: 34.00, capLng: -81.03, color: "#F97316" },
    "South Dakota": { abbr: "SD", lat: 44.4, lng: -100.2, capLat: 44.37, capLng: -100.35, color: "#A855F7" },
    "Tennessee": { abbr: "TN", lat: 35.8, lng: -86.4, capLat: 36.16, capLng: -86.78, color: "#F43F5E" },
    "Texas": { abbr: "TX", lat: 31.5, lng: -99.4, capLat: 30.27, capLng: -97.74, color: "#EF4444" },
    "Utah": { abbr: "UT", lat: 39.3, lng: -111.7, capLat: 40.76, capLng: -111.89, color: "#06B6D4" },
    "Vermont": { abbr: "VT", lat: 44.1, lng: -72.6, capLat: 44.26, capLng: -72.58, color: "#22C55E" },
    "Virginia": { abbr: "VA", lat: 37.5, lng: -78.8, capLat: 37.54, capLng: -77.44, color: "#3B82F6" },
    "Washington": { abbr: "WA", lat: 47.4, lng: -120.5, capLat: 47.04, capLng: -122.90, color: "#8B5CF6" },
    "West Virginia": { abbr: "WV", lat: 38.6, lng: -80.6, capLat: 38.35, capLng: -81.63, color: "#14B8A6" },
    "Wisconsin": { abbr: "WI", lat: 44.6, lng: -89.7, capLat: 43.07, capLng: -89.40, color: "#F59E0B" },
    "Wyoming": { abbr: "WY", lat: 43.0, lng: -107.5, capLat: 41.14, capLng: -104.82, color: "#6366F1" },
  },
  canada: {
    "Alberta": { abbr: "AB", lat: 54.0, lng: -115.0, capLat: 53.54, capLng: -113.49, color: "#EF4444" },
    "British Columbia": { abbr: "BC", lat: 54.0, lng: -125.0, capLat: 48.43, capLng: -123.37, color: "#22C55E" },
    "Manitoba": { abbr: "MB", lat: 55.0, lng: -97.0, capLat: 49.90, capLng: -97.14, color: "#F59E0B" },
    "New Brunswick": { abbr: "NB", lat: 46.8, lng: -66.5, capLat: 45.96, capLng: -66.65, color: "#3B82F6" },
    "Newfoundland and Labrador": { abbr: "NL", lat: 53.0, lng: -60.0, capLat: 47.56, capLng: -52.71, color: "#8B5CF6" },
    "Nova Scotia": { abbr: "NS", lat: 44.7, lng: -63.0, capLat: 44.65, capLng: -63.57, color: "#F97316" },
    "Ontario": { abbr: "ON", lat: 50.0, lng: -85.0, capLat: 43.65, capLng: -79.38, color: "#EC4899" },
    "Prince Edward Island": { abbr: "PE", lat: 46.3, lng: -63.0, capLat: 46.24, capLng: -63.13, color: "#06B6D4" },
    "Quebec": { abbr: "QC", lat: 52.0, lng: -72.0, capLat: 46.81, capLng: -71.21, color: "#14B8A6" },
    "Saskatchewan": { abbr: "SK", lat: 54.0, lng: -106.0, capLat: 50.45, capLng: -104.62, color: "#A855F7" },
    "Northwest Territories": { abbr: "NT", lat: 64.0, lng: -121.0, capLat: 62.45, capLng: -114.37, color: "#F43F5E" },
    "Nunavut": { abbr: "NU", lat: 66.0, lng: -90.0, capLat: 63.75, capLng: -68.52, color: "#6366F1" },
    "Yukon": { abbr: "YT", lat: 64.0, lng: -136.0, capLat: 60.72, capLng: -135.06, color: "#22C55E" },
  },
  europe: {
    "Albania": { abbr: "AL", lat: 41.0, lng: 20.1, capLat: 41.33, capLng: 19.82, color: "#EF4444" },
    "Andorra": { abbr: "AD", lat: 42.5, lng: 1.5, capLat: 42.51, capLng: 1.52, color: "#F59E0B" },
    "Austria": { abbr: "AT", lat: 47.5, lng: 14.6, capLat: 48.21, capLng: 16.37, color: "#3B82F6" },
    "Belarus": { abbr: "BY", lat: 53.5, lng: 28.0, capLat: 53.90, capLng: 27.57, color: "#22C55E" },
    "Belgium": { abbr: "BE", lat: 50.6, lng: 4.4, capLat: 50.85, capLng: 4.35, color: "#F97316" },
    "Bosnia and Herzegovina": { abbr: "BA", lat: 43.9, lng: 17.7, capLat: 43.86, capLng: 18.41, color: "#8B5CF6" },
    "Bulgaria": { abbr: "BG", lat: 42.7, lng: 25.5, capLat: 42.70, capLng: 23.32, color: "#EC4899" },
    "Croatia": { abbr: "HR", lat: 45.2, lng: 15.5, capLat: 45.81, capLng: 15.98, color: "#06B6D4" },
    "Czech Republic": { abbr: "CZ", lat: 49.8, lng: 15.5, capLat: 50.08, capLng: 14.44, color: "#14B8A6" },
    "Denmark": { abbr: "DK", lat: 56.0, lng: 10.0, capLat: 55.68, capLng: 12.57, color: "#EF4444" },
    "Estonia": { abbr: "EE", lat: 58.8, lng: 25.5, capLat: 59.44, capLng: 24.75, color: "#6366F1" },
    "Finland": { abbr: "FI", lat: 63.5, lng: 26.0, capLat: 60.17, capLng: 24.94, color: "#3B82F6" },
    "France": { abbr: "FR", lat: 46.6, lng: 2.5, capLat: 48.86, capLng: 2.35, color: "#A855F7" },
    "Germany": { abbr: "DE", lat: 51.2, lng: 10.4, capLat: 52.52, capLng: 13.41, color: "#F59E0B" },
    "Greece": { abbr: "GR", lat: 38.5, lng: 23.0, capLat: 37.98, capLng: 23.73, color: "#06B6D4" },
    "Hungary": { abbr: "HU", lat: 47.2, lng: 19.4, capLat: 47.50, capLng: 19.04, color: "#F43F5E" },
    "Iceland": { abbr: "IS", lat: 65.0, lng: -18.5, capLat: 64.14, capLng: -21.90, color: "#22C55E" },
    "Ireland": { abbr: "IE", lat: 53.4, lng: -7.7, capLat: 53.35, capLng: -6.26, color: "#22C55E" },
    "Italy": { abbr: "IT", lat: 42.5, lng: 12.8, capLat: 41.90, capLng: 12.50, color: "#EF4444" },
    "Latvia": { abbr: "LV", lat: 57.0, lng: 24.9, capLat: 56.95, capLng: 24.11, color: "#8B5CF6" },
    "Lithuania": { abbr: "LT", lat: 55.3, lng: 24.0, capLat: 54.69, capLng: 25.28, color: "#F97316" },
    "Luxembourg": { abbr: "LU", lat: 49.8, lng: 6.1, capLat: 49.61, capLng: 6.13, color: "#EC4899" },
    "Malta": { abbr: "MT", lat: 35.9, lng: 14.4, capLat: 35.90, capLng: 14.51, color: "#F59E0B" },
    "Moldova": { abbr: "MD", lat: 47.2, lng: 28.5, capLat: 47.01, capLng: 28.86, color: "#14B8A6" },
    "Monaco": { abbr: "MC", lat: 43.7, lng: 7.4, capLat: 43.73, capLng: 7.42, color: "#EF4444" },
    "Montenegro": { abbr: "ME", lat: 42.8, lng: 19.3, capLat: 42.44, capLng: 19.26, color: "#3B82F6" },
    "Netherlands": { abbr: "NL", lat: 52.3, lng: 5.3, capLat: 52.37, capLng: 4.89, color: "#F97316" },
    "North Macedonia": { abbr: "MK", lat: 41.5, lng: 21.7, capLat: 42.00, capLng: 21.43, color: "#A855F7" },
    "Norway": { abbr: "NO", lat: 62.0, lng: 10.0, capLat: 59.91, capLng: 10.75, color: "#EF4444" },
    "Poland": { abbr: "PL", lat: 52.0, lng: 19.4, capLat: 52.23, capLng: 21.01, color: "#EC4899" },
    "Portugal": { abbr: "PT", lat: 39.6, lng: -8.0, capLat: 38.72, capLng: -9.14, color: "#22C55E" },
    "Romania": { abbr: "RO", lat: 45.8, lng: 25.0, capLat: 44.43, capLng: 26.10, color: "#F59E0B" },
    "Russia": { abbr: "RU", lat: 56.0, lng: 38.0, capLat: 55.76, capLng: 37.62, color: "#6366F1" },
    "San Marino": { abbr: "SM", lat: 43.9, lng: 12.5, capLat: 43.94, capLng: 12.45, color: "#06B6D4" },
    "Serbia": { abbr: "RS", lat: 44.0, lng: 21.0, capLat: 44.82, capLng: 20.46, color: "#F43F5E" },
    "Slovakia": { abbr: "SK", lat: 48.7, lng: 19.7, capLat: 48.15, capLng: 17.11, color: "#8B5CF6" },
    "Slovenia": { abbr: "SI", lat: 46.1, lng: 14.8, capLat: 46.06, capLng: 14.51, color: "#14B8A6" },
    "Spain": { abbr: "ES", lat: 40.0, lng: -3.7, capLat: 40.42, capLng: -3.70, color: "#EF4444" },
    "Sweden": { abbr: "SE", lat: 62.0, lng: 16.0, capLat: 59.33, capLng: 18.07, color: "#F59E0B" },
    "Switzerland": { abbr: "CH", lat: 46.8, lng: 8.2, capLat: 46.95, capLng: 7.45, color: "#3B82F6" },
    "Ukraine": { abbr: "UA", lat: 49.0, lng: 32.0, capLat: 50.45, capLng: 30.52, color: "#F97316" },
    "United Kingdom": { abbr: "UK", lat: 54.0, lng: -2.5, capLat: 51.51, capLng: -0.13, color: "#3B82F6" },
    "Vatican City": { abbr: "VA", lat: 41.9, lng: 12.4, capLat: 41.90, capLng: 12.45, color: "#A855F7" },
  },
  mexico: {
    "Aguascalientes": { abbr: "AGS", lat: 22.0, lng: -102.4, capLat: 21.88, capLng: -102.29, color: "#EF4444" },
    "Baja California": { abbr: "BC", lat: 30.5, lng: -115.5, capLat: 32.62, capLng: -115.45, color: "#3B82F6" },
    "Baja California Sur": { abbr: "BCS", lat: 25.5, lng: -111.5, capLat: 24.14, capLng: -110.31, color: "#F59E0B" },
    "Campeche": { abbr: "CAM", lat: 18.8, lng: -90.4, capLat: 19.84, capLng: -90.53, color: "#22C55E" },
    "Chiapas": { abbr: "CHIS", lat: 16.5, lng: -92.5, capLat: 16.75, capLng: -93.12, color: "#8B5CF6" },
    "Chihuahua": { abbr: "CHIH", lat: 28.8, lng: -106.4, capLat: 28.63, capLng: -106.09, color: "#F97316" },
    "Coahuila": { abbr: "COAH", lat: 27.3, lng: -102.0, capLat: 25.42, capLng: -101.00, color: "#EC4899" },
    "Colima": { abbr: "COL", lat: 19.1, lng: -103.7, capLat: 19.24, capLng: -103.73, color: "#06B6D4" },
    "Durango": { abbr: "DGO", lat: 24.5, lng: -105.0, capLat: 24.02, capLng: -104.66, color: "#14B8A6" },
    "Guanajuato": { abbr: "GTO", lat: 21.0, lng: -101.3, capLat: 21.02, capLng: -101.26, color: "#6366F1" },
    "Guerrero": { abbr: "GRO", lat: 17.6, lng: -100.0, capLat: 17.55, capLng: -99.50, color: "#F43F5E" },
    "Hidalgo": { abbr: "HGO", lat: 20.5, lng: -98.9, capLat: 20.12, capLng: -98.73, color: "#A855F7" },
    "Jalisco": { abbr: "JAL", lat: 20.6, lng: -103.6, capLat: 20.67, capLng: -103.35, color: "#EF4444" },
    "México": { abbr: "MEX", lat: 19.4, lng: -99.7, capLat: 19.29, capLng: -99.66, color: "#3B82F6" },
    "Michoacán": { abbr: "MICH", lat: 19.2, lng: -101.9, capLat: 19.70, capLng: -101.19, color: "#F59E0B" },
    "Morelos": { abbr: "MOR", lat: 18.8, lng: -99.2, capLat: 18.92, capLng: -99.23, color: "#22C55E" },
    "Nayarit": { abbr: "NAY", lat: 21.8, lng: -105.0, capLat: 21.51, capLng: -104.90, color: "#8B5CF6" },
    "Nuevo León": { abbr: "NL", lat: 25.6, lng: -99.9, capLat: 25.67, capLng: -100.31, color: "#F97316" },
    "Oaxaca": { abbr: "OAX", lat: 16.9, lng: -96.5, capLat: 17.07, capLng: -96.73, color: "#EC4899" },
    "Puebla": { abbr: "PUE", lat: 19.0, lng: -97.9, capLat: 19.04, capLng: -98.21, color: "#06B6D4" },
    "Querétaro": { abbr: "QRO", lat: 20.8, lng: -100.0, capLat: 20.59, capLng: -100.39, color: "#14B8A6" },
    "Quintana Roo": { abbr: "QROO", lat: 19.6, lng: -87.8, capLat: 18.50, capLng: -88.30, color: "#6366F1" },
    "San Luis Potosí": { abbr: "SLP", lat: 22.6, lng: -100.4, capLat: 22.15, capLng: -100.98, color: "#F43F5E" },
    "Sinaloa": { abbr: "SIN", lat: 24.8, lng: -107.4, capLat: 24.81, capLng: -107.39, color: "#A855F7" },
    "Sonora": { abbr: "SON", lat: 29.7, lng: -110.5, capLat: 29.07, capLng: -110.97, color: "#EF4444" },
    "Tabasco": { abbr: "TAB", lat: 17.8, lng: -92.6, capLat: 17.99, capLng: -92.93, color: "#3B82F6" },
    "Tamaulipas": { abbr: "TAM", lat: 24.3, lng: -98.8, capLat: 23.74, capLng: -99.15, color: "#F59E0B" },
    "Tlaxcala": { abbr: "TLAX", lat: 19.3, lng: -98.2, capLat: 19.32, capLng: -98.24, color: "#22C55E" },
    "Veracruz": { abbr: "VER", lat: 19.4, lng: -96.9, capLat: 19.54, capLng: -96.93, color: "#8B5CF6" },
    "Yucatán": { abbr: "YUC", lat: 20.8, lng: -89.0, capLat: 20.97, capLng: -89.62, color: "#F97316" },
    "Zacatecas": { abbr: "ZAC", lat: 23.3, lng: -102.8, capLat: 22.77, capLng: -102.58, color: "#EC4899" },
    "Mexico City": { abbr: "CDMX", lat: 19.4, lng: -99.1, capLat: 19.43, capLng: -99.13, color: "#F43F5E" },
  }
};

// Map viewport bounds for each region
const MAP_BOUNDS = {
  usa: { minLat: 24, maxLat: 50, minLng: -125, maxLng: -66 },
  canada: { minLat: 42, maxLat: 72, minLng: -141, maxLng: -52 },
  europe: { minLat: 34, maxLat: 72, minLng: -25, maxLng: 45 },
  mexico: { minLat: 14, maxLat: 33, minLng: -118, maxLng: -86 },
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuizQuestions(selectedRegions, count = 10) {
  const regionLabel = (rk) => rk === "europe" ? "country" : rk === "canada" ? "province" : "state";
  let classicPool = [];
  let shapePool = [];
  let mapTapPool = [];
  selectedRegions.forEach(regionKey => {
    const region = REGIONS[regionKey];
    const label = regionLabel(regionKey);
    region.states.forEach(([state, capital]) => {
      classicPool.push({ type: "capital", question: `What is the capital of ${state}?`, correct: capital, region: regionKey, state });
      classicPool.push({ type: "state", question: `${capital} is the capital of which ${label}?`, correct: state, region: regionKey, state });
      const paths = SVG_PATHS[regionKey];
      if (paths && paths[state] && paths[state].d && paths[state].d.length > 20) {
        shapePool.push({ type: "shape_identify", question: `Which ${label} is this?`, correct: state, region: regionKey, state, shapePath: paths[state].d });
        shapePool.push({ type: "shape_capital", question: `What is the capital of this ${label}?`, correct: capital, region: regionKey, state, shapePath: paths[state].d });
        mapTapPool.push({ type: "map_tap", question: `Where is ${state}?`, correct: state, region: regionKey, state });
      }
    });
  });
  if (count <= 0) return [];
  // Mix: ~30% map_tap, ~20% shape, ~50% classic
  // Pick interactive questions FIRST to guarantee they aren't crowded out by dedup
  const targetMapTap = Math.min(Math.round(count * 0.3), mapTapPool.length);
  const targetShape = Math.min(Math.round(count * 0.2), shapePool.length);

  const result = [];
  const usedStates = new Set();

  // Phase 1: Pick map_tap questions (highest priority interactive)
  for (const q of shuffle(mapTapPool)) {
    if (result.length >= count) break;
    if (result.filter(r => r.type === "map_tap").length >= targetMapTap) break;
    if (usedStates.has(q.state)) continue;
    usedStates.add(q.state);
    result.push(q);
  }
  // Phase 2: Pick shape questions
  for (const q of shuffle(shapePool)) {
    if (result.length >= count) break;
    if (result.filter(r => r.type === "shape_identify" || r.type === "shape_capital").length >= targetShape) break;
    if (usedStates.has(q.state)) continue;
    usedStates.add(q.state);
    result.push(q);
  }
  // Phase 3: Fill remaining with classic questions
  for (const q of shuffle(classicPool)) {
    if (result.length >= count) break;
    if (usedStates.has(q.state)) continue;
    usedStates.add(q.state);
    result.push(q);
  }

  // Shuffle the final result so question types are intermixed
  const finalResult = shuffle(result);
  return finalResult.map(q => {
    if (q.type === "map_tap") {
      return { ...q, options: [] }; // no multiple-choice for map_tap
    }
    const isCapitalAnswer = q.type === "capital" || q.type === "shape_capital";
    const allAnswers = selectedRegions.flatMap(r =>
      REGIONS[r].states.flatMap(([s, c]) => isCapitalAnswer ? [c] : [s])
    );
    const wrong = shuffle(allAnswers.filter(a => a !== q.correct)).slice(0, 3);
    return { ...q, options: shuffle([q.correct, ...wrong]) };
  });
}

const CORRECT_MESSAGES = ["Brilliant! 🎉", "Nailed it! ⭐", "You're on fire! 🔥", "Fantastic! 🌟", "Superb! 💪", "Genius! 🧠"];
const WRONG_MESSAGES = ["Almost there! 💪", "Keep going! 🌱", "You'll get it! ✨", "Nice try! 🎯"];
const STREAK_MESSAGES = { 3: "Hat Trick! 🎩", 5: "Unstoppable! 🚀", 7: "Legendary! 👑", 10: "PERFECT! 💎" };

// ─── EXPLORER LEVELS ─────────────────────────────────────────────────────
const EXPLORER_LEVELS = [
  { name: "Scout", minXP: 0, icon: "🔰", color: "#94A3B8" },
  { name: "Pathfinder", minXP: 500, icon: "🧭", color: "#22C55E" },
  { name: "Navigator", minXP: 2000, icon: "🗺️", color: "#3B82F6" },
  { name: "Cartographer", minXP: 5000, icon: "📐", color: "#8B5CF6" },
  { name: "Wayfinder", minXP: 15000, icon: "⭐", color: "#F59E0B" },
  { name: "Globetrotter", minXP: 50000, icon: "🌍", color: "#EF4444" },
];

function getExplorerLevel(xp) {
  let level = EXPLORER_LEVELS[0];
  for (const l of EXPLORER_LEVELS) {
    if (xp >= l.minXP) level = l;
  }
  const idx = EXPLORER_LEVELS.indexOf(level);
  const next = EXPLORER_LEVELS[idx + 1] || null;
  const progress = next ? (xp - level.minXP) / (next.minXP - level.minXP) : 1;
  return { ...level, index: idx, next, progress: Math.min(1, progress) };
}

// ─── XP BONUS CONSTANTS ─────────────────────────────────────────────────
const SPEED_BONUS_THRESHOLD = 3000; // ms — answer within 3 seconds for speed bonus
const SPEED_BONUS_XP = 5;
const PERFECT_QUIZ_MULTIPLIER = 2; // 2x XP for 10/10

// ─── PRE-PROJECTED SVG PATHS (topologically consistent, Mercator-projected) ─
const SVG_PATHS = {"usa":{"Alabama":{"d":"M560.4,420.8 L584.1,421.2 L589.9,467.5 L593.9,480.3 L591.6,483.0 L590.5,489.3 L592.3,507.1 L557.1,507.2 L560.2,519.2 L556.4,523.0 L553.0,519.5 L551.5,513.8 L549.8,521.5 L546.3,520.4 L545.3,488.1 L550.4,423.2 L548.9,420.9 L560.4,420.8Z","cx":565.7,"cy":480.4},"Alaska":{"d":"M137.0,543.6 L161.3,545.8 L161.3,579.2 L174.0,584.2 L181.0,581.0 L200.7,597.2 L192.8,596.1 L181.7,583.2 L182.4,586.8 L176.0,584.0 L177.0,586.7 L166.4,580.2 L135.6,576.7 L136.2,580.3 L121.9,583.0 L130.0,576.7 L126.7,575.7 L98.5,594.7 L75.9,600.3 L92.2,595.5 L103.7,585.0 L86.9,585.5 L85.2,580.0 L78.3,580.8 L71.3,575.0 L77.4,568.8 L90.5,566.6 L89.1,562.7 L75.3,564.4 L64.3,560.3 L89.2,557.6 L70.9,548.5 L105.5,539.7 L137.0,543.6Z","cx":124.5,"cy":575.0},"Arizona":{"d":"M266.4,376.1 L266.3,500.1 L238.8,500.1 L188.1,475.4 L189.4,470.6 L192.8,467.8 L192.0,463.8 L190.2,463.7 L189.3,455.7 L192.0,452.6 L191.9,444.2 L197.3,436.1 L190.5,423.6 L191.4,417.8 L189.1,396.3 L194.1,395.5 L197.1,398.0 L198.5,394.2 L198.5,376.1 L266.4,376.1Z","cx":206.0,"cy":434.2},"Arkansas":{"d":"M463.9,387.4 L522.5,387.5 L523.7,391.8 L519.5,398.7 L528.2,398.7 L527.8,402.8 L522.8,411.1 L523.0,416.4 L516.6,429.3 L516.9,433.6 L511.7,439.8 L512.5,442.2 L507.9,452.3 L510.3,455.2 L508.8,464.4 L469.8,464.1 L469.8,452.6 L463.8,450.7 L464.5,412.1 L462.0,387.4 L463.9,387.4Z","cx":500.5,"cy":422.2},"California":{"d":"M74.0,258.7 L117.8,258.9 L117.8,330.2 L190.5,420.8 L197.3,436.1 L191.9,444.2 L192.0,452.6 L189.3,455.7 L190.2,463.7 L192.0,463.8 L192.0,469.7 L156.8,474.4 L152.1,458.0 L142.4,447.9 L139.3,448.4 L137.2,441.8 L134.0,442.8 L128.4,439.6 L123.8,433.7 L111.4,433.0 L109.0,430.1 L109.2,418.6 L92.1,391.5 L91.6,384.3 L93.6,380.6 L91.6,376.6 L89.3,377.1 L85.0,370.6 L83.7,358.3 L86.2,358.3 L85.2,349.9 L83.8,354.9 L81.2,355.8 L78.0,352.6 L75.4,342.9 L67.1,331.2 L65.6,310.7 L58.7,300.6 L58.0,296.3 L61.4,285.9 L62.7,272.3 L60.1,264.1 L60.7,258.8 L74.0,258.7Z","cx":113.0,"cy":378.5},"Colorado":{"d":"M281.6,282.9 L361.1,282.9 L361.3,376.2 L266.4,376.1 L266.3,283.0 L281.6,282.9Z","cx":303.1,"cy":314.0},"Connecticut":{"d":"M754.4,257.9 L771.4,258.3 L771.4,273.0 L770.5,275.3 L756.4,276.2 L746.2,283.3 L745.2,280.5 L748.6,277.9 L748.5,257.6 L754.4,257.9Z","cx":756.7,"cy":269.8},"Delaware":{"d":"M722.4,311.4 L719.7,315.8 L720.0,319.5 L722.5,328.7 L726.7,334.9 L727.3,342.9 L718.6,342.7 L717.3,313.3 L722.4,311.4Z","cx":721.9,"cy":324.5},"Florida":{"d":"M585.6,507.2 L592.3,507.1 L594.2,513.2 L630.1,516.2 L630.8,520.7 L632.4,520.5 L633.8,510.8 L640.6,513.3 L643.1,532.6 L653.1,560.0 L652.5,567.5 L659.7,594.0 L658.2,615.3 L653.4,626.2 L645.6,627.7 L641.8,613.7 L637.4,613.2 L632.5,599.6 L632.3,592.3 L630.7,591.6 L629.7,594.8 L623.7,581.0 L627.7,572.8 L623.3,575.8 L621.5,571.8 L624.3,551.2 L622.2,545.9 L614.1,538.1 L610.8,530.5 L605.6,525.9 L601.1,527.0 L601.3,530.2 L588.2,534.4 L586.9,529.4 L574.8,520.5 L558.2,522.3 L560.2,519.2 L557.1,507.2 L585.6,507.2Z","cx":617.9,"cy":552.0},"Georgia":{"d":"M618.0,420.8 L614.9,427.8 L620.8,432.1 L625.5,444.0 L639.9,464.3 L645.0,483.3 L648.2,485.2 L641.2,504.3 L640.6,513.3 L633.8,510.8 L632.4,520.5 L630.8,520.7 L630.1,516.2 L594.2,513.2 L590.8,501.3 L591.8,495.7 L590.5,489.3 L591.6,483.0 L593.9,480.3 L589.9,467.5 L584.1,421.2 L618.0,420.8Z","cx":616.6,"cy":478.0},"Hawaii":{"d":"M299.6,662.0 L296.3,660.8 L296.3,656.6 L293.9,651.5 L297.1,647.5 L296.1,645.9 L296.4,644.3 L304.3,647.6 L306.9,649.7 L306.9,651.4 L310.7,654.3 L308.4,656.6 L304.2,657.7 L301.3,659.5 L299.6,662.0Z M286.9,634.1 L288.4,635.9 L290.4,635.1 L294.7,637.2 L294.1,639.2 L288.8,639.7 L288.6,637.4 L286.3,636.9 L285.4,635.6 L286.9,634.1Z M248.2,618.0 L249.8,618.1 L250.5,619.5 L250.1,621.5 L248.5,622.8 L244.3,621.2 L244.8,619.0 L248.2,618.0Z M268.6,625.1 L270.0,628.3 L269.3,630.1 L266.4,630.4 L264.5,626.7 L268.6,625.1Z M281.6,631.7 L280.3,633.1 L277.2,633.1 L278.1,631.5 L281.6,631.7Z","cx":281.8,"cy":637.7},"Idaho":{"d":"M171.4,77.8 L171.4,105.8 L175.8,113.3 L175.8,120.7 L181.2,125.0 L190.8,141.4 L194.8,141.3 L192.5,157.2 L193.9,161.2 L191.4,164.1 L191.7,169.6 L194.6,172.3 L199.3,165.9 L201.8,168.5 L202.7,175.5 L206.6,182.5 L206.5,187.4 L210.9,189.8 L214.2,199.4 L223.0,195.0 L231.5,195.5 L234.6,190.2 L239.2,197.3 L239.2,258.8 L158.1,258.8 L158.1,213.6 L159.9,205.4 L155.2,199.4 L165.7,168.2 L161.4,162.8 L157.7,149.2 L158.0,77.8 L171.4,77.8Z","cx":190.3,"cy":165.7},"Illinois":{"d":"M515.9,246.4 L554.4,246.8 L553.9,251.5 L558.2,265.9 L558.1,322.0 L556.6,326.3 L558.5,335.3 L552.4,347.0 L549.5,361.2 L550.8,365.2 L545.2,367.3 L546.0,372.6 L544.3,374.5 L537.7,371.3 L536.3,376.5 L534.2,376.2 L531.1,369.8 L532.2,368.3 L531.1,360.4 L519.8,348.3 L523.1,333.8 L515.6,331.9 L514.7,324.2 L506.0,313.2 L504.3,306.0 L505.6,293.5 L509.4,290.9 L511.5,284.9 L511.7,280.7 L509.5,277.2 L510.4,273.0 L519.9,268.8 L522.1,263.5 L522.3,255.7 L515.9,246.4Z","cx":530.5,"cy":317.0},"Indiana":{"d":"M578.9,264.7 L595.0,264.7 L593.8,328.8 L594.9,335.2 L586.5,336.5 L586.7,341.0 L581.1,347.0 L578.3,354.3 L574.7,349.5 L571.7,352.4 L572.0,354.9 L568.9,355.8 L568.0,353.5 L563.5,358.2 L557.1,353.9 L551.3,357.9 L552.4,347.0 L558.5,335.3 L556.6,326.3 L558.1,322.0 L558.2,265.9 L578.9,264.7Z","cx":572.1,"cy":330.4},"Iowa":{"d":"M506.0,221.8 L508.1,221.8 L510.3,228.0 L508.6,231.0 L510.1,240.4 L514.9,243.3 L522.7,258.8 L519.9,268.8 L510.4,273.0 L509.5,277.2 L511.7,280.7 L511.5,284.9 L509.4,290.9 L505.6,293.5 L505.4,297.8 L501.1,292.2 L446.4,292.8 L441.5,259.5 L434.7,241.5 L437.3,231.2 L435.3,222.4 L437.1,221.8 L506.0,221.8Z","cx":491.5,"cy":256.3},"Kansas":{"d":"M363.1,306.7 L452.6,306.7 L458.3,310.7 L455.3,317.6 L459.2,325.4 L462.1,326.5 L462.0,376.1 L361.3,376.2 L361.1,306.7 L363.1,306.7Z","cx":419.8,"cy":325.9},"Kentucky":{"d":"M607.2,335.6 L610.3,338.7 L617.6,338.9 L621.0,335.8 L625.0,343.6 L624.6,350.5 L626.3,354.9 L629.1,360.9 L633.5,363.9 L617.6,381.9 L610.1,385.5 L550.7,383.4 L551.0,387.5 L532.5,387.5 L533.2,384.6 L535.2,385.6 L535.7,375.2 L537.7,371.3 L544.3,374.5 L546.0,372.6 L545.2,367.3 L550.8,365.2 L549.5,361.2 L552.6,355.8 L557.1,353.9 L563.5,358.2 L568.0,353.5 L568.9,355.8 L572.0,354.9 L571.7,352.4 L574.7,349.5 L578.3,354.3 L581.1,347.0 L586.7,341.0 L586.5,336.5 L594.9,335.2 L594.8,327.8 L600.0,327.8 L603.0,334.7 L607.2,335.6Z","cx":579.9,"cy":357.0},"Louisiana":{"d":"M475.6,464.1 L508.8,464.4 L511.2,481.2 L505.6,494.0 L504.2,493.5 L502.4,507.2 L528.0,507.2 L526.7,514.1 L531.0,524.3 L526.7,529.2 L530.0,530.6 L531.4,527.3 L534.2,530.6 L532.4,534.4 L529.3,533.4 L528.7,538.3 L538.1,545.2 L535.9,548.7 L533.6,548.0 L531.6,544.4 L526.6,542.5 L526.6,538.9 L524.1,540.1 L523.2,545.8 L516.9,543.0 L513.7,547.1 L509.7,545.0 L508.0,539.9 L503.8,537.9 L502.6,533.6 L499.0,534.2 L499.0,531.5 L493.2,537.8 L480.8,532.8 L472.5,534.6 L471.3,532.6 L474.5,525.1 L474.0,516.1 L476.8,508.5 L472.8,490.7 L469.8,486.0 L469.8,464.1 L475.6,464.1Z","cx":507.7,"cy":521.7},"Maine":{"d":"M786.2,232.9 L782.7,225.8 L781.1,176.2 L787.0,172.7 L786.0,170.9 L790.5,165.1 L795.8,140.0 L806.3,119.6 L808.7,120.5 L808.9,125.5 L810.7,127.2 L819.7,122.4 L823.5,126.7 L825.7,130.1 L825.6,166.6 L830.3,168.5 L829.8,176.8 L831.7,180.7 L834.3,179.9 L836.7,189.0 L822.2,201.1 L819.9,197.1 L820.5,201.1 L817.4,203.0 L816.7,199.8 L811.7,201.5 L811.6,197.8 L809.5,198.6 L808.3,208.3 L798.0,216.4 L795.4,213.1 L786.2,232.9Z","cx":810.0,"cy":177.7},"Maryland":{"d":"M667.2,313.3 L717.3,313.3 L718.6,342.7 L727.3,342.9 L724.7,352.6 L716.0,355.4 L714.9,350.1 L716.5,348.5 L714.4,344.7 L710.9,346.0 L710.6,326.8 L714.4,321.7 L714.8,317.2 L709.4,322.9 L706.8,335.6 L709.5,352.0 L701.9,346.6 L700.6,343.0 L698.1,345.1 L697.1,342.3 L702.1,332.6 L694.7,328.4 L694.7,325.0 L691.1,322.7 L689.5,316.1 L684.9,314.0 L680.9,318.2 L676.9,316.5 L667.1,325.4 L667.2,313.3Z","cx":701.3,"cy":332.5},"Massachusetts":{"d":"M783.3,237.1 L785.2,241.8 L782.4,252.3 L785.3,252.8 L788.4,263.3 L792.2,265.7 L796.6,263.5 L795.6,266.8 L789.2,269.7 L785.4,267.6 L780.6,271.0 L777.0,258.4 L748.2,256.7 L751.5,240.6 L778.2,241.8 L783.3,237.1Z","cx":781.4,"cy":255.4},"Michigan":{"d":"M557.3,181.6 L555.2,178.9 L556.4,175.2 L553.3,174.7 L554.7,166.6 L550.3,160.2 L523.0,149.4 L518.9,143.3 L538.2,132.0 L549.2,119.8 L552.3,121.7 L545.7,132.6 L545.8,137.5 L548.4,133.8 L553.0,134.4 L559.9,144.2 L569.4,146.8 L576.6,140.7 L591.5,138.3 L592.0,145.6 L598.5,147.2 L604.2,144.3 L604.3,153.5 L606.1,157.4 L611.6,155.8 L613.0,158.5 L600.9,159.9 L597.0,156.8 L596.4,162.1 L585.6,155.7 L583.4,159.1 L576.0,159.2 L569.8,165.9 L570.0,162.5 L568.2,161.8 L567.4,165.3 L562.9,167.0 L557.3,181.6Z M613.3,265.3 L567.7,264.7 L574.0,252.7 L576.0,241.2 L575.7,234.0 L571.7,219.5 L572.9,214.0 L572.0,207.4 L575.2,200.7 L575.4,191.9 L584.1,180.7 L583.8,190.0 L585.3,190.4 L587.1,177.9 L591.9,174.7 L590.8,169.2 L593.2,164.5 L603.0,167.6 L604.6,171.3 L612.9,174.8 L615.2,180.3 L613.3,183.2 L615.8,191.4 L615.0,200.8 L612.2,203.2 L611.6,208.0 L608.3,209.6 L607.2,217.6 L610.4,219.7 L615.9,210.1 L620.6,207.6 L624.3,213.1 L627.4,234.9 L626.0,243.8 L622.2,242.9 L613.3,265.3Z","cx":584.2,"cy":179.9},"Minnesota":{"d":"M497.3,139.7 L493.5,140.7 L493.5,156.2 L485.7,165.5 L485.5,169.2 L488.7,172.7 L486.5,190.4 L505.1,209.5 L507.7,215.0 L508.1,221.8 L437.1,221.8 L437.1,176.4 L431.6,168.5 L435.3,162.9 L435.1,149.5 L432.4,141.0 L431.6,115.7 L427.9,101.3 L428.3,86.6 L426.6,77.8 L454.7,77.8 L454.7,67.2 L457.4,67.5 L462.4,85.7 L472.5,88.1 L473.1,91.1 L484.1,88.2 L490.6,93.0 L492.4,99.1 L496.7,95.4 L503.3,104.0 L513.2,98.7 L514.4,102.7 L529.8,104.9 L514.6,115.2 L496.2,137.5 L497.3,139.7Z","cx":475.2,"cy":130.8},"Mississippi":{"d":"M545.3,420.9 L550.4,423.2 L545.3,488.1 L546.3,520.4 L540.3,519.5 L531.0,524.3 L526.7,514.1 L528.0,507.2 L502.4,507.2 L504.2,493.5 L505.6,494.0 L511.2,481.2 L510.9,474.9 L508.9,472.2 L510.3,455.2 L507.9,452.3 L512.5,442.2 L511.7,439.8 L516.9,433.6 L516.6,429.3 L521.2,422.9 L520.4,420.9 L545.3,420.9Z","cx":522.6,"cy":467.7},"Missouri":{"d":"M499.7,292.3 L505.4,297.8 L504.3,306.0 L506.0,313.2 L514.7,324.2 L515.6,331.9 L523.1,333.8 L519.8,348.3 L531.1,360.4 L532.2,368.3 L531.1,369.8 L534.2,376.2 L536.3,376.5 L535.2,385.6 L530.8,387.5 L530.9,393.0 L528.2,398.7 L519.5,398.7 L523.7,391.8 L522.5,387.5 L462.0,387.4 L462.1,326.5 L459.2,325.4 L455.3,317.6 L458.3,310.7 L454.0,308.9 L446.4,292.8 L499.7,292.3Z","cx":505.0,"cy":346.5},"Montana":{"d":"M334.1,77.8 L334.2,184.1 L239.1,183.9 L239.2,197.3 L234.6,190.2 L231.5,195.5 L223.0,195.0 L214.2,199.4 L210.9,189.8 L206.5,187.4 L206.6,182.5 L202.7,175.5 L201.8,168.5 L199.3,165.9 L194.6,172.3 L191.7,169.6 L191.4,164.1 L193.9,161.2 L192.5,157.2 L194.8,141.3 L190.8,141.4 L181.2,125.0 L175.8,120.7 L175.8,113.3 L171.4,105.8 L171.4,77.8 L334.1,77.8Z","cx":216.2,"cy":156.3},"Nebraska":{"d":"M343.9,234.2 L409.3,234.4 L416.8,240.0 L418.4,237.6 L426.7,238.1 L433.8,242.7 L437.2,246.9 L439.6,257.9 L441.5,259.5 L441.9,270.0 L444.3,272.1 L444.8,289.7 L452.6,306.7 L361.1,306.7 L361.1,282.9 L334.0,282.9 L334.0,234.2 L343.9,234.2Z","cx":404.7,"cy":259.5},"Nevada":{"d":"M158.1,258.8 L198.6,258.9 L198.5,394.2 L197.1,398.0 L194.1,395.5 L189.1,396.3 L190.5,420.8 L117.8,330.2 L117.8,258.9 L158.1,258.8Z","cx":172.0,"cy":337.0},"New Hampshire":{"d":"M781.1,176.2 L782.7,225.8 L786.2,232.9 L784.7,237.5 L778.2,241.8 L762.5,241.0 L761.4,235.4 L763.5,220.1 L768.2,207.4 L768.2,201.2 L774.9,194.6 L773.7,190.4 L777.3,177.1 L781.1,176.2Z","cx":774.6,"cy":211.3},"New Jersey":{"d":"M738.3,279.6 L742.8,283.0 L737.8,295.2 L741.5,297.0 L740.2,312.4 L730.7,330.3 L729.5,326.5 L720.7,319.5 L720.3,315.5 L731.0,301.7 L725.3,293.1 L727.3,286.2 L726.1,283.7 L732.1,274.3 L738.3,279.6Z","cx":732.1,"cy":298.5},"New Mexico":{"d":"M288.4,376.1 L348.3,376.1 L347.4,485.9 L299.3,485.9 L300.5,490.5 L277.7,490.5 L277.7,500.1 L266.3,500.1 L266.4,376.1 L288.4,376.1Z","cx":296.0,"cy":445.7},"New York":{"d":"M750.4,183.7 L751.1,198.3 L749.2,208.3 L749.6,217.2 L751.8,221.3 L751.5,240.6 L748.2,256.7 L748.6,277.9 L745.2,280.5 L746.2,283.3 L752.0,285.2 L764.8,279.2 L767.3,283.1 L751.8,291.9 L742.4,293.9 L741.2,290.0 L742.8,283.0 L729.4,272.5 L723.1,258.8 L663.4,258.8 L663.4,252.3 L675.7,239.6 L672.7,227.8 L680.7,225.0 L693.6,228.5 L705.0,225.8 L711.2,221.2 L712.5,210.3 L709.5,207.6 L710.2,204.4 L724.1,187.9 L730.3,183.5 L750.4,183.7Z","cx":727.6,"cy":241.3},"North Carolina":{"d":"M646.9,386.0 L716.2,386.3 L717.7,395.2 L714.0,394.4 L705.3,400.0 L717.4,400.0 L718.3,405.4 L712.4,413.7 L707.9,413.9 L707.1,417.7 L710.6,422.1 L707.7,428.3 L698.0,429.5 L689.6,439.2 L687.7,446.1 L679.9,446.0 L664.6,425.2 L649.4,424.8 L649.6,422.3 L646.0,417.5 L629.3,416.4 L618.0,420.8 L601.6,421.0 L602.0,415.8 L604.6,415.4 L609.0,408.4 L619.6,403.7 L624.4,397.2 L624.8,399.4 L630.1,395.1 L632.6,396.0 L636.8,390.7 L637.4,385.4 L646.9,386.0Z","cx":663.6,"cy":410.7},"North Dakota":{"d":"M426.6,77.8 L428.3,86.6 L427.9,101.3 L431.6,115.7 L432.4,141.0 L435.1,149.5 L435.6,159.9 L334.1,159.7 L334.1,77.8 L426.6,77.8Z","cx":411.2,"cy":114.7},"Ohio":{"d":"M653.1,259.3 L653.1,291.7 L651.1,293.0 L652.0,299.2 L648.9,313.6 L643.6,321.1 L637.3,323.8 L634.6,333.2 L632.6,329.6 L628.6,343.0 L625.0,343.6 L621.0,335.8 L617.6,338.9 L610.3,338.7 L603.0,334.7 L600.0,327.8 L594.8,327.8 L595.0,266.3 L613.3,265.3 L626.6,273.8 L636.6,271.3 L653.1,259.3Z","cx":628.7,"cy":308.7},"Oklahoma":{"d":"M387.8,376.1 L462.0,376.1 L464.5,412.1 L463.8,450.7 L453.7,443.6 L441.2,446.3 L438.5,449.6 L430.7,443.6 L427.3,448.5 L420.2,443.2 L417.9,446.0 L413.8,440.3 L400.0,438.1 L399.0,433.9 L393.1,434.4 L389.0,430.5 L389.0,387.4 L348.3,387.4 L348.3,376.1 L387.8,376.1Z","cx":413.8,"cy":422.0},"Oregon":{"d":"M74.3,153.7 L78.4,156.1 L80.3,167.0 L87.3,169.9 L93.3,165.8 L101.7,168.5 L114.9,165.3 L131.5,158.2 L159.6,158.4 L164.6,164.6 L165.7,168.2 L155.2,199.4 L159.9,205.4 L158.1,213.6 L158.1,258.8 L60.7,258.8 L58.7,256.0 L57.9,242.6 L56.1,238.3 L61.3,214.2 L63.9,180.3 L63.6,159.7 L64.3,155.2 L69.7,151.4 L74.3,153.7Z","cx":100.5,"cy":187.3},"Pennsylvania":{"d":"M663.4,252.7 L663.4,258.8 L723.1,258.8 L727.3,264.8 L727.0,268.4 L732.1,274.3 L726.1,283.7 L727.3,286.2 L725.2,290.3 L731.0,301.7 L726.0,309.4 L717.3,313.3 L653.1,313.3 L653.1,259.3 L663.4,252.7Z","cx":703.9,"cy":279.2},"Rhode Island":{"d":"M775.0,258.4 L777.0,258.4 L779.2,265.9 L777.5,265.5 L775.7,274.1 L770.5,275.3 L771.4,258.7 L775.0,258.4Z","cx":775.2,"cy":264.3},"South Carolina":{"d":"M622.7,419.4 L629.3,416.4 L646.0,417.5 L649.6,422.3 L649.4,424.8 L664.6,425.2 L679.9,446.0 L674.6,450.7 L668.9,464.3 L665.8,464.3 L648.2,485.2 L645.0,483.3 L639.9,464.3 L625.5,444.0 L620.8,432.1 L614.9,427.8 L618.0,420.8 L622.7,419.4Z","cx":643.7,"cy":440.4},"South Dakota":{"d":"M334.1,159.7 L435.6,159.9 L431.6,168.5 L437.1,176.4 L437.1,221.8 L435.3,222.4 L437.3,231.2 L434.7,241.5 L437.2,246.9 L426.7,238.1 L418.4,237.6 L416.8,240.0 L409.3,234.4 L334.0,234.2 L334.1,159.7Z","cx":410.6,"cy":211.5},"Tennessee":{"d":"M551.0,387.5 L550.7,383.4 L637.4,385.4 L636.8,390.7 L632.6,396.0 L630.1,395.1 L624.8,399.4 L624.4,397.2 L619.6,403.7 L609.0,408.4 L604.6,415.4 L602.0,415.8 L601.6,421.0 L520.4,420.9 L523.0,416.4 L522.8,411.1 L530.9,393.0 L530.8,387.5 L551.0,387.5Z","cx":584.4,"cy":400.8},"Texas":{"d":"M364.4,387.4 L389.0,387.4 L389.0,430.5 L393.1,434.4 L399.0,433.9 L400.0,438.1 L413.8,440.3 L417.9,446.0 L420.2,443.2 L427.3,448.5 L430.7,443.6 L438.5,449.6 L441.2,446.3 L453.7,443.6 L465.2,452.7 L469.8,452.6 L469.8,486.0 L472.8,490.7 L476.8,508.5 L474.0,516.1 L474.5,525.1 L471.3,532.6 L472.5,534.6 L463.2,537.6 L460.7,536.0 L460.3,532.6 L456.6,537.3 L458.2,542.5 L451.6,551.7 L443.4,557.1 L434.2,555.2 L437.8,560.5 L432.7,561.1 L422.3,585.2 L423.9,584.5 L422.0,593.1 L426.7,610.3 L422.5,612.3 L420.8,609.7 L413.4,608.9 L400.2,599.2 L396.5,589.4 L396.0,580.1 L385.0,563.7 L379.8,546.8 L369.8,533.2 L357.3,530.8 L353.3,533.7 L346.7,549.2 L344.5,549.3 L327.9,535.6 L322.6,516.2 L298.9,488.0 L299.3,485.9 L347.4,485.9 L347.8,387.4 L364.4,387.4Z","cx":412.5,"cy":510.7},"Utah":{"d":"M224.0,258.9 L239.2,258.8 L239.2,283.0 L266.3,283.0 L266.4,376.1 L198.5,376.1 L198.6,258.9 L224.0,258.9Z","cx":232.0,"cy":294.2},"Vermont":{"d":"M775.4,183.7 L773.7,190.4 L774.9,194.6 L768.2,201.2 L768.2,207.4 L763.5,220.1 L761.4,235.4 L762.5,241.0 L751.5,240.6 L751.8,221.3 L749.6,217.2 L749.2,208.3 L751.1,198.3 L750.4,183.7 L775.4,183.7Z","cx":761.8,"cy":208.5},"Virginia":{"d":"M682.5,319.4 L689.6,327.2 L691.1,322.7 L693.2,323.1 L694.7,328.4 L699.3,331.7 L700.3,335.1 L696.4,343.0 L697.0,345.4 L700.7,344.7 L701.3,348.3 L706.1,349.9 L711.2,355.9 L709.5,362.3 L711.1,367.3 L709.0,372.5 L710.7,374.2 L708.8,377.0 L705.3,374.6 L714.5,377.8 L716.2,386.3 L610.4,385.1 L617.6,381.9 L633.5,363.9 L637.4,371.5 L656.1,364.5 L656.2,360.4 L664.9,339.6 L669.5,343.8 L673.8,333.7 L675.5,335.7 L681.8,326.3 L682.5,319.4Z","cx":685.1,"cy":351.3},"Washington":{"d":"M158.0,77.8 L157.7,149.2 L159.6,158.4 L131.5,158.2 L101.7,168.5 L97.0,165.3 L87.3,169.9 L80.3,167.0 L78.4,156.1 L62.7,149.6 L65.0,144.2 L62.2,138.7 L57.8,112.1 L55.1,108.2 L54.0,100.2 L55.5,94.8 L63.8,100.8 L79.8,102.8 L82.1,108.8 L83.7,108.3 L84.9,123.4 L86.3,122.7 L85.3,110.5 L87.5,104.3 L85.8,101.8 L84.1,84.6 L79.9,80.9 L80.4,77.8 L158.0,77.8Z","cx":89.8,"cy":121.5},"West Virginia":{"d":"M653.1,291.7 L653.1,313.3 L667.2,313.3 L667.1,325.4 L672.4,319.2 L676.9,316.5 L680.9,318.2 L684.9,314.0 L689.5,316.1 L691.1,322.7 L689.6,327.2 L682.5,319.4 L681.8,326.3 L675.5,335.7 L673.8,333.7 L669.5,343.8 L664.9,339.6 L656.2,360.4 L656.1,364.5 L637.4,371.5 L626.3,354.9 L624.6,350.5 L625.0,343.6 L628.6,343.0 L632.6,329.6 L634.6,333.2 L637.3,323.8 L643.6,321.1 L648.9,313.6 L652.0,299.2 L651.1,293.0 L653.1,291.7Z","cx":658.8,"cy":327.2},"Wisconsin":{"d":"M518.9,143.3 L523.0,149.4 L550.3,160.2 L554.7,166.6 L553.3,174.7 L556.4,175.2 L555.2,178.9 L557.3,181.6 L556.7,184.6 L554.1,185.2 L551.1,195.1 L552.7,195.8 L562.0,179.7 L564.8,178.3 L555.3,212.4 L555.7,217.2 L552.9,228.1 L554.4,246.8 L515.9,246.4 L510.1,240.4 L508.6,231.0 L510.3,228.0 L508.2,225.5 L507.7,215.0 L505.1,209.5 L486.5,190.4 L488.7,172.7 L485.5,169.2 L485.7,165.5 L493.5,156.2 L493.5,140.7 L513.2,133.1 L514.4,134.9 L512.6,138.4 L518.9,143.3Z","cx":528.2,"cy":185.5},"Wyoming":{"d":"M265.9,183.9 L334.0,184.1 L334.0,282.9 L239.2,283.0 L239.1,183.9 L265.9,183.9Z","cx":279.7,"cy":217.0}},"canada":{"Quebec":{"d":"M804.1,500.3 L790.4,502.4 L776.9,519.2 L720.2,518.2 L691.0,550.5 L678.6,546.0 L690.6,551.0 L676.5,571.0 L718.4,535.8 L740.7,541.3 L730.7,552.4 L702.8,553.7 L674.7,595.6 L645.6,595.9 L648.7,587.8 L631.2,589.4 L610.0,576.8 L602.1,560.8 L602.3,498.0 L608.7,504.2 L607.0,494.5 L612.6,487.0 L606.9,454.8 L600.5,446.7 L618.4,435.9 L629.6,416.1 L627.0,393.1 L611.2,375.4 L627.4,345.3 L619.6,347.2 L620.7,331.7 L614.6,332.7 L621.0,317.2 L614.9,301.7 L655.1,297.4 L674.1,315.9 L674.0,325.2 L692.6,326.9 L691.6,347.2 L678.9,347.3 L692.1,351.1 L690.4,361.8 L695.1,363.4 L686.0,372.4 L703.0,372.3 L703.1,384.6 L693.9,391.4 L706.1,376.1 L708.8,388.4 L720.0,371.5 L723.6,381.0 L725.2,367.8 L730.3,367.2 L728.3,358.5 L733.3,360.7 L728.3,353.7 L737.3,342.5 L734.7,357.7 L739.5,367.7 L734.2,369.4 L746.8,372.8 L738.3,385.4 L745.8,391.9 L740.9,418.0 L750.3,434.8 L745.1,447.5 L711.3,439.6 L714.8,447.4 L708.1,456.9 L716.0,469.0 L714.6,479.5 L721.1,475.0 L720.2,487.6 L732.2,488.1 L736.9,498.0 L744.9,472.7 L747.7,480.3 L741.4,483.3 L744.4,490.9 L804.1,490.9 L804.1,500.3Z M608.2,417.7 L598.1,425.1 L604.9,412.2 L608.2,417.7Z","cx":690.6,"cy":435.7},"Newfoundland and Labrador":{"d":"M737.3,342.5 L734.7,348.8 L747.7,362.5 L741.7,367.6 L752.3,373.5 L745.8,381.3 L755.1,378.0 L748.1,387.4 L756.0,383.7 L761.2,393.7 L755.2,396.2 L765.9,403.8 L762.9,412.3 L754.8,409.2 L775.0,427.1 L771.9,441.0 L780.1,435.2 L783.2,438.4 L778.6,445.2 L785.6,436.8 L801.9,448.1 L776.9,465.8 L769.8,462.8 L777.1,470.1 L801.2,454.9 L801.7,467.5 L809.9,461.6 L815.8,469.0 L812.6,478.0 L816.4,480.5 L809.6,481.2 L816.8,489.2 L804.1,500.3 L804.1,490.9 L744.4,490.9 L741.4,483.3 L747.7,480.3 L744.9,472.7 L736.9,498.0 L732.2,488.1 L720.2,487.6 L721.1,475.0 L714.6,479.5 L716.0,469.0 L708.1,456.9 L714.8,447.4 L711.3,439.6 L745.1,447.5 L750.3,434.8 L740.9,418.0 L745.8,391.9 L738.3,385.4 L746.8,372.8 L734.2,369.4 L739.5,367.7 L734.7,357.7 L737.3,342.5Z M815.2,508.9 L806.3,529.3 L813.0,520.0 L818.9,523.0 L812.9,531.2 L821.8,529.4 L819.6,537.0 L828.0,529.4 L836.9,533.8 L830.5,546.9 L841.2,543.7 L832.6,549.2 L835.0,559.6 L842.5,551.1 L840.2,572.4 L835.5,572.4 L836.0,564.3 L830.3,569.8 L833.8,561.0 L829.7,554.0 L819.6,569.2 L814.2,567.9 L825.8,557.5 L784.3,558.3 L793.7,544.9 L785.0,544.7 L797.0,537.9 L794.1,531.7 L798.8,530.6 L804.3,506.5 L819.4,497.7 L813.3,501.0 L815.2,508.9Z","cx":781.1,"cy":472.0},"British Columbia":{"d":"M265.5,537.6 L211.5,537.6 L210.4,527.0 L202.2,528.0 L207.0,527.0 L204.4,520.0 L196.1,523.0 L199.7,514.6 L193.1,517.4 L195.2,507.8 L192.3,516.0 L182.4,514.5 L188.1,505.3 L185.4,511.8 L172.3,507.9 L179.0,504.4 L168.7,504.2 L179.4,495.5 L167.9,496.1 L174.3,485.8 L178.8,491.1 L174.2,484.7 L176.1,477.4 L163.3,486.2 L166.6,476.0 L158.1,465.4 L168.0,470.6 L159.5,464.3 L161.4,457.4 L155.1,468.3 L148.0,458.8 L153.6,453.9 L144.6,451.8 L149.2,452.4 L145.6,446.6 L149.9,447.5 L147.3,443.5 L153.6,432.7 L147.9,440.9 L148.1,421.3 L132.5,412.7 L99.7,352.4 L81.8,369.8 L68.5,348.5 L238.9,348.7 L239.6,466.0 L283.6,513.4 L292.4,537.2 L265.5,537.6Z M174.8,524.6 L167.7,520.5 L172.1,513.1 L163.1,510.4 L189.9,517.6 L209.3,545.9 L192.8,541.7 L195.5,534.0 L189.5,538.9 L179.6,531.4 L183.9,527.3 L174.8,524.6Z","cx":179.0,"cy":486.7},"Nunavut":{"d":"M766.6,201.8 L752.1,208.8 L760.5,216.7 L750.6,214.1 L757.5,221.5 L752.3,219.2 L754.3,227.0 L746.7,218.6 L746.2,243.5 L728.7,223.4 L738.9,208.4 L724.9,218.2 L728.9,207.5 L722.9,213.8 L714.6,201.2 L706.2,204.6 L713.4,219.2 L698.7,212.5 L705.9,215.2 L705.9,229.5 L712.2,225.2 L717.9,246.4 L732.1,252.3 L727.2,257.0 L737.6,271.8 L736.3,280.9 L730.5,268.2 L736.5,288.3 L730.7,286.1 L731.8,295.5 L697.2,269.4 L724.6,309.9 L701.3,302.3 L672.8,282.2 L668.9,276.3 L677.1,272.7 L667.4,271.2 L658.5,248.9 L651.4,256.4 L646.5,243.2 L646.1,255.5 L628.2,259.8 L613.6,247.8 L621.5,230.0 L639.7,247.5 L641.6,238.5 L634.7,233.4 L656.9,230.2 L648.1,213.3 L668.5,185.2 L654.5,147.9 L649.0,151.8 L645.2,137.1 L628.3,147.5 L637.9,133.1 L607.2,90.9 L602.0,99.2 L609.1,114.5 L582.5,107.5 L589.6,119.1 L571.4,102.1 L582.9,112.8 L546.8,111.2 L540.9,95.6 L527.6,104.0 L512.4,78.5 L535.4,81.4 L509.3,70.4 L507.4,52.4 L518.7,5.5 L551.2,-11.5 L554.8,-8.6 L537.7,26.2 L540.6,49.6 L554.9,72.7 L537.0,81.6 L555.2,83.5 L556.9,61.1 L543.9,49.6 L560.9,49.3 L547.2,20.6 L562.8,25.5 L548.6,16.3 L565.6,17.6 L551.7,9.2 L584.2,-7.9 L596.1,26.1 L585.9,42.2 L593.7,33.6 L589.8,53.8 L601.2,45.9 L596.8,39.4 L599.8,33.8 L618.5,58.0 L608.6,42.4 L625.3,45.9 L611.3,35.8 L619.8,25.4 L641.2,33.7 L643.7,41.9 L630.6,54.5 L650.1,47.7 L639.6,65.4 L646.2,59.8 L642.7,75.7 L655.8,57.3 L649.4,68.6 L655.6,63.2 L653.2,79.5 L660.8,73.0 L657.8,81.8 L665.2,60.8 L678.1,72.9 L665.3,93.0 L682.7,79.3 L670.6,98.6 L677.7,95.3 L674.4,110.4 L689.2,84.8 L683.9,97.0 L703.6,95.1 L684.2,115.0 L708.0,103.4 L714.1,118.8 L687.9,124.2 L717.0,129.7 L697.3,129.3 L705.5,133.2 L696.9,140.0 L708.2,145.2 L693.6,143.1 L718.2,154.7 L707.4,159.3 L721.4,162.9 L717.4,169.6 L720.7,172.3 L724.9,162.0 L724.1,176.1 L735.7,166.7 L731.3,175.6 L743.0,184.2 L735.0,183.0 L742.5,185.2 L735.9,192.1 L750.1,183.7 L743.7,196.8 L759.6,190.9 L766.6,201.8Z M483.8,120.4 L505.6,126.9 L495.4,129.5 L506.6,160.1 L513.9,133.1 L524.5,141.7 L528.3,157.5 L523.1,167.3 L532.9,189.7 L547.6,146.4 L557.6,138.7 L550.5,135.1 L548.3,115.0 L578.0,121.4 L568.7,124.3 L586.3,134.2 L579.8,142.7 L587.0,149.0 L574.5,154.4 L587.2,181.0 L568.0,208.5 L551.5,194.4 L563.7,213.3 L537.4,204.2 L545.3,213.0 L532.0,233.3 L495.0,218.3 L536.0,237.7 L525.4,260.8 L507.3,261.0 L506.6,272.6 L474.5,259.5 L502.8,284.8 L486.4,290.2 L491.5,294.4 L484.9,294.5 L486.2,304.5 L480.2,300.4 L483.3,303.8 L475.9,308.7 L479.2,313.0 L471.5,321.7 L465.3,348.5 L400.5,348.5 L400.7,259.1 L334.2,245.0 L232.8,166.2 L232.8,123.8 L278.4,140.0 L293.5,155.9 L279.1,169.2 L327.6,166.0 L346.5,184.7 L341.0,188.3 L353.6,208.4 L348.5,198.3 L354.9,196.7 L347.6,164.1 L367.6,149.1 L339.3,159.2 L343.5,150.1 L362.7,140.8 L378.1,165.4 L398.5,174.5 L433.3,171.6 L431.3,163.8 L445.0,174.8 L430.1,156.6 L437.8,151.7 L450.8,157.9 L447.4,165.8 L455.5,158.4 L450.3,179.9 L460.3,193.1 L450.4,190.6 L456.1,202.6 L453.7,194.0 L461.5,192.8 L459.2,164.7 L478.1,149.3 L474.2,137.3 L466.8,146.1 L478.0,128.7 L452.7,115.0 L449.4,103.1 L456.1,90.0 L449.0,87.5 L450.0,72.7 L467.0,54.3 L461.5,51.8 L475.1,57.6 L494.8,106.5 L487.2,103.9 L491.0,110.3 L483.8,120.4Z","cx":581.6,"cy":157.4},"Northwest Territories":{"d":"M400.5,348.5 L202.5,348.0 L197.6,329.3 L177.4,333.4 L174.6,318.8 L155.2,304.3 L147.8,268.3 L125.3,245.0 L127.8,217.5 L116.3,217.6 L114.4,192.1 L93.5,192.1 L90.9,142.7 L110.9,147.7 L107.3,139.0 L122.9,120.9 L154.2,107.3 L117.6,143.3 L122.6,147.7 L118.5,143.5 L171.2,104.5 L166.9,93.6 L190.0,130.5 L196.7,106.6 L202.5,120.2 L198.8,129.0 L212.2,115.7 L230.8,121.3 L232.8,166.2 L306.2,228.9 L400.7,259.1 L400.5,348.5Z M261.9,111.1 L315.7,102.5 L254.0,84.4 L283.2,65.1 L247.3,61.9 L255.7,42.5 L251.9,34.0 L262.6,19.9 L287.6,4.2 L293.1,12.8 L287.7,31.7 L301.6,16.7 L317.6,26.4 L312.8,43.6 L328.5,35.7 L328.4,111.1 L265.0,110.9 L270.1,121.4 L261.9,111.1Z","cx":221.1,"cy":146.6},"New Brunswick":{"d":"M696.8,562.9 L705.1,552.5 L734.7,555.4 L729.8,566.0 L744.1,579.9 L712.1,594.1 L708.1,566.4 L696.8,562.9Z M737.8,553.8 L737.5,555.1 L736.7,556.3 L736.3,556.6 L735.9,556.2 L736.3,555.7 L735.8,555.2 L736.1,554.5 L736.7,554.3 L737.3,554.6 L737.8,553.8Z","cx":728.0,"cy":560.3},"Nova Scotia":{"d":"M741.8,581.8 L760.9,583.3 L769.4,592.0 L739.4,601.9 L728.8,617.0 L723.1,613.2 L726.1,600.1 L747.9,590.7 L733.7,591.2 L741.8,581.8Z M772.7,578.8 L767.8,586.0 L775.0,577.2 L779.7,582.6 L765.0,585.8 L774.5,566.9 L772.7,578.8Z","cx":754.1,"cy":588.8},"Saskatchewan":{"d":"M400.5,348.5 L406.2,537.6 L328.6,537.6 L328.6,348.6 L400.5,348.5Z","cx":372.9,"cy":424.2},"Alberta":{"d":"M292.2,537.6 L283.6,513.4 L239.6,466.0 L238.9,348.7 L328.6,348.6 L328.6,537.6 L292.2,537.6Z","cx":286.2,"cy":469.9},"Prince Edward Island":{"d":"M742.2,576.0 L738.4,571.9 L742.1,566.3 L742.7,574.8 L760.4,575.1 L753.4,582.4 L742.2,576.0Z","cx":745.9,"cy":574.6},"Yukon":{"d":"M204.5,348.6 L50.0,342.4 L50.0,121.2 L91.2,142.0 L93.5,192.1 L114.4,192.1 L116.3,217.6 L127.8,217.5 L125.3,245.0 L147.8,268.3 L155.2,304.3 L174.6,318.8 L177.4,333.4 L197.6,329.3 L204.5,348.6Z M66.9,124.4 L65.7,123.0 L65.0,123.4 L66.8,121.0 L69.2,122.7 L67.8,122.9 L66.9,124.4Z","cx":113.6,"cy":217.4},"Manitoba":{"d":"M400.5,348.5 L465.3,348.5 L463.5,367.0 L470.6,371.8 L469.2,382.9 L470.9,372.4 L480.1,373.0 L486.7,399.3 L482.6,407.1 L499.4,400.6 L515.8,407.8 L462.1,477.4 L462.1,537.6 L406.2,537.6 L400.5,348.5Z","cx":462.4,"cy":405.3},"Ontario":{"d":"M602.5,507.4 L602.1,560.8 L607.7,574.3 L649.3,593.0 L620.3,608.0 L626.7,608.0 L624.1,611.7 L606.5,612.1 L600.3,619.0 L608.0,624.5 L586.3,628.0 L575.8,637.9 L570.2,635.8 L582.6,618.6 L586.9,601.1 L583.1,592.1 L597.5,603.2 L601.4,599.2 L597.8,590.4 L591.6,582.8 L557.7,574.7 L554.8,553.3 L545.6,552.8 L540.5,541.0 L524.1,537.7 L524.6,543.5 L509.3,552.7 L467.3,541.9 L462.1,532.0 L462.1,477.4 L518.5,408.0 L552.2,434.9 L549.6,441.0 L577.3,438.0 L577.6,475.2 L585.0,486.0 L581.4,487.8 L592.9,495.5 L589.2,506.3 L602.5,507.4Z M572.4,582.1 L573.1,581.7 L572.8,582.8 L573.5,583.9 L575.0,583.8 L575.5,584.7 L575.8,583.8 L575.1,583.0 L577.6,581.8 L578.8,584.0 L579.9,582.1 L581.0,582.0 L581.3,582.4 L581.2,583.2 L582.0,583.3 L581.7,584.7 L582.1,585.5 L583.2,583.0 L583.4,583.6 L583.0,584.5 L584.0,584.5 L582.9,587.2 L581.6,588.4 L580.4,587.9 L581.3,587.6 L582.5,585.9 L579.7,587.9 L574.1,584.6 L569.4,583.4 L569.7,582.1Z","cx":575.0,"cy":566.0}},"europe":{"Andorra":{"d":"M355.3,565.5 L353.2,566.0 L352.3,565.8 L352.2,564.4 L352.1,564.1 L353.3,563.4 L356.1,564.3 L355.3,565.5Z","cx":353.7,"cy":564.9},"Norway":{"d":"M460.3,242.1 L462.3,243.3 L450.5,250.0 L447.6,246.6 L451.0,244.7 L444.7,246.7 L455.9,231.3 L461.1,227.8 L464.1,233.3 L470.2,228.0 L466.0,225.6 L475.2,220.6 L464.9,221.9 L482.9,213.7 L475.9,214.5 L481.7,209.9 L476.9,207.1 L481.9,206.0 L479.2,203.6 L480.8,199.8 L486.3,201.5 L480.6,196.9 L497.4,191.2 L484.6,194.1 L490.4,191.6 L483.9,187.0 L491.9,187.2 L487.5,182.5 L495.6,181.0 L490.6,177.8 L504.3,173.1 L502.3,171.9 L512.8,174.8 L508.9,169.3 L499.5,170.8 L507.7,163.3 L505.2,165.5 L514.5,170.2 L513.0,166.6 L517.4,163.4 L509.8,164.2 L516.6,160.9 L512.1,156.7 L504.3,157.9 L517.0,155.6 L510.4,152.4 L518.6,147.5 L524.4,157.9 L520.9,153.2 L526.3,151.5 L519.8,146.7 L527.7,150.3 L521.4,145.5 L533.6,149.4 L533.0,143.7 L538.7,143.9 L524.1,140.9 L537.7,137.4 L532.8,135.1 L538.8,135.2 L534.9,131.4 L543.2,125.5 L543.2,117.9 L549.3,122.9 L551.6,121.4 L546.8,116.5 L551.1,115.5 L558.7,123.7 L552.4,113.7 L561.8,109.2 L560.7,118.5 L567.5,104.8 L568.5,114.7 L563.4,122.8 L574.0,117.0 L569.8,110.3 L579.4,103.5 L588.3,110.5 L586.2,105.4 L588.5,103.4 L585.0,103.0 L588.2,101.2 L578.1,98.8 L582.3,95.9 L602.3,105.6 L604.7,103.6 L600.7,101.7 L604.5,94.7 L618.2,88.0 L612.8,83.7 L617.3,83.8 L616.8,78.7 L631.8,80.8 L622.1,91.6 L624.7,92.2 L621.8,102.6 L639.1,79.5 L641.4,82.5 L636.9,87.5 L640.3,87.5 L639.3,95.1 L651.4,83.1 L645.8,80.0 L647.4,76.9 L662.0,78.6 L651.9,88.4 L659.1,85.6 L654.0,91.6 L659.5,90.9 L657.4,101.0 L632.7,111.6 L630.7,129.0 L620.5,139.9 L610.5,133.6 L591.7,136.3 L579.4,121.2 L576.5,128.3 L565.4,128.2 L568.3,134.5 L563.6,145.3 L542.5,141.2 L540.1,154.5 L526.9,155.6 L519.6,166.9 L522.6,175.9 L511.3,187.9 L512.5,192.2 L501.5,195.5 L501.3,213.0 L492.1,228.4 L497.0,230.5 L495.5,239.7 L480.6,240.7 L472.1,254.4 L476.2,273.9 L474.3,283.9 L482.6,290.6 L475.5,297.5 L479.6,308.1 L478.3,313.8 L470.7,317.8 L468.6,334.0 L458.3,328.4 L458.3,316.9 L455.4,317.9 L456.4,323.1 L452.6,319.8 L455.9,327.3 L453.0,331.9 L444.8,330.7 L446.7,332.1 L429.6,347.4 L411.1,348.1 L414.0,344.8 L400.0,339.9 L399.3,331.9 L406.9,335.2 L405.0,334.1 L408.6,332.2 L402.8,331.2 L409.6,322.9 L398.7,327.7 L394.9,323.6 L407.9,317.7 L400.5,317.8 L406.6,309.9 L411.6,307.9 L410.3,313.7 L416.9,306.3 L405.6,308.6 L401.5,315.4 L400.5,308.6 L397.4,312.8 L394.5,308.6 L401.0,306.8 L400.7,301.7 L395.1,304.9 L392.5,301.2 L397.1,303.8 L395.7,301.2 L398.8,299.6 L394.5,300.7 L393.1,296.3 L411.2,294.1 L417.0,299.8 L415.9,295.4 L423.6,293.1 L419.9,293.6 L421.7,289.0 L419.1,294.4 L410.7,293.1 L412.3,289.9 L409.7,294.9 L393.6,294.4 L397.2,290.4 L392.3,289.7 L402.1,289.0 L392.4,285.5 L397.5,280.5 L413.6,281.2 L394.3,280.6 L397.4,278.4 L393.8,275.3 L408.5,277.7 L403.4,274.6 L408.0,271.9 L411.0,276.4 L408.7,271.9 L412.2,270.5 L417.7,276.9 L416.1,273.7 L419.4,273.7 L407.1,267.9 L428.7,265.4 L415.1,265.0 L414.4,261.4 L419.1,259.7 L433.7,266.1 L425.8,259.5 L435.1,263.2 L429.0,257.4 L446.8,247.3 L448.2,253.5 L459.2,251.6 L460.5,248.8 L457.6,248.9 L466.6,244.3 L462.5,242.2 L467.1,239.6 L456.7,244.0 L460.3,242.1Z","cx":493.0,"cy":211.2},"Switzerland":{"d":"M444.7,506.0 L444.0,508.7 L450.7,511.2 L454.6,509.4 L455.5,514.7 L451.2,514.4 L450.7,519.4 L441.7,516.0 L438.9,524.4 L432.3,516.4 L425.5,523.2 L416.9,523.7 L411.5,516.3 L403.9,520.4 L415.6,503.0 L432.8,501.8 L433.5,498.9 L445.1,502.4 L444.7,506.0Z","cx":436.5,"cy":512.4},"North Macedonia":{"d":"M571.0,572.5 L590.9,566.9 L598.9,574.5 L595.4,581.3 L575.5,584.6 L569.9,579.1 L571.0,572.5Z","cx":581.8,"cy":575.9},"Netherlands":{"d":"M402.6,453.6 L393.3,448.9 L375.1,448.1 L384.6,449.5 L377.9,445.6 L386.4,438.0 L389.8,427.8 L414.2,420.8 L418.0,427.6 L412.2,433.6 L416.3,438.2 L412.6,443.0 L403.9,444.0 L406.8,449.0 L402.8,455.0 L404.4,459.1 L400.8,459.1 L402.6,453.6Z","cx":400.2,"cy":444.1},"Slovenia":{"d":"M518.9,513.8 L521.8,511.1 L525.5,516.2 L514.6,519.5 L515.1,524.2 L510.5,525.6 L511.0,529.1 L502.6,526.3 L490.8,528.4 L494.8,526.8 L488.7,518.4 L492.5,515.5 L502.3,517.3 L518.9,513.8Z","cx":507.7,"cy":520.4},"Albania":{"d":"M557.4,567.4 L561.1,563.3 L570.3,568.7 L569.9,579.1 L575.5,584.2 L576.3,587.4 L567.3,598.3 L556.2,589.7 L558.2,590.6 L557.3,578.2 L559.8,575.9 L557.4,567.4Z","cx":563.9,"cy":579.2},"Ireland":{"d":"M252.8,396.1 L266.3,394.1 L270.7,400.6 L268.2,403.2 L273.6,405.4 L270.8,403.7 L272.5,407.6 L263.2,412.1 L267.2,427.7 L261.5,436.4 L263.0,439.0 L255.8,437.5 L230.2,448.9 L223.7,449.5 L226.6,445.1 L219.7,447.1 L226.2,443.4 L217.6,444.7 L224.1,439.5 L216.1,439.1 L235.8,431.9 L222.4,433.3 L233.6,425.1 L219.4,421.1 L226.4,414.0 L222.1,414.3 L220.5,408.5 L237.8,408.8 L242.6,402.8 L235.1,401.9 L239.6,400.9 L240.9,394.8 L248.2,392.9 L248.1,397.9 L251.2,391.4 L256.4,393.5 L252.8,396.1Z","cx":243.3,"cy":417.6},"Moldova":{"d":"M640.1,493.2 L651.1,490.0 L668.8,496.6 L669.3,503.7 L673.8,505.3 L673.7,510.2 L680.1,516.9 L667.5,515.9 L666.8,522.1 L658.1,529.2 L656.5,509.5 L640.1,493.2Z","cx":662.2,"cy":507.2},"San Marino":{"d":"M477.5,548.2 L477.5,548.1 L477.5,548.0 L477.5,548.0 L477.5,547.9 L477.5,547.9 L477.5,547.8 L477.5,547.8 L477.5,547.7 L477.5,547.7 L477.5,547.7 L477.6,547.6 L477.6,547.6 L477.7,547.6 L477.7,547.6 L477.8,547.6 L477.8,547.5 L477.9,547.5 L477.9,547.5 L477.9,547.5 L477.9,547.4 L478.0,547.4 L478.0,547.3 L478.0,547.3 L478.1,547.3 L478.1,547.3 L478.2,547.3 L478.2,547.3 L478.3,547.3 L478.4,547.2Z","cx":477.8,"cy":547.6},"Estonia":{"d":"M655.8,324.2 L657.9,326.4 L649.1,335.8 L649.7,345.7 L653.7,351.5 L648.2,357.2 L638.8,357.2 L624.9,347.9 L613.5,351.4 L616.4,344.0 L606.9,343.5 L604.2,337.7 L607.6,335.9 L603.5,336.5 L605.9,333.0 L603.9,328.9 L619.0,322.7 L655.8,324.2Z","cx":628.6,"cy":339.1},"Austria":{"d":"M528.7,486.7 L531.0,500.2 L523.7,500.4 L526.7,502.4 L523.7,504.1 L524.5,508.6 L518.9,513.8 L502.3,517.3 L477.8,513.3 L475.3,508.2 L461.6,512.3 L450.7,511.2 L444.7,506.0 L447.9,501.7 L451.9,505.8 L455.5,501.8 L464.0,504.2 L475.8,499.8 L484.3,503.3 L481.5,494.8 L492.6,489.5 L493.6,486.0 L503.7,488.7 L507.1,482.9 L528.7,486.7Z","cx":491.0,"cy":501.2},"Belgium":{"d":"M374.2,450.4 L380.9,452.7 L393.3,448.9 L402.6,453.6 L400.8,459.1 L405.5,459.6 L408.9,465.0 L401.2,471.0 L402.5,475.7 L398.3,476.3 L391.2,472.3 L391.4,467.4 L383.1,469.7 L383.9,465.9 L365.8,458.2 L364.8,454.4 L374.2,450.4Z","cx":389.6,"cy":461.8},"Bosnia and Herzegovina":{"d":"M536.6,559.9 L520.2,544.7 L515.6,537.0 L516.7,532.1 L557.2,536.5 L554.0,542.7 L559.9,546.5 L555.6,546.9 L558.7,552.3 L552.3,553.1 L553.7,556.2 L549.4,556.2 L546.6,564.5 L536.6,559.9Z","cx":543.8,"cy":549.2},"Montenegro":{"d":"M553.7,553.1 L567.6,560.0 L564.1,560.9 L565.1,564.5 L560.1,564.0 L556.1,569.0 L557.1,573.0 L546.7,565.4 L547.0,559.6 L551.1,555.0 L553.7,556.2 L553.7,553.1Z","cx":556.3,"cy":561.1},"Bulgaria":{"d":"M647.4,545.5 L662.4,550.2 L661.1,554.8 L654.7,556.9 L654.6,562.7 L649.4,565.5 L655.9,571.4 L640.0,571.4 L633.7,574.6 L634.4,578.8 L624.2,579.9 L616.0,576.2 L600.6,579.1 L591.3,567.4 L592.2,561.4 L598.7,556.8 L591.3,549.3 L595.1,544.1 L599.3,549.5 L625.6,551.7 L647.4,545.5Z","cx":627.4,"cy":561.6},"Belarus":{"d":"M657.6,379.3 L671.9,382.3 L672.8,386.5 L681.2,383.7 L689.1,387.8 L690.3,396.5 L687.5,400.3 L699.6,411.4 L698.7,415.3 L709.9,420.3 L704.0,425.6 L693.0,426.8 L699.0,440.0 L689.3,440.7 L684.9,452.2 L680.6,448.8 L670.7,450.3 L668.1,446.7 L664.3,449.9 L658.7,446.4 L652.8,449.2 L630.3,442.5 L614.5,443.2 L605.3,448.3 L606.1,441.0 L600.5,437.5 L609.2,431.3 L604.3,413.1 L630.4,409.9 L627.7,407.4 L630.4,399.2 L642.2,392.8 L638.1,391.9 L639.9,386.7 L657.6,379.3Z","cx":658.9,"cy":419.0},"Croatia":{"d":"M525.5,516.2 L539.1,524.6 L550.9,523.5 L552.7,530.1 L557.6,531.8 L553.3,536.5 L529.0,531.3 L522.6,534.7 L516.1,532.7 L520.2,544.7 L537.7,559.7 L528.7,554.4 L519.0,553.4 L508.4,543.9 L513.2,543.8 L506.9,539.8 L505.3,533.4 L499.5,530.3 L494.3,537.1 L490.0,528.6 L502.6,526.3 L511.0,529.1 L510.5,525.6 L515.1,524.2 L514.6,519.5 L525.5,516.2Z","cx":521.1,"cy":533.5},"Hungary":{"d":"M588.9,490.9 L597.4,497.0 L587.3,502.8 L576.3,519.2 L542.4,525.2 L534.1,522.8 L519.8,511.3 L526.7,502.4 L523.7,500.4 L531.0,500.2 L532.9,496.1 L545.3,499.8 L567.6,493.0 L570.1,489.3 L588.9,490.9Z","cx":555.5,"cy":502.8},"Czech Republic":{"d":"M473.9,465.1 L476.6,467.2 L498.7,455.8 L504.9,458.2 L509.1,455.5 L522.5,460.5 L521.0,463.8 L526.9,468.2 L530.3,466.3 L528.7,463.5 L538.4,465.3 L537.1,467.7 L547.7,470.7 L551.2,476.1 L529.4,488.2 L507.1,482.9 L503.7,488.7 L496.2,488.2 L480.4,477.3 L473.9,465.1Z","cx":512.9,"cy":469.7},"Denmark":{"d":"M444.3,399.5 L434.6,398.4 L432.4,395.3 L435.0,395.0 L434.4,391.0 L428.2,388.8 L428.6,381.9 L431.6,383.3 L428.4,381.6 L428.7,372.4 L435.5,374.0 L439.4,368.8 L439.3,372.7 L442.8,373.1 L441.4,366.2 L449.1,364.8 L434.8,366.5 L433.5,372.4 L429.9,369.0 L457.4,353.6 L453.9,365.7 L449.8,364.4 L453.9,370.2 L448.5,371.5 L461.0,374.6 L458.4,379.3 L452.5,379.2 L452.2,384.3 L448.6,384.2 L450.2,386.2 L445.6,386.4 L448.2,387.5 L444.3,389.6 L446.7,393.2 L443.5,396.6 L447.3,398.8 L444.3,399.5Z","cx":442.7,"cy":380.5},"Finland":{"d":"M655.9,102.3 L670.5,116.9 L660.7,132.0 L664.9,133.6 L661.0,140.6 L663.7,148.7 L678.9,160.4 L668.0,179.0 L680.1,204.4 L675.5,206.0 L674.0,214.1 L677.1,216.9 L674.1,219.4 L685.6,238.3 L678.6,245.0 L696.7,261.4 L651.4,306.8 L638.7,307.3 L639.9,303.7 L636.8,308.5 L632.1,306.6 L634.1,309.3 L632.0,310.7 L597.5,318.5 L602.4,314.8 L597.2,312.5 L599.2,308.9 L592.3,310.8 L594.4,308.4 L580.4,304.8 L580.6,288.4 L583.9,287.7 L576.4,267.5 L583.5,259.2 L581.4,255.7 L590.8,254.5 L589.4,250.6 L593.9,245.9 L605.5,239.5 L617.8,223.1 L626.6,220.4 L623.9,217.0 L625.3,209.4 L617.7,206.2 L617.4,200.9 L612.5,203.2 L606.8,193.9 L610.1,180.7 L605.1,172.5 L607.3,166.7 L603.5,165.7 L606.1,154.4 L571.0,127.7 L583.5,122.2 L591.7,136.3 L610.5,133.6 L620.5,139.9 L630.7,129.0 L632.7,111.6 L655.9,102.3Z","cx":625.9,"cy":218.6},"France":{"d":"M368.9,459.9 L383.9,465.9 L383.1,469.7 L391.4,467.4 L391.2,472.3 L398.3,476.3 L429.7,483.6 L424.9,488.6 L422.4,501.8 L415.6,503.0 L403.9,519.6 L413.4,516.7 L416.2,523.1 L413.4,525.0 L417.8,529.6 L411.4,533.4 L415.8,536.6 L414.4,542.0 L423.8,546.2 L406.4,558.6 L393.6,555.1 L395.5,553.2 L393.2,552.5 L390.8,554.9 L382.1,552.4 L370.5,557.9 L372.0,566.0 L366.2,567.2 L319.3,558.7 L319.6,555.9 L315.0,554.6 L318.6,552.4 L323.9,538.7 L321.3,538.6 L323.2,527.8 L330.1,534.8 L321.5,525.9 L324.5,525.8 L323.0,518.2 L315.1,516.0 L310.1,507.7 L315.0,506.4 L307.2,505.6 L308.7,502.9 L285.9,499.0 L281.7,495.9 L286.6,495.1 L282.9,492.7 L286.6,490.7 L281.3,492.0 L281.5,489.2 L298.9,484.8 L305.4,489.4 L319.3,487.6 L313.5,473.3 L333.2,479.4 L340.2,476.9 L336.6,476.2 L337.8,473.6 L354.7,467.0 L353.7,457.6 L364.8,454.4 L368.9,459.9Z","cx":354.3,"cy":510.8},"Germany":{"d":"M443.7,399.9 L449.0,400.4 L448.5,405.1 L451.7,406.9 L462.8,406.4 L460.3,412.9 L484.3,405.8 L498.7,416.2 L500.8,423.1 L497.2,429.6 L503.0,433.4 L502.6,444.2 L507.6,452.0 L504.9,458.2 L498.7,455.8 L476.6,467.2 L473.9,465.1 L480.4,477.3 L493.6,486.0 L492.6,489.5 L481.5,494.8 L484.3,503.3 L475.8,499.8 L464.0,504.2 L455.5,501.8 L451.9,505.8 L449.6,502.3 L433.5,498.9 L432.8,501.8 L422.8,502.1 L422.6,494.3 L429.7,483.6 L408.4,476.9 L410.3,472.1 L405.8,467.8 L408.5,463.3 L402.8,455.5 L406.8,450.6 L403.9,444.0 L412.6,443.0 L416.3,438.2 L412.2,433.6 L416.3,432.2 L418.6,417.2 L427.4,416.8 L432.7,421.2 L434.9,413.9 L448.0,419.0 L438.1,413.8 L438.1,407.6 L434.0,407.4 L438.7,405.1 L434.6,398.4 L443.7,399.9Z","cx":450.5,"cy":448.6},"Greece":{"d":"M635.4,574.2 L640.1,578.5 L634.3,585.8 L621.9,582.9 L606.9,585.8 L614.5,592.6 L606.7,590.6 L609.9,595.0 L603.2,591.3 L607.1,595.3 L602.7,595.0 L596.5,588.9 L597.9,587.2 L593.9,589.0 L593.9,594.3 L602.5,603.7 L599.2,604.8 L601.1,603.8 L598.0,601.8 L599.3,605.5 L593.2,607.2 L610.8,614.9 L610.9,620.1 L604.5,616.7 L598.5,618.4 L604.6,623.4 L600.7,625.0 L595.4,622.0 L600.8,634.5 L594.4,630.4 L592.7,635.0 L589.0,628.1 L583.8,630.3 L583.3,623.6 L577.0,619.0 L580.0,614.9 L585.4,613.4 L596.9,617.8 L601.2,615.4 L592.4,612.4 L576.8,613.1 L572.7,607.8 L577.6,606.1 L572.7,606.5 L564.4,598.0 L571.9,593.4 L575.5,584.6 L612.8,576.3 L624.2,579.9 L634.4,578.8 L635.4,574.2Z","cx":599.6,"cy":603.7},"Iceland":{"d":"M91.4,199.3 L90.7,205.1 L86.9,203.3 L94.6,216.2 L96.3,207.5 L102.6,208.5 L102.3,196.5 L113.4,204.2 L113.4,197.3 L121.0,194.2 L129.2,206.0 L126.2,195.0 L136.7,199.3 L140.2,193.7 L148.0,195.2 L146.5,187.4 L159.9,195.2 L169.3,190.0 L162.5,196.2 L168.1,197.4 L166.4,204.3 L171.9,203.0 L169.6,208.2 L180.2,208.8 L176.1,213.8 L180.6,214.0 L175.3,215.5 L181.5,218.0 L173.2,219.1 L179.1,221.0 L170.2,223.9 L172.5,226.9 L165.3,234.5 L160.0,232.7 L120.1,251.9 L105.2,249.2 L95.2,241.2 L76.5,243.9 L76.4,238.3 L87.5,236.5 L85.1,235.4 L90.5,232.0 L83.2,233.8 L89.8,226.9 L81.4,230.2 L79.2,226.6 L82.1,225.1 L79.1,223.5 L60.8,221.9 L86.7,218.6 L78.2,215.7 L86.4,210.5 L55.5,208.8 L63.6,208.4 L60.2,202.5 L69.5,205.4 L62.9,201.3 L69.3,201.4 L63.5,198.1 L68.4,196.3 L66.2,194.9 L80.2,200.3 L73.0,193.4 L80.1,192.5 L70.7,190.6 L73.5,188.2 L91.4,199.3Z","cx":112.1,"cy":211.5},"Latvia":{"d":"M613.4,353.7 L624.9,347.9 L638.8,357.2 L650.5,357.0 L654.1,360.8 L651.6,368.1 L655.0,368.5 L658.4,377.4 L651.2,384.9 L639.9,386.7 L620.3,374.5 L575.6,378.5 L576.4,368.2 L584.3,356.2 L594.2,353.4 L606.4,366.2 L614.7,361.3 L613.4,353.7Z","cx":623.5,"cy":365.2},"Italy":{"d":"M455.3,511.1 L475.3,508.2 L477.8,513.3 L492.5,515.5 L488.7,518.4 L494.1,527.4 L485.8,525.1 L474.7,530.8 L478.7,535.8 L476.0,537.0 L476.5,542.8 L491.1,552.3 L496.4,563.8 L504.0,570.0 L520.6,572.5 L517.7,577.1 L541.6,587.1 L547.3,592.9 L545.9,596.6 L540.2,591.5 L529.4,589.1 L524.2,597.4 L531.8,601.3 L532.3,605.6 L525.7,607.9 L519.3,618.0 L514.9,617.7 L516.6,610.2 L521.1,606.8 L514.3,593.7 L510.2,594.2 L504.6,586.8 L499.5,587.9 L500.9,585.9 L496.2,585.3 L492.4,580.0 L484.7,580.3 L468.7,567.7 L463.1,566.8 L455.7,560.0 L451.0,546.9 L435.8,541.8 L421.8,549.7 L423.4,544.9 L415.0,543.1 L415.8,536.6 L411.4,533.4 L417.8,529.6 L413.5,524.3 L425.5,523.2 L432.3,516.4 L438.9,524.4 L441.7,516.0 L451.8,519.1 L450.8,515.1 L455.1,515.3 L455.3,511.1Z","cx":481.5,"cy":557.9},"Lithuania":{"d":"M596.1,406.8 L596.1,397.7 L578.8,393.3 L576.3,380.4 L587.9,375.0 L611.7,377.5 L620.3,374.5 L639.9,386.7 L638.1,391.9 L642.2,392.8 L630.4,399.2 L627.7,407.4 L630.4,409.9 L605.9,413.8 L596.1,406.8Z","cx":611.9,"cy":394.2},"Luxembourg":{"d":"M401.8,476.0 L404.1,467.2 L410.3,472.1 L408.4,476.9 L401.8,476.0Z","cx":405.3,"cy":473.6},"Monaco":{"d":"M420.2,550.4 L420.2,550.4 L420.2,550.3 L420.2,550.3 L420.1,550.3 L420.1,550.2 L420.1,550.2 L420.2,550.1 L420.2,550.1 L420.3,550.1 L420.3,550.0 L420.3,550.0 L420.4,550.0 L420.4,550.0 L420.4,549.9 L420.5,549.9 L420.5,549.9 L420.6,549.9 L420.6,549.9 L420.7,549.9 L420.7,550.0 L420.7,550.0 L420.7,550.0 L420.8,550.1 L420.7,550.1 L420.7,550.1 L420.6,550.1 L420.6,550.2 L420.6,550.2 L420.5,550.2Z","cx":420.4,"cy":550.1},"Romania":{"d":"M636.5,493.9 L644.3,494.3 L656.5,509.5 L658.6,516.6 L656.4,527.4 L659.3,530.5 L674.8,531.2 L674.1,536.6 L667.1,538.6 L668.4,535.1 L665.6,535.8 L664.8,539.2 L667.1,538.8 L664.1,540.1 L662.4,550.2 L647.4,545.5 L625.6,551.7 L596.9,548.9 L599.0,546.1 L592.4,541.2 L595.8,540.1 L592.1,538.3 L588.8,541.2 L580.3,537.5 L581.3,532.5 L573.2,528.7 L573.4,525.1 L567.3,520.7 L577.9,518.0 L587.3,502.8 L600.6,495.0 L620.3,500.1 L636.5,493.9Z","cx":625.9,"cy":528.0},"Poland":{"d":"M560.5,405.3 L597.0,406.2 L604.1,410.3 L609.2,431.3 L600.5,437.5 L606.1,441.0 L604.7,447.4 L611.5,462.1 L594.9,475.4 L597.2,483.0 L582.7,477.2 L561.9,480.5 L558.3,474.9 L552.6,477.8 L547.7,470.7 L539.1,469.4 L538.4,465.3 L528.7,463.5 L530.3,466.3 L526.9,468.2 L521.0,463.8 L522.5,460.5 L509.1,455.5 L505.2,457.6 L507.6,452.0 L502.6,444.2 L503.0,433.4 L497.2,429.6 L500.8,423.1 L498.9,416.9 L502.5,418.4 L502.9,414.6 L498.3,413.4 L539.8,400.0 L550.7,402.7 L546.1,401.2 L549.7,406.7 L560.5,405.3Z","cx":546.6,"cy":442.4},"Portugal":{"d":"M235.0,572.3 L242.0,569.4 L242.7,573.4 L260.5,571.6 L264.9,576.0 L256.6,582.6 L258.1,590.6 L255.5,598.2 L249.6,598.3 L256.2,605.3 L251.9,612.1 L256.4,615.3 L249.8,621.9 L250.9,626.3 L246.7,627.8 L233.4,628.3 L235.7,611.0 L230.3,612.5 L233.0,606.7 L227.2,608.3 L236.9,583.0 L235.0,572.3Z","cx":245.8,"cy":598.3},"Slovakia":{"d":"M529.4,488.2 L547.9,476.5 L558.3,474.9 L561.9,480.5 L578.9,477.0 L593.5,482.0 L588.3,491.4 L570.1,489.3 L567.6,493.0 L545.3,499.8 L532.1,496.4 L528.2,491.5 L529.4,488.2Z","cx":556.2,"cy":486.8},"Spain":{"d":"M352.1,564.1 L373.6,567.3 L372.1,572.7 L343.8,585.1 L345.9,586.1 L331.9,600.9 L338.4,608.8 L329.8,613.9 L325.9,620.3 L327.8,621.3 L314.9,625.3 L310.9,631.3 L285.4,631.3 L271.7,639.2 L265.4,636.0 L263.3,629.5 L256.0,625.1 L250.9,626.3 L249.8,621.9 L256.4,615.3 L251.9,612.1 L256.2,605.3 L249.6,598.3 L255.5,598.2 L258.1,590.6 L256.6,582.6 L264.9,576.0 L260.5,571.6 L242.7,573.4 L242.0,569.4 L234.3,572.6 L235.9,563.3 L232.7,565.0 L234.5,561.4 L229.5,560.2 L247.9,549.9 L255.2,553.3 L268.8,551.3 L315.0,554.6 L329.8,561.7 L345.0,561.1 L352.1,564.1Z","cx":285.4,"cy":590.9},"Sweden":{"d":"M571.0,127.7 L606.1,154.4 L603.5,165.7 L607.3,166.7 L605.1,172.5 L610.1,180.7 L606.1,189.5 L611.9,202.4 L591.3,201.4 L589.3,206.5 L591.8,208.3 L586.6,206.0 L589.0,208.4 L581.1,211.7 L583.6,214.1 L578.8,212.6 L582.8,216.4 L576.1,223.0 L582.3,230.6 L572.1,244.2 L557.7,249.1 L543.7,264.1 L538.0,259.9 L542.1,267.6 L533.7,269.7 L537.5,274.5 L534.0,279.8 L535.5,285.8 L530.8,287.2 L532.2,302.9 L540.9,304.5 L553.7,317.1 L549.9,319.4 L553.7,319.8 L543.0,326.8 L538.7,325.4 L536.7,318.5 L538.2,324.8 L518.8,324.0 L548.9,327.0 L544.6,327.2 L546.0,329.7 L540.2,334.9 L537.6,329.6 L534.2,336.8 L521.2,338.3 L529.3,341.2 L524.7,341.6 L527.8,344.1 L527.4,351.2 L523.9,351.1 L526.5,358.1 L516.9,380.4 L503.6,379.1 L498.1,384.6 L498.0,391.2 L482.3,391.2 L484.9,386.4 L478.3,376.9 L482.2,378.0 L480.1,374.7 L483.6,373.2 L472.1,359.9 L469.0,351.9 L471.2,343.6 L464.0,343.7 L462.7,333.3 L468.6,334.0 L470.7,317.8 L478.3,313.8 L479.8,306.8 L475.5,297.5 L482.6,290.6 L474.3,283.9 L476.2,273.9 L472.1,254.4 L480.6,240.7 L495.5,239.7 L497.0,230.5 L492.1,228.4 L501.3,213.0 L501.5,195.5 L512.5,192.2 L511.3,187.9 L522.6,175.9 L519.6,166.9 L526.9,155.6 L540.1,154.5 L542.5,141.2 L563.6,145.3 L568.3,134.5 L565.4,128.2 L571.0,127.7Z","cx":531.8,"cy":271.5},"Ukraine":{"d":"M605.3,448.3 L614.5,443.2 L630.3,442.5 L652.8,449.2 L658.7,446.4 L664.3,449.9 L668.1,446.7 L670.7,450.3 L680.6,448.8 L684.9,452.2 L684.5,447.3 L689.6,440.4 L722.5,436.7 L729.3,444.9 L725.4,446.3 L726.7,452.1 L737.1,452.9 L742.4,464.4 L754.3,466.6 L763.8,463.5 L770.1,470.9 L773.6,468.6 L794.4,474.9 L794.8,479.8 L789.4,483.5 L793.7,484.9 L788.9,488.2 L793.0,493.0 L790.2,498.6 L773.9,501.6 L772.8,508.3 L744.9,514.4 L735.7,521.3 L739.2,518.0 L737.6,516.0 L733.6,520.0 L740.1,530.6 L754.3,530.6 L752.3,533.9 L741.7,533.3 L724.4,542.2 L717.1,539.9 L719.4,539.5 L719.1,533.5 L707.2,530.4 L720.8,524.0 L720.2,520.9 L699.2,518.6 L702.1,517.2 L695.8,514.8 L707.7,514.6 L701.3,513.8 L698.6,506.5 L700.3,514.0 L695.4,514.0 L696.9,511.7 L687.7,515.2 L680.2,524.5 L675.6,527.1 L674.4,524.4 L675.5,532.0 L670.7,529.3 L662.1,531.7 L658.1,529.2 L666.8,522.1 L666.4,516.8 L680.1,516.9 L673.7,510.2 L673.8,505.3 L669.3,503.7 L668.8,496.6 L651.1,490.0 L620.3,500.1 L616.1,497.0 L597.4,497.0 L588.9,490.9 L593.5,482.0 L597.2,483.0 L594.9,475.4 L611.5,462.1 L605.3,448.3Z","cx":698.8,"cy":494.2},"United Kingdom":{"d":"M275.6,349.8 L274.0,345.3 L279.2,345.6 L276.6,343.3 L278.5,338.9 L284.3,341.9 L301.1,338.5 L287.3,351.7 L292.3,352.2 L285.1,356.2 L315.1,356.8 L306.9,372.4 L297.7,375.9 L306.2,377.4 L292.1,379.9 L305.4,380.7 L317.1,388.5 L322.4,402.7 L334.8,410.6 L337.5,418.3 L328.2,416.8 L338.4,421.3 L339.6,425.7 L335.8,428.7 L354.5,430.5 L353.9,440.4 L340.1,449.4 L352.0,450.2 L351.4,453.8 L338.6,459.4 L296.2,460.2 L294.0,466.5 L288.2,463.3 L276.4,470.2 L270.4,468.8 L287.4,453.1 L301.1,453.0 L307.4,445.5 L297.6,450.4 L275.0,443.6 L290.4,433.9 L289.3,428.4 L281.3,430.2 L287.8,424.1 L304.8,422.0 L300.2,419.0 L303.7,408.7 L299.8,411.3 L294.3,404.8 L301.0,397.5 L285.5,398.6 L285.7,402.1 L280.3,399.2 L280.2,402.8 L276.7,398.9 L283.0,389.7 L279.5,386.3 L284.0,382.7 L280.3,381.9 L281.5,378.5 L278.8,383.7 L274.7,381.8 L278.8,377.8 L273.5,381.3 L274.9,385.0 L269.6,392.5 L272.1,376.4 L278.6,370.3 L271.1,373.7 L267.0,371.8 L272.1,370.6 L264.5,370.3 L274.0,364.0 L270.5,361.1 L273.3,358.8 L269.1,359.5 L272.7,357.0 L269.4,351.8 L277.7,352.1 L275.6,349.8Z","cx":294.0,"cy":397.1},"Serbia":{"d":"M565.1,564.5 L564.1,560.9 L567.6,560.0 L553.7,553.1 L558.7,552.3 L555.6,546.9 L559.9,546.5 L554.0,542.7 L557.2,536.5 L553.3,536.5 L553.8,533.2 L557.6,531.8 L552.7,530.1 L550.9,523.5 L559.4,520.0 L573.4,525.1 L573.2,528.7 L581.3,532.5 L580.3,537.5 L588.8,541.2 L592.1,538.3 L595.8,540.1 L592.4,541.2 L595.1,544.1 L591.3,549.3 L598.7,556.8 L592.2,561.4 L593.1,566.4 L576.9,568.8 L572.3,572.9 L565.1,564.5Z","cx":571.8,"cy":545.4},"Malta":{"d":"M504,628 L508,628 L508,631 L504,631 L504,628Z","cx":506,"cy":629},"Russia":{"d":"M658,103 L704,128 L771,116 L794,174 L805,217 L794,275 L760,293 L704,310 L681,310 L658,352 L658,328 L625,310 L647,275 L658,103Z","cx":708,"cy":235},"Vatican City":{"d":"M483,563 L483,563 L483,563 L483,563 L483,563Z","cx":483,"cy":563}},"mexico":{"Mexico City":{"d":"M522.7,484.4 L526.4,493.0 L523.5,498.4 L515.9,491.4 L521.9,481.8 L522.7,484.4Z","cx":522.2,"cy":488.9},"Guerrero":{"d":"M486.5,504.6 L492.3,519.1 L507.6,506.4 L512.6,508.4 L516.1,516.1 L521.5,516.2 L525.0,524.5 L531.5,529.0 L529.6,530.0 L539.1,530.7 L537.8,539.2 L541.7,544.3 L541.9,552.1 L549.8,559.2 L544.9,572.8 L540.1,574.0 L540.0,579.0 L536.2,580.9 L530.6,573.8 L508.3,569.5 L473.4,552.3 L454.3,533.3 L445.7,530.5 L445.9,525.3 L453.4,521.5 L453.0,513.9 L455.7,511.9 L462.5,515.5 L480.2,515.8 L483.9,519.7 L480.2,505.2 L486.5,504.6Z","cx":503.4,"cy":533.7},"M\u00e9xico":{"d":"M503.5,461.1 L512.2,464.0 L515.3,476.2 L525.2,467.3 L525.7,475.2 L533.2,473.8 L534.3,499.2 L530.2,501.9 L525.5,497.6 L526.0,490.0 L521.9,481.8 L516.1,490.6 L517.2,501.5 L512.6,508.4 L507.6,506.4 L492.3,519.1 L487.8,510.8 L489.2,506.5 L484.7,503.3 L495.1,486.3 L493.4,479.7 L497.7,473.6 L496.2,467.7 L501.8,467.4 L500.6,462.0 L503.5,461.1Z","cx":509.6,"cy":485.9},"Morelos":{"d":"M523.5,498.4 L530.2,501.9 L534.2,499.4 L531.2,507.7 L532.3,516.7 L529.7,514.5 L523.3,520.2 L521.5,516.2 L516.1,516.1 L512.6,508.4 L517.6,496.2 L523.5,498.4Z","cx":524.6,"cy":507.8},"Sinaloa":{"d":"M288.2,248.4 L295.1,248.5 L294.2,252.6 L299.8,257.2 L298.0,261.1 L303.6,275.4 L316.3,278.2 L317.6,284.1 L325.9,291.3 L319.7,300.3 L321.8,311.9 L332.3,324.2 L337.1,336.1 L343.3,333.4 L348.1,336.7 L353.6,348.3 L351.0,350.2 L352.7,359.2 L355.8,359.2 L358.9,372.1 L365.2,373.9 L362.5,377.9 L363.3,392.0 L358.5,389.5 L357.5,393.2 L327.7,350.2 L300.0,324.5 L288.7,305.4 L265.2,293.3 L263.8,283.3 L267.8,272.7 L283.0,262.8 L288.2,248.4Z","cx":321.3,"cy":315.0},"Baja California":{"d":"M82.7,64.7 L132.0,59.6 L123.7,75.8 L125.9,86.9 L129.8,90.3 L127.7,112.7 L132.4,122.4 L133.3,144.7 L140.3,158.6 L159.1,175.0 L162.2,188.0 L169.2,189.8 L172.4,200.5 L178.8,202.7 L180.9,217.1 L144.9,217.1 L148.9,202.1 L145.9,196.1 L126.2,172.4 L107.5,159.4 L104.7,152.8 L104.9,142.0 L99.8,139.1 L98.7,125.2 L91.5,118.6 L92.3,112.8 L82.8,98.6 L84.3,88.8 L78.0,83.4 L71.9,67.6 L82.7,64.7Z M162.2,166.1 L165.9,174.2 L170.7,174.8 L172.1,184.7 L160.3,170.9 L162.2,166.1Z","cx":130.0,"cy":142.3},"Sonora":{"d":"M129.7,67.3 L223.1,106.7 L281.1,106.7 L277.5,111.1 L282.9,117.7 L276.5,121.0 L276.3,126.7 L283.0,132.7 L286.4,141.8 L284.1,156.8 L286.5,160.0 L283.5,160.7 L281.4,179.0 L288.0,205.0 L273.1,208.2 L277.1,224.4 L283.6,231.9 L284.9,248.3 L289.4,250.3 L283.0,262.8 L268.5,271.4 L264.6,260.4 L255.7,258.9 L250.4,247.4 L235.0,239.3 L234.6,224.3 L237.0,222.2 L229.3,218.6 L227.9,222.3 L220.6,217.3 L195.7,185.3 L194.0,173.9 L189.9,173.2 L190.5,168.5 L181.3,154.1 L181.1,145.4 L173.1,129.1 L172.5,111.5 L159.4,106.9 L159.0,101.7 L153.7,97.8 L146.3,101.2 L127.2,88.6 L123.7,75.8 L129.7,67.3Z M192.7,176.9 L194.9,183.8 L192.3,192.6 L185.4,188.4 L188.1,178.8 L192.7,176.9Z","cx":225.1,"cy":170.2},"Baja California Sur":{"d":"M211.0,263.8 L213.7,265.1 L217.4,289.0 L224.6,297.2 L232.9,317.2 L233.1,334.1 L240.0,339.7 L244.1,334.3 L250.3,343.6 L254.3,343.2 L257.8,356.1 L263.3,359.2 L263.6,370.3 L252.6,380.4 L248.7,378.4 L240.7,358.0 L218.8,338.0 L207.2,335.4 L192.4,320.2 L197.5,289.7 L189.8,273.8 L165.7,256.0 L160.6,259.0 L154.3,250.9 L139.1,243.8 L137.3,236.3 L122.9,222.0 L137.5,224.5 L144.9,217.1 L180.9,217.1 L182.4,225.0 L191.0,231.6 L194.6,242.7 L201.2,246.4 L199.7,250.8 L210.9,259.3 L211.0,263.8Z M223.5,279.4 L223.0,280.6 L223.3,282.8 L222.3,281.7 L220.5,284.7 L220.4,285.9 L219.9,286.5 L220.0,287.8 L219.3,287.3 L219.8,283.9 L220.8,282.0 L220.6,280.3 L221.8,279.5 L222.4,280.0 L223.5,279.4Z","cx":209.8,"cy":288.0},"Zacatecas":{"d":"M460.0,321.4 L470.0,321.0 L481.4,330.7 L476.4,336.3 L475.3,331.5 L473.4,338.7 L469.6,340.1 L470.2,347.7 L455.6,362.5 L446.9,365.5 L444.0,362.6 L442.8,369.3 L445.2,380.8 L453.7,387.3 L455.0,393.1 L462.7,384.6 L466.3,385.6 L467.9,391.9 L464.2,396.4 L466.8,407.8 L461.6,413.6 L442.2,393.5 L433.3,398.6 L428.3,412.0 L433.9,427.3 L427.2,432.3 L423.8,430.5 L421.8,436.9 L410.1,434.5 L407.0,429.1 L412.2,427.7 L407.5,424.2 L411.1,420.8 L410.7,413.8 L422.2,407.3 L423.7,400.9 L417.9,394.9 L413.8,404.2 L407.9,404.3 L410.7,394.1 L406.8,389.9 L403.4,402.5 L401.9,397.4 L406.1,385.3 L402.3,384.4 L398.2,386.1 L401.7,392.5 L399.4,396.4 L398.0,391.1 L395.1,392.0 L395.9,395.5 L391.2,395.7 L394.5,383.4 L398.0,383.7 L395.7,372.5 L398.4,362.0 L405.4,355.4 L403.2,345.0 L409.1,341.7 L414.5,331.6 L438.0,331.7 L433.3,311.4 L438.8,313.6 L438.4,309.9 L442.6,309.6 L453.8,313.0 L460.0,321.4Z","cx":429.8,"cy":378.4},"Durango":{"d":"M351.7,257.1 L359.5,259.7 L363.2,265.4 L372.5,264.9 L373.6,268.2 L379.8,265.4 L385.6,270.8 L393.2,254.6 L415.6,262.3 L418.5,272.6 L416.5,290.5 L412.7,296.4 L416.6,301.7 L412.4,304.8 L422.6,319.1 L428.6,321.8 L433.3,311.4 L435.8,316.7 L438.0,331.7 L414.5,331.6 L409.1,341.7 L403.2,345.0 L405.4,355.4 L398.4,362.0 L395.7,372.5 L398.0,383.7 L394.5,383.4 L392.6,393.0 L387.3,397.0 L380.5,387.7 L375.3,392.2 L373.2,387.3 L377.7,384.8 L374.9,377.3 L366.9,378.4 L364.6,372.9 L358.9,372.1 L355.8,359.2 L352.3,358.1 L351.2,348.1 L353.6,348.3 L348.1,336.7 L343.3,333.4 L337.1,336.1 L332.3,324.2 L321.8,311.9 L320.7,295.7 L325.1,292.5 L333.7,295.8 L338.4,289.9 L336.1,291.5 L336.0,284.5 L345.5,256.9 L351.7,257.1Z","cx":377.5,"cy":323.6},"Chihuahua":{"d":"M328.3,91.4 L340.5,93.2 L344.5,101.7 L374.8,128.4 L386.4,161.8 L417.3,184.2 L401.0,222.4 L406.4,248.8 L403.7,252.9 L407.5,258.4 L393.2,254.6 L385.6,270.8 L379.8,265.4 L373.6,268.2 L372.5,264.9 L363.2,265.4 L348.8,254.5 L336.3,283.2 L336.1,291.5 L338.4,289.9 L333.7,295.8 L325.1,292.5 L316.3,278.2 L303.6,275.4 L298.0,261.1 L299.8,257.2 L294.2,252.6 L295.1,248.5 L284.9,248.3 L283.6,231.9 L277.1,224.4 L273.1,208.2 L288.0,205.0 L281.4,179.0 L283.5,160.7 L286.5,160.0 L284.1,156.8 L286.4,141.8 L283.0,132.7 L276.3,126.7 L276.5,121.0 L282.9,117.7 L278.0,109.8 L294.8,106.7 L294.8,91.5 L328.3,91.4Z","cx":327.1,"cy":204.9},"Colima":{"d":"M409.5,484.3 L412.8,489.6 L412.8,501.0 L406.5,509.5 L391.2,496.4 L382.7,494.5 L396.9,490.1 L398.5,484.7 L404.5,487.4 L409.5,484.3Z M225.3,504.3 L227.0,506.2 L226.9,508.2 L226.2,508.6 L225.7,507.9 L224.5,507.5 L223.7,505.9 L224.5,505.5 L225.3,504.3Z","cx":318.6,"cy":499.0},"Nayarit":{"d":"M374.9,377.3 L377.7,384.8 L373.2,387.3 L375.3,392.2 L380.5,387.7 L387.3,397.0 L392.7,396.4 L390.9,408.5 L395.2,408.2 L396.7,414.2 L401.9,414.8 L401.9,420.4 L407.0,425.5 L404.5,431.0 L394.5,433.2 L394.9,439.9 L390.6,445.3 L393.6,450.8 L381.7,438.3 L372.8,441.0 L368.0,448.7 L362.0,445.7 L369.0,437.0 L370.3,424.9 L359.1,408.5 L356.0,391.0 L364.0,391.4 L361.9,383.6 L364.7,374.2 L366.9,378.4 L374.9,377.3Z M333.7,417.2 L335.6,417.6 L336.6,418.3 L336.5,419.0 L337.3,420.0 L336.6,421.7 L336.3,421.2 L334.2,420.0 L333.6,418.4 L333.7,417.2Z","cx":369.7,"cy":413.3},"Michoac\u00e1n":{"d":"M451.3,458.8 L452.1,463.4 L463.5,459.4 L466.0,461.7 L464.9,468.0 L474.7,466.9 L474.9,470.8 L481.3,472.0 L490.9,469.7 L491.2,460.5 L495.5,463.1 L497.7,473.6 L493.5,478.5 L495.1,486.3 L489.7,498.0 L480.2,505.2 L483.9,519.7 L480.2,515.8 L462.5,515.5 L455.7,511.9 L453.0,513.9 L453.4,521.5 L445.9,525.3 L445.2,532.8 L412.7,520.3 L406.5,509.5 L409.5,503.1 L419.4,499.2 L421.9,502.0 L426.0,494.6 L433.2,493.4 L436.4,486.7 L430.2,479.7 L431.7,472.5 L424.6,470.6 L424.2,465.2 L429.6,466.1 L439.2,458.9 L451.3,458.8Z","cx":454.8,"cy":487.0},"Jalisco":{"d":"M401.9,397.4 L403.4,402.5 L406.8,389.9 L410.7,394.1 L407.9,404.3 L413.8,404.2 L417.9,394.9 L423.6,400.3 L422.2,407.3 L410.7,413.8 L411.1,420.8 L407.6,422.3 L412.2,427.7 L407.1,430.4 L416.3,437.3 L423.1,436.3 L423.8,430.5 L427.2,432.3 L433.9,427.3 L434.2,422.1 L429.9,417.9 L432.7,415.4 L441.9,419.4 L454.0,410.6 L453.5,406.8 L462.2,413.9 L459.0,422.3 L460.7,425.7 L448.0,443.9 L451.2,450.7 L447.6,457.6 L439.2,458.9 L429.6,466.1 L424.2,465.2 L424.6,470.6 L431.7,472.5 L430.2,479.7 L436.4,486.7 L433.2,493.4 L426.0,494.6 L421.9,502.0 L419.4,499.2 L412.8,501.0 L412.8,489.6 L409.5,484.3 L404.5,487.4 L398.5,484.7 L396.9,490.1 L386.9,492.0 L385.2,495.3 L379.7,492.7 L368.4,479.2 L357.8,458.1 L368.6,452.2 L371.5,442.3 L379.1,438.0 L386.4,441.3 L393.6,450.8 L390.6,445.3 L394.9,439.9 L394.5,433.2 L404.5,431.0 L407.0,425.5 L401.9,420.4 L401.9,414.8 L396.7,414.2 L395.2,408.2 L390.9,408.5 L390.9,404.2 L395.1,392.0 L398.0,391.1 L397.6,396.7 L401.0,394.2 L399.3,384.6 L405.5,385.0 L401.9,397.4Z","cx":412.5,"cy":437.3},"Chiapas":{"d":"M704.6,533.2 L708.2,547.0 L714.5,549.1 L714.3,553.9 L732.3,568.8 L740.1,580.2 L739.0,588.2 L706.7,588.2 L694.8,612.5 L698.5,618.2 L694.3,634.2 L666.7,602.6 L649.1,589.8 L646.5,576.6 L653.5,555.5 L662.2,546.9 L668.0,530.8 L674.0,535.0 L673.9,541.7 L681.2,550.1 L698.2,534.0 L704.6,533.2Z","cx":692.1,"cy":566.8},"Tabasco":{"d":"M691.7,516.3 L695.6,516.3 L697.3,527.4 L709.0,534.0 L712.1,525.1 L725.3,531.4 L725.3,552.8 L714.0,552.8 L714.5,549.1 L708.2,547.0 L704.6,533.2 L698.2,534.0 L681.2,550.1 L673.9,541.7 L674.0,535.0 L668.0,530.8 L659.8,550.9 L657.6,548.7 L659.5,544.0 L647.9,534.2 L646.7,523.8 L665.1,517.1 L677.4,516.9 L688.3,510.5 L691.7,516.3Z","cx":687.5,"cy":533.6},"Oaxaca":{"d":"M584.3,511.1 L588.6,512.9 L594.6,525.3 L604.2,526.3 L602.6,539.2 L607.4,544.8 L619.0,538.1 L618.0,541.9 L627.7,551.0 L626.9,554.6 L653.3,556.3 L646.5,576.6 L650.0,590.3 L636.5,584.7 L621.5,584.8 L614.1,591.1 L586.1,600.6 L536.2,580.9 L541.3,577.1 L540.1,574.0 L544.9,572.8 L549.8,559.2 L541.9,552.1 L541.7,544.3 L537.8,539.2 L539.4,534.3 L549.2,530.5 L554.5,532.8 L557.5,529.6 L553.9,529.7 L555.4,521.6 L558.9,521.8 L563.0,529.4 L573.9,525.5 L582.6,519.2 L584.3,511.1Z","cx":583.0,"cy":547.6},"Guanajuato":{"d":"M469.6,413.4 L484.6,423.0 L493.1,417.4 L501.4,424.4 L505.6,423.3 L508.2,429.5 L504.3,433.8 L500.3,431.9 L497.7,440.7 L486.0,443.9 L487.8,456.3 L491.9,461.6 L490.9,469.7 L476.0,471.5 L474.7,466.9 L464.9,468.0 L466.0,461.7 L463.5,459.4 L452.1,463.4 L451.3,458.8 L447.6,457.6 L451.2,450.7 L448.0,443.9 L460.7,425.7 L460.4,414.6 L469.6,413.4Z","cx":477.2,"cy":443.2},"Aguascalientes":{"d":"M443.7,396.1 L449.1,398.4 L454.0,410.6 L441.9,419.4 L428.7,413.9 L433.3,398.6 L442.2,393.5 L443.7,396.1Z","cx":442.1,"cy":403.3},"Quer\u00e9taro":{"d":"M520.3,417.9 L523.6,433.7 L515.3,435.5 L512.4,449.1 L504.3,452.7 L503.5,461.1 L500.6,462.0 L501.8,467.4 L495.0,467.0 L495.5,463.1 L487.8,456.3 L486.0,443.9 L497.7,440.7 L500.3,431.9 L507.7,431.4 L505.1,427.6 L506.3,420.8 L514.6,425.4 L520.3,417.9Z","cx":505.2,"cy":442.4},"San Luis Potos\u00ed":{"d":"M484.9,332.5 L488.9,355.3 L488.0,370.5 L491.7,371.5 L493.0,366.9 L497.4,369.3 L499.4,374.7 L497.5,384.0 L512.2,388.6 L513.1,384.7 L519.2,394.9 L533.2,395.1 L541.9,400.2 L535.5,408.9 L538.6,415.0 L533.9,419.1 L537.4,426.6 L532.9,428.1 L534.8,432.4 L529.4,433.7 L526.4,429.0 L522.4,429.4 L520.3,417.9 L512.3,425.7 L506.3,420.8 L502.3,424.8 L493.1,417.4 L484.6,423.0 L475.5,415.4 L462.6,413.6 L466.8,407.8 L464.2,396.4 L467.9,391.9 L466.3,385.6 L462.7,384.6 L455.0,393.1 L453.7,387.3 L445.2,380.8 L444.0,362.6 L446.9,365.5 L455.6,362.5 L470.2,347.7 L469.6,340.1 L473.4,338.7 L475.3,331.5 L476.4,336.3 L482.2,329.7 L484.9,332.5Z","cx":493.1,"cy":388.4},"Tlaxcala":{"d":"M549.0,478.6 L558.8,490.5 L545.8,496.7 L532.3,483.0 L540.4,481.3 L541.7,477.9 L549.0,478.6Z","cx":545.3,"cy":483.8},"Puebla":{"d":"M556.2,444.3 L556.3,449.6 L561.5,454.4 L556.7,455.5 L556.5,463.4 L560.3,466.9 L565.5,461.7 L571.5,465.7 L564.3,483.4 L566.0,488.4 L575.3,491.4 L574.0,495.8 L568.5,496.9 L566.4,509.4 L573.0,516.2 L577.5,513.6 L581.8,518.2 L578.6,522.9 L563.3,529.4 L558.9,521.8 L555.1,521.7 L554.3,531.1 L557.5,529.6 L554.5,532.8 L549.2,530.5 L539.4,534.3 L539.1,530.7 L529.6,530.0 L531.5,529.0 L523.3,520.2 L529.7,514.5 L532.3,516.7 L533.7,485.7 L545.8,496.7 L558.8,490.5 L548.5,477.7 L544.0,479.3 L542.1,473.8 L547.5,465.0 L542.9,461.3 L552.3,451.4 L553.0,443.7 L556.2,444.3Z","cx":554.7,"cy":493.9},"Hidalgo":{"d":"M538.3,427.0 L536.4,430.5 L546.2,436.0 L543.8,445.1 L539.4,443.3 L536.2,448.2 L539.4,446.4 L535.1,454.2 L536.3,458.2 L548.3,448.7 L550.4,453.5 L542.9,461.3 L547.5,465.0 L542.1,473.8 L545.1,477.3 L533.4,481.4 L535.1,476.5 L528.2,472.6 L525.7,475.2 L525.2,467.3 L515.3,476.2 L512.2,464.0 L503.5,461.2 L504.3,452.7 L512.4,449.1 L515.3,435.5 L523.6,433.7 L526.4,429.0 L527.9,433.1 L532.6,433.6 L535.0,429.6 L532.9,428.1 L538.3,427.0Z","cx":532.0,"cy":451.3},"Veracruz":{"d":"M550.7,397.4 L555.4,399.6 L557.3,408.6 L566.7,421.4 L564.5,431.5 L570.5,448.8 L588.8,474.1 L592.6,490.1 L603.4,505.0 L629.6,513.9 L636.0,525.1 L646.7,523.8 L647.9,534.2 L659.5,544.0 L658.4,552.7 L653.3,556.3 L626.9,554.6 L627.7,551.0 L618.0,541.9 L619.0,538.1 L610.0,544.3 L604.9,542.1 L602.6,539.2 L604.2,526.3 L594.6,525.3 L588.6,512.9 L582.9,509.9 L582.6,519.2 L580.1,514.7 L573.0,516.2 L566.4,509.4 L568.5,496.9 L574.0,495.8 L575.3,491.4 L566.0,488.4 L564.3,483.4 L571.3,464.4 L563.9,461.8 L560.3,466.9 L556.5,463.4 L556.7,455.5 L561.5,454.4 L556.3,449.6 L555.7,444.0 L553.0,443.7 L550.4,453.5 L548.3,448.7 L538.5,459.1 L535.1,454.2 L538.9,443.7 L544.4,444.2 L546.2,436.0 L536.4,430.5 L538.3,427.0 L533.9,419.1 L538.6,415.0 L535.5,408.9 L541.9,400.2 L533.2,395.1 L545.2,393.2 L550.7,397.4Z","cx":577.1,"cy":476.3},"Nuevo Le\u00f3n":{"d":"M503.9,224.6 L506.8,227.5 L502.0,233.6 L506.0,235.4 L508.7,247.4 L505.8,253.1 L510.5,255.0 L508.5,260.2 L515.1,262.5 L514.2,270.4 L520.1,273.4 L521.0,279.7 L535.4,281.1 L535.5,298.0 L539.4,299.3 L526.6,311.2 L520.8,312.1 L520.4,320.7 L506.7,327.7 L510.2,332.7 L508.6,341.5 L513.6,349.4 L503.5,352.3 L502.0,364.7 L498.0,364.2 L497.4,369.3 L490.6,368.3 L491.7,371.5 L488.0,370.5 L487.1,340.8 L480.0,327.6 L479.3,318.8 L481.8,316.1 L479.5,313.7 L482.3,306.0 L493.9,305.0 L480.5,293.2 L479.1,283.4 L469.8,269.8 L486.5,255.7 L486.5,248.0 L480.0,248.0 L479.1,243.2 L489.5,236.8 L491.2,227.3 L495.3,223.6 L500.0,229.6 L503.9,224.6Z","cx":500.8,"cy":291.0},"Coahuila":{"d":"M478.0,175.1 L482.9,180.7 L492.7,208.1 L503.9,224.6 L500.0,229.6 L495.3,223.6 L491.2,227.3 L489.5,236.8 L479.1,243.2 L480.0,248.0 L486.5,248.0 L486.5,255.7 L469.8,269.8 L479.1,283.4 L480.5,293.2 L494.3,306.6 L479.9,308.3 L480.0,327.6 L473.0,326.5 L466.4,319.5 L459.4,321.2 L453.8,313.0 L444.1,309.8 L438.4,309.9 L438.8,313.6 L433.3,311.4 L428.6,321.8 L422.6,319.1 L412.4,304.8 L416.6,301.7 L412.7,296.4 L416.5,290.5 L418.5,272.6 L415.6,262.3 L403.7,252.9 L406.4,248.8 L401.0,222.4 L403.3,213.4 L417.3,184.2 L422.1,184.9 L428.3,177.0 L432.7,160.5 L440.3,159.2 L441.5,155.6 L465.0,159.0 L468.6,167.2 L478.0,175.1Z","cx":453.4,"cy":252.0},"Tamaulipas":{"d":"M512.6,240.7 L523.0,269.0 L545.2,280.0 L559.1,281.0 L563.7,286.4 L571.3,283.1 L558.0,330.1 L553.7,401.3 L545.2,393.2 L519.2,394.9 L513.1,384.7 L512.2,388.6 L497.5,384.0 L499.4,374.7 L496.4,365.9 L502.0,364.7 L503.5,352.3 L513.6,349.4 L508.6,341.5 L510.2,332.7 L506.7,327.7 L520.4,320.7 L520.8,312.1 L526.6,311.2 L539.4,299.3 L535.5,298.0 L535.4,281.1 L521.0,279.7 L520.1,273.4 L514.7,271.5 L515.1,262.5 L508.5,260.2 L510.5,255.0 L505.8,253.1 L508.7,247.4 L506.0,235.4 L501.8,231.7 L506.8,227.5 L511.1,229.6 L512.6,240.7Z","cx":520.9,"cy":305.4},"Yucat\u00e1n":{"d":"M803.5,421.0 L811.6,423.5 L811.7,438.6 L806.4,449.3 L796.6,460.7 L782.7,466.6 L775.1,478.4 L771.9,478.4 L772.3,482.1 L767.6,483.1 L763.3,478.5 L749.9,454.4 L745.3,456.0 L740.3,452.3 L740.9,439.6 L747.6,433.8 L796.7,419.3 L803.5,421.0Z M756.8,388.7 L760.4,392.0 L759.1,396.1 L756.8,388.7Z","cx":773.6,"cy":441.0},"Campeche":{"d":"M740.5,446.3 L740.3,452.3 L745.3,456.0 L749.9,454.4 L771.3,487.0 L771.2,535.8 L725.3,535.8 L725.3,531.4 L712.1,525.1 L709.0,534.0 L697.3,527.4 L695.6,516.3 L689.6,515.5 L688.3,510.5 L703.6,511.7 L730.9,490.7 L733.5,476.7 L738.8,470.6 L737.4,454.1 L739.9,443.4 L740.5,446.3Z","cx":727.9,"cy":491.5},"Quintana Roo":{"d":"M829.9,432.1 L828.2,443.3 L814.4,462.4 L814.2,472.2 L806.5,479.6 L808.3,484.6 L814.7,481.6 L807.8,492.7 L813.8,490.3 L803.9,524.4 L799.2,525.4 L799.2,517.7 L788.1,515.3 L777.9,533.4 L769.8,531.6 L771.3,487.0 L767.6,483.1 L772.3,482.1 L771.9,478.4 L775.1,478.4 L782.7,466.6 L796.6,460.7 L806.4,449.3 L811.7,438.6 L811.6,423.5 L819.4,425.3 L822.9,420.4 L828.8,430.9 L830.1,426.0 L829.9,432.1Z M831.7,452.0 L825.3,461.0 L826.8,452.4 L831.7,452.0Z","cx":805.6,"cy":470.2}}};

// ─── MAP COMPONENT ──────────────────────────────────────────────────────────
function InteractiveMap({ regionKey, selectedState, onSelectState, fullHeight }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [panStart, setPanStart] = useState(null);
  const [pinchStartDist, setPinchStartDist] = useState(null);
  const [pinchStartZoom, setPinchStartZoom] = useState(null);
  const [didDrag, setDidDrag] = useState(false);

  const bounds = MAP_BOUNDS[regionKey];
  const geo = GEO_DATA[regionKey];
  const regionInfo = REGIONS[regionKey];
  const paths = SVG_PATHS[regionKey] || {};

  useEffect(() => { setPan({ x: 0, y: 0 }); setZoom(1); }, [regionKey]);

  const project = useCallback((lat, lng) => {
    const padding = 50, width = 900, height = 700;
    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - padding * 2);
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const minMerc = Math.log(Math.tan(Math.PI / 4 + bounds.minLat * Math.PI / 360));
    const maxMerc = Math.log(Math.tan(Math.PI / 4 + bounds.maxLat * Math.PI / 360));
    const y = padding + (1 - (mercN - minMerc) / (maxMerc - minMerc)) * (height - padding * 2);
    return { x, y };
  }, [bounds]);

  const getTouchDist = (t) => Math.sqrt((t[0].clientX - t[1].clientX) ** 2 + (t[0].clientY - t[1].clientY) ** 2);

  const handlePointerDown = (e) => {
    if (e.touches && e.touches.length === 2) { setPinchStartDist(getTouchDist(e.touches)); setPinchStartZoom(zoom); return; }
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setDragging(true); setDidDrag(false); setDragStart({ x: cx, y: cy }); setPanStart({ ...pan });
  };
  const handlePointerMove = (e) => {
    if (e.touches && e.touches.length === 2 && pinchStartDist) { setZoom(Math.max(0.5, Math.min(4, pinchStartZoom * (getTouchDist(e.touches) / pinchStartDist)))); return; }
    if (!dragging || !dragStart) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = (cx - dragStart.x) / zoom, dy = (cy - dragStart.y) / zoom;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setDidDrag(true);
    setPan({ x: panStart.x + dx, y: panStart.y + dy });
  };
  const handlePointerUp = (e) => {
    const wasDrag = didDrag;
    setDragging(false); setDragStart(null); setPanStart(null); setPinchStartDist(null); setPinchStartZoom(null);
    // If this was a tap (not a drag) on empty SVG space, deselect
    if (!wasDrag && e && e.target && e.target.tagName === 'svg') {
      onSelectState(null);
    }
  };
  const handleWheel = (e) => { e.preventDefault(); setZoom(z => Math.max(0.5, Math.min(4, z * (e.deltaY > 0 ? 0.9 : 1.1)))); };
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); onSelectState(null); };

  // Inset states: their capitals are not projected to correct map positions
  const INSET_STATES = new Set(["Alaska", "Hawaii"]);

  const stateEntries = useMemo(() => regionInfo.states.map(([name, capital]) => {
    const g = geo[name];
    const p = paths[name];
    if (!g || !p) return null;
    const capPos = project(g.capLat, g.capLng);
    return { name, capital, abbr: g.abbr, color: g.color, x: p.cx, y: p.cy, capX: capPos.x, capY: capPos.y, shapePath: p.d };
  }).filter(Boolean), [regionInfo, geo, project, paths]);

  const hasSelection = selectedState !== null;

  const zBtn = {
    width: 40, height: 40, borderRadius: 12,
    background: "rgba(30,41,59,0.92)", border: "1px solid rgba(255,255,255,0.15)",
    color: "#E2E8F0", fontSize: 22, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Fredoka', sans-serif", backdropFilter: "blur(8px)", lineHeight: 1,
  };

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: fullHeight ? 12 : 22, overflow: "hidden", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", ...(fullHeight ? { flex: 1, minHeight: 0 } : {}) }}>
      {/* Zoom controls */}
      <div style={{ position: "absolute", top: 14, right: 14, zIndex: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => setZoom(z => Math.min(4, z * 1.3))} style={zBtn}>+</button>
        <button onClick={() => setZoom(z => Math.max(0.5, z * 0.77))} style={zBtn}>−</button>
        <button onClick={resetView} style={{ ...zBtn, fontSize: 16 }}>⟲</button>
      </div>

      {/* Selected state info panel */}
      {selectedState && (() => {
        const s = stateEntries.find(e => e.name === selectedState);
        if (!s) return null;
        return (
          <div style={{
            position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 10,
            background: "rgba(15,23,42,0.94)", backdropFilter: "blur(16px)",
            borderRadius: 18, padding: "16px 20px",
            border: `2px solid ${s.color}44`,
            display: "flex", alignItems: "center", gap: 16,
            animation: "slideUp 0.3s ease-out",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: s.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0,
              fontFamily: "'Fredoka', sans-serif",
            }}>{s.abbr}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif" }}>{s.name}</div>
              <div style={{ fontSize: 15, color: "#FFD700", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12 }}>★</span> Capital: {s.capital}
              </div>
            </div>
            <button onClick={() => onSelectState(null)} style={{
              background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10,
              width: 36, height: 36, color: "#94A3B8", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        );
      })()}

      <svg
        viewBox="0 0 900 700"
        style={{ width: "100%", height: fullHeight ? "100%" : "auto", display: "block", cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
        onMouseDown={handlePointerDown} onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
      >
        <defs>
          <filter id="glow-sel"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="shape-shadow"><feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.3" /></filter>
          <radialGradient id="cap-glow"><stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" /><stop offset="100%" stopColor="#FFD700" stopOpacity="0" /></radialGradient>
        </defs>

        <g transform={`translate(${450 + pan.x}, ${350 + pan.y}) scale(${zoom}) translate(-450, -350)`}>

          {/* Invisible background rect to catch clicks on empty space */}
          <rect x="-200" y="-200" width="1300" height="1100" fill="transparent"
            onClick={() => { if (!didDrag) onSelectState(null); }} />

          {/* Territory shapes */}
          {stateEntries.map(s => {
            const active = s.name === selectedState;
            const faded = hasSelection && !active;
            const isInset = INSET_STATES.has(s.name);
            return (
              <g key={s.name}
                onClick={(e) => { e.stopPropagation(); if (!didDrag) onSelectState(active ? null : s.name); }}
                style={{ cursor: "pointer" }}
                opacity={faded ? 0.12 : 1}
              >
                {/* Territory shape */}
                <path d={s.shapePath}
                  fill={s.color}
                  stroke={active ? "#fff" : "rgba(0,0,0,0.2)"}
                  strokeWidth={active ? 2.5 : 1}
                  filter={active ? "url(#glow-sel)" : "url(#shape-shadow)"}
                  fillOpacity={active ? 1 : 0.85}
                  style={{ transition: "fill-opacity 0.3s, stroke-width 0.3s" }}
                />

                {/* Abbreviation label */}
                <text x={s.x} y={s.y + 1} textAnchor="middle" dominantBaseline="central"
                  fill="#fff" fontSize={active ? 12 : 9} fontWeight="800" fontFamily="Fredoka, sans-serif"
                  style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                >{s.abbr}</text>

                {/* When selected: show full state name label above shape */}
                {active && (
                  <g>
                    <rect x={s.x - 65} y={s.y - 40} width={130} height={24} rx={8}
                      fill="rgba(15,23,42,0.92)" stroke={s.color} strokeWidth={1.5} />
                    <text x={s.x} y={s.y - 26} textAnchor="middle" dominantBaseline="central"
                      fill="#F1F5F9" fontSize={12} fontWeight="700" fontFamily="Fredoka, sans-serif">
                      {s.name}
                    </text>

                    {/* Capital on-map marker — only for non-inset states */}
                    {!isInset && (
                      <g>
                        <line x1={s.x} y1={s.y} x2={s.capX} y2={s.capY}
                          stroke={s.color} strokeWidth={2} strokeDasharray="5,3" opacity={0.7} />
                        <circle cx={s.capX} cy={s.capY} r={18} fill="url(#cap-glow)" />
                        <circle cx={s.capX} cy={s.capY} r={8} fill="#FFD700" stroke="#fff" strokeWidth={2.5} />
                        <text x={s.capX} y={s.capY + 0.5} textAnchor="middle" dominantBaseline="central"
                          fill="#92400E" fontSize={8} fontWeight="900">★</text>
                        <rect x={s.capX - 52} y={s.capY + 13} width={104} height={23} rx={8}
                          fill="rgba(15,23,42,0.92)" stroke="#FFD700" strokeWidth={1.5} />
                        <text x={s.capX} y={s.capY + 26} textAnchor="middle" dominantBaseline="central"
                          fill="#FFD700" fontSize={11} fontWeight="700" fontFamily="Fredoka, sans-serif">
                          {s.capital}
                        </text>
                      </g>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// ─── SMALL COMPONENTS ───────────────────────────────────────────────────────

function MapTapQuestion({ regionKey, correctState, onAnswer, answered, wasCorrect, tappedState }) {
  const region = REGIONS[regionKey];
  const paths = SVG_PATHS[regionKey] || {};
  const stateEntries = region.states.map(([name]) => ({
    name,
    path: paths[name]?.d || "",
    cx: paths[name]?.cx || 0,
    cy: paths[name]?.cy || 0,
    color: GEO_DATA[regionKey]?.[name]?.color || "#22C55E",
  })).filter(s => s.path);

  const handleTap = (stateName) => {
    if (answered) return;
    onAnswer(stateName);
  };

  return (
    <div style={{ width: "100%", borderRadius: 18, overflow: "hidden", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", marginTop: 8 }}>
      <svg viewBox="0 0 900 700" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <filter id="tap-glow-correct"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="tap-glow-wrong"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {stateEntries.map(s => {
          const isCorrect = s.name === correctState;
          const isTapped = s.name === tappedState;
          const showAsCorrect = answered && isCorrect;
          const showAsWrong = answered && isTapped && !wasCorrect;
          const faded = answered && !isCorrect && !isTapped;
          return (
            <path
              key={s.name}
              d={s.path}
              fill={showAsCorrect ? "#34D399" : showAsWrong ? "#F87171" : s.color}
              fillOpacity={faded ? 0.08 : showAsCorrect || showAsWrong ? 0.95 : 0.5}
              stroke={showAsCorrect ? "#34D399" : showAsWrong ? "#F87171" : "rgba(255,255,255,0.25)"}
              strokeWidth={showAsCorrect || showAsWrong ? 3 : 1}
              filter={showAsCorrect ? "url(#tap-glow-correct)" : showAsWrong ? "url(#tap-glow-wrong)" : "none"}
              style={{ cursor: answered ? "default" : "pointer", transition: "all 0.3s" }}
              onClick={() => handleTap(s.name)}
            />
          );
        })}
        {/* Show label on correct answer after answering */}
        {answered && (() => {
          const correct = stateEntries.find(s => s.name === correctState);
          if (!correct) return null;
          return (
            <g>
              <rect x={correct.cx - 55} y={correct.cy - 14} width={110} height={28} rx={8}
                fill="rgba(15,23,42,0.92)" stroke="#34D399" strokeWidth={2} />
              <text x={correct.cx} y={correct.cy} textAnchor="middle" dominantBaseline="central"
                fill="#34D399" fontSize={13} fontWeight="700" fontFamily="Fredoka, sans-serif">
                {correctState}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function ShapeSilhouette({ pathD, color = "#22C55E", size = 160 }) {
  // Parse the path to find bounding box, then scale to fit
  const nums = pathD.match(/[-\d.]+/g);
  if (!nums || nums.length < 4) return null;
  const xs = nums.filter((_, i) => i % 2 === 0).map(Number);
  const ys = nums.filter((_, i) => i % 2 === 1).map(Number);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = maxX - minX || 1, h = maxY - minY || 1;
  const pad = 15;
  const vb = `${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`;
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
      <div style={{ width: size, height: size, background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "2px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
        <svg viewBox={vb} style={{ width: "100%", height: "100%" }}>
          <path d={pathD} fill={color} fillOpacity={0.85} stroke="rgba(255,255,255,0.3)" strokeWidth={Math.max(w, h) * 0.008} />
          <text x={minX + w / 2} y={minY + h / 2} textAnchor="middle" dominantBaseline="central"
            fill="rgba(255,255,255,0.5)" fontSize={Math.min(w, h) * 0.25} fontWeight="900" fontFamily="Fredoka, sans-serif">?</text>
        </svg>
      </div>
    </div>
  );
}

function ConfettiEffect({ active }) {
  if (!active) return null;
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
    color: ["#FFD700", "#22C55E", "#4ECDC4", "#34D399", "#F97316", "#86EFAC"][i % 6],
    size: 6 + Math.random() * 8,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", top: -20, left: `${p.left}%`,
          width: p.size, height: p.size, borderRadius: p.size > 10 ? "50%" : "2px",
          backgroundColor: p.color, animation: `confettiFall 1.5s ${p.delay}s ease-out forwards`,
        }} />
      ))}
    </div>
  );
}

function ProgressBar({ current, total, correct }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 8, borderRadius: 99,
          backgroundColor: i < current ? (correct[i] ? "#34D399" : "#F87171") : i === current ? "#86EFAC" : "rgba(255,255,255,0.15)",
          transition: "all 0.4s ease", boxShadow: i === current ? "0 0 12px rgba(147,197,253,0.5)" : "none",
        }} />
      ))}
    </div>
  );
}

function HeartDisplay({ lives }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} style={{ fontSize: 28, transition: "all 0.3s ease", opacity: i < lives ? 1 : 0.2, transform: i < lives ? "scale(1)" : "scale(0.8)", filter: i < lives ? "none" : "grayscale(1)" }}>❤️</span>
      ))}
    </div>
  );
}

function XPBadge({ xp }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 99,
      background: "linear-gradient(135deg, #F59E0B, #F97316)",
      fontWeight: 800, fontSize: 18, color: "#fff", boxShadow: "0 2px 12px rgba(249,115,22,0.4)",
      fontFamily: "'Fredoka', sans-serif",
    }}>⚡ {xp} XP</div>
  );
}

function MapIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#64748B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function ListIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#64748B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" fill={active ? "#fff" : "#64748B"} />
      <circle cx="4" cy="12" r="1" fill={active ? "#fff" : "#64748B"} />
      <circle cx="4" cy="18" r="1" fill={active ? "#fff" : "#64748B"} />
    </svg>
  );
}

// ─── EXPLORER AVATARS ─────────────────────────────────────────────────────
const EXPLORER_AVATARS = [
  { id: "pilot", emoji: "🧑‍✈️", label: "Pilot" },
  { id: "astronaut", emoji: "🧑‍🚀", label: "Astronaut" },
  { id: "detective", emoji: "🕵️", label: "Detective" },
  { id: "compass", emoji: "🧭", label: "Navigator" },
  { id: "globe", emoji: "🌍", label: "Globe Trotter" },
  { id: "rocket", emoji: "🚀", label: "Rocket" },
  { id: "mountain", emoji: "🏔️", label: "Mountaineer" },
  { id: "ship", emoji: "🚢", label: "Voyager" },
  { id: "binoculars", emoji: "🔭", label: "Stargazer" },
  { id: "backpack", emoji: "🎒", label: "Backpacker" },
  { id: "map", emoji: "🗺️", label: "Cartographer" },
  { id: "treasure", emoji: "💎", label: "Treasure Hunter" },
];

// ─── FIREBASE CONFIG ─────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBdfM8G7nXHkIPqrURmGoPzOZ1T8SLVNcg",
  authDomain: "terranio-d4513.firebaseapp.com",
  databaseURL: "https://terranio-d4513-default-rtdb.firebaseio.com",
  projectId: "terranio-d4513",
  storageBucket: "terranio-d4513.firebasestorage.app",
  messagingSenderId: "351958585671",
  appId: "1:351958585671:web:941470eb652dcb6e91bc62",
};

// Firebase is loaded lazily — only when the user creates/joins a group
let _db = null;
let _firebaseReady = null;

function loadFirebaseSDK() {
  if (typeof firebase !== "undefined" && firebase.database) {
    _firebaseReady = Promise.resolve();
    return _firebaseReady;
  }
  if (_firebaseReady) return _firebaseReady;
  _firebaseReady = new Promise((resolve, reject) => {
    const scripts = [
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js",
    ];
    let loaded = 0;
    const loadNext = () => {
      if (loaded >= scripts.length) { resolve(); return; }
      const s = document.createElement("script");
      s.src = scripts[loaded];
      s.onload = () => { loaded++; loadNext(); };
      s.onerror = () => { _firebaseReady = null; reject(new Error("offline")); };
      document.head.appendChild(s);
    };
    loadNext();
  });
  return _firebaseReady;
}

async function getFirebaseDB() {
  if (_db) return _db;
  await loadFirebaseSDK();
  if (typeof firebase === "undefined") throw new Error("offline");
  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
  _db = firebase.database(app);
  return _db;
}

function generateGroupCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return "TERRA-" + num;
}

// ─── FIREBASE GROUP HOOK ─────────────────────────────────────────────────
function useFirebaseGroup() {
  const [groupCode, setGroupCode] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState("");
  const listenerRef = useRef(null);

  // Load saved group from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("terranio_group");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.code) {
          setGroupCode(parsed.code);
          setGroupName(parsed.name || "");
        }
      }
    } catch (e) {}
  }, []);

  // Subscribe to group data when groupCode changes
  useEffect(() => {
    if (!groupCode) {
      setGroupMembers([]);
      if (listenerRef.current) { listenerRef.current(); listenerRef.current = null; }
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const db = await getFirebaseDB();
        if (cancelled) return;
        const ref = db.ref("groups/" + groupCode);
        const handler = ref.on("value", (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setGroupName(data.name || "");
            const members = data.members ? Object.values(data.members) : [];
            setGroupMembers(members.sort((a, b) => (b.xp || 0) - (a.xp || 0)));
          } else {
            setGroupMembers([]);
          }
        });
        listenerRef.current = () => ref.off("value", handler);
      } catch (e) { console.error("Firebase subscribe failed:", e); }
    })();
    return () => { cancelled = true; if (listenerRef.current) { listenerRef.current(); listenerRef.current = null; } };
  }, [groupCode]);

  const createGroup = useCallback(async (name) => {
    setGroupLoading(true); setGroupError("");
    try {
      const db = await getFirebaseDB();
      let code = generateGroupCode();
      const snap = await db.ref("groups/" + code).once("value");
      if (snap.exists()) code = generateGroupCode();
      await db.ref("groups/" + code).set({ name: name, createdAt: Date.now(), members: {} });
      setGroupCode(code); setGroupName(name);
      localStorage.setItem("terranio_group", JSON.stringify({ code, name }));
      setGroupLoading(false);
      return code;
    } catch (e) {
      setGroupError(e.message || "Failed to create group");
      setGroupLoading(false);
      return null;
    }
  }, []);

  const joinGroup = useCallback(async (code) => {
    setGroupLoading(true); setGroupError("");
    const normalized = code.trim().toUpperCase();
    try {
      const db = await getFirebaseDB();
      const snap = await db.ref("groups/" + normalized).once("value");
      if (!snap.exists()) throw new Error("Group not found. Check the code and try again.");
      const data = snap.val();
      setGroupCode(normalized); setGroupName(data.name || "");
      localStorage.setItem("terranio_group", JSON.stringify({ code: normalized, name: data.name || "" }));
      setGroupLoading(false);
      return true;
    } catch (e) {
      setGroupError(e.message || "Failed to join group");
      setGroupLoading(false);
      return false;
    }
  }, []);

  const syncProfile = useCallback(async (profile) => {
    if (!groupCode || !profile) return;
    try {
      const db = await getFirebaseDB();
      const memberId = (profile.name + "_" + (profile.pin || "0000")).replace(/[.#$/\[\]\s]/g, "_").toLowerCase();
      await db.ref("groups/" + groupCode + "/members/" + memberId).set({
        name: profile.name,
        pin: profile.pin || "0000",
        avatarId: profile.avatarId,
        xp: profile.xp || 0,
        quizCount: profile.quizCount || 0,
        bestStreak: profile.bestStreak || 0,
        level: getExplorerLevel(profile.xp || 0).name,
        lastActive: Date.now(),
      });
    } catch (e) { console.error("Sync failed:", e); }
  }, [groupCode]);

  const signInWithPin = useCallback(async (code, memberName, pin) => {
    setGroupLoading(true); setGroupError("");
    try {
      const db = await getFirebaseDB();
      const snap = await db.ref("groups/" + code + "/members").once("value");
      if (!snap.exists()) throw new Error("No members found in this group.");
      const members = snap.val();
      const match = Object.values(members).find(m => m.name === memberName && m.pin === pin);
      if (!match) throw new Error("Incorrect PIN. Try again!");
      setGroupLoading(false);
      return match; // returns the full profile data from Firebase
    } catch (e) {
      setGroupError(e.message || "Sign in failed");
      setGroupLoading(false);
      return null;
    }
  }, []);

  const getGroupMembers = useCallback(async (code) => {
    try {
      const db = await getFirebaseDB();
      const snap = await db.ref("groups/" + code).once("value");
      if (!snap.exists()) return null;
      const data = snap.val();
      const members = data.members ? Object.values(data.members) : [];
      return { name: data.name, members };
    } catch (e) { return null; }
  }, []);

  const leaveGroup = useCallback(() => {
    setGroupCode(null); setGroupName(""); setGroupMembers([]);
    localStorage.removeItem("terranio_group");
  }, []);

  return { groupCode, groupName, groupMembers, groupLoading, groupError, createGroup, joinGroup, syncProfile, leaveGroup, setGroupError, signInWithPin, getGroupMembers };
}

// ─── PROFILE HELPERS ─────────────────────────────────────────────────────
function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await window.storage.get("geoquest-profiles");
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          setProfiles(parsed.profiles || []);
          setActiveId(parsed.activeId || null);
        }
      } catch (e) { /* no saved data yet */ }
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (newProfiles, newActiveId) => {
    setProfiles(newProfiles);
    setActiveId(newActiveId);
    try {
      await window.storage.set("geoquest-profiles", JSON.stringify({ profiles: newProfiles, activeId: newActiveId }));
    } catch (e) { console.error("Save failed", e); }
  }, []);

  const activeProfile = profiles.find(p => p.id === activeId) || null;

  const addProfile = useCallback(async (name, avatarId, pin, initialXP, initialQuizCount, initialBestStreak) => {
    const id = "p_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const newProfile = { id, name, avatarId, pin: pin || "0000", xp: initialXP || 0, quizCount: initialQuizCount || 0, bestStreak: initialBestStreak || 0 };
    const newProfiles = [...profiles, newProfile];
    await save(newProfiles, id);
    return newProfile;
  }, [profiles, save]);

  const switchProfile = useCallback(async (id) => {
    await save(profiles, id);
  }, [profiles, save]);

  const updateActiveXP = useCallback(async (earnedXP, streak) => {
    if (!activeId) return;
    const newProfiles = profiles.map(p => {
      if (p.id !== activeId) return p;
      return { ...p, xp: p.xp + earnedXP, quizCount: p.quizCount + 1, bestStreak: Math.max(p.bestStreak, streak) };
    });
    await save(newProfiles, activeId);
  }, [profiles, activeId, save]);

  const deleteProfile = useCallback(async (id) => {
    const newProfiles = profiles.filter(p => p.id !== id);
    const newActiveId = activeId === id ? (newProfiles[0]?.id || null) : activeId;
    await save(newProfiles, newActiveId);
  }, [profiles, activeId, save]);

  return { profiles, activeProfile, activeId, loaded, addProfile, switchProfile, updateActiveXP, deleteProfile };
}

function ProfileSwitcher({ profiles, activeProfile, onSwitch, onAdd, onManage }) {
  const [open, setOpen] = useState(false);
  if (!activeProfile) return null;
  const avatar = EXPLORER_AVATARS.find(a => a.id === activeProfile.avatarId) || EXPLORER_AVATARS[0];
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 8px",
        borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
        cursor: "pointer", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", transition: "all 0.2s",
      }}>
        <span style={{ fontSize: 28 }}>{avatar.emoji}</span>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{activeProfile.name}</span>
        <span style={{ fontSize: 12, color: "#64748B", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200,
          background: "rgba(15,23,42,0.98)", backdropFilter: "blur(20px)",
          borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)",
          padding: 8, minWidth: 220, boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          animation: "slideUp 0.2s ease-out",
        }}>
          {profiles.map(p => {
            const av = EXPLORER_AVATARS.find(a => a.id === p.avatarId) || EXPLORER_AVATARS[0];
            const isActive = p.id === activeProfile.id;
            return (
              <button key={p.id} onClick={() => { onSwitch(p.id); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                background: isActive ? "rgba(34,197,94,0.2)" : "transparent",
                color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 24 }}>{av.emoji}</span>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#F97316" }}>{getExplorerLevel(p.xp).icon} {p.xp} XP</div>
                </div>
                {isActive && <span style={{ color: "#22C55E", fontSize: 16 }}>✓</span>}
              </button>
            );
          })}
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
          <button onClick={() => { onAdd(); setOpen(false); }} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "transparent", color: "#94A3B8", fontFamily: "'Fredoka', sans-serif", fontSize: 15,
          }}>
            <span style={{ fontSize: 20 }}>➕</span> Add Explorer
          </button>
          <button onClick={() => { onManage(); setOpen(false); }} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "transparent", color: "#94A3B8", fontFamily: "'Fredoka', sans-serif", fontSize: 15,
          }}>
            <span style={{ fontSize: 20 }}>⚙️</span> Manage Profiles
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
function GeographyApp() {
  const { profiles, activeProfile, activeId, loaded, addProfile, switchProfile, updateActiveXP, deleteProfile } = useProfiles();
  const { groupCode, groupName, groupMembers, groupLoading, groupError, createGroup, joinGroup, syncProfile, leaveGroup, setGroupError, signInWithPin, getGroupMembers } = useFirebaseGroup();
  // Group creation/join input state
  const [groupInputMode, setGroupInputMode] = useState(null); // null | "create" | "join"
  const [groupInputValue, setGroupInputValue] = useState("");
  const [screen, setScreen] = useState("home");
  const [exploreRegion, setExploreRegion] = useState(null);
  const [exploreSearch, setExploreSearch] = useState("");
  const [exploreView, setExploreView] = useState("map");
  const [mapSelectedState, setMapSelectedState] = useState(null);
  const [quizRegions, setQuizRegions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correctMap, setCorrectMap] = useState({});
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [streakMsg, setStreakMsg] = useState("");
  const [shakeWrong, setShakeWrong] = useState(false);
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  // XP accelerators
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [speedBonuses, setSpeedBonuses] = useState(0);
  const [bonusMsg, setBonusMsg] = useState("");
  // Level up celebration
  const [levelUpData, setLevelUpData] = useState(null);
  // Profile creation state
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileAvatar, setNewProfileAvatar] = useState("pilot");
  const [newProfilePin, setNewProfilePin] = useState("");
  const [pinEdited, setPinEdited] = useState(false);
  const [onboardingJoinCode, setOnboardingJoinCode] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(null); // null | "enterCode" | "pickMember" | "enterPin"
  const [onboardingGroupData, setOnboardingGroupData] = useState(null); // { name, members }
  const [onboardingSelectedMember, setOnboardingSelectedMember] = useState(null);
  const [onboardingPinInput, setOnboardingPinInput] = useState("");
  const randomPin = useMemo(() => String(Math.floor(1000 + Math.random() * 9000)), []);
  const [managingProfiles, setManagingProfiles] = useState(false);

  const startQuiz = (regions) => {
    const qs = generateQuizQuestions(regions, 10);
    setQuestions(qs); setCurrentQ(0); setSelected(null); setAnswered(false);
    setCorrectMap({}); setScore(0); setLives(3); setStreak(0); setMaxStreak(0); setXp(0);
    setFeedbackMsg(""); setStreakMsg(""); setQuestionsAttempted(0);
    setSpeedBonuses(0); setBonusMsg(""); setQuestionStartTime(Date.now()); setLevelUpData(null);
    setScreen("quiz");
  };

  const handleAnswer = (option) => {
    if (answered) return;
    setSelected(option); setAnswered(true);
    const isCorrect = option === questions[currentQ].correct;
    const answerTime = questionStartTime ? Date.now() - questionStartTime : 99999;
    if (isCorrect) {
      const newStreak = streak + 1; setStreak(newStreak);
      setMaxStreak(m => Math.max(m, newStreak));
      // Base XP from streak
      const baseXP = newStreak >= 5 ? 15 : newStreak >= 3 ? 12 : 10;
      // Speed bonus
      const gotSpeedBonus = answerTime < SPEED_BONUS_THRESHOLD;
      const speedXP = gotSpeedBonus ? SPEED_BONUS_XP : 0;
      if (gotSpeedBonus) setSpeedBonuses(b => b + 1);
      const totalQuestionXP = baseXP + speedXP;
      setScore(s => s + 1); setXp(x => x + totalQuestionXP);
      setCorrectMap(m => ({ ...m, [currentQ]: true }));
      setFeedbackMsg(CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]);
      // Bonus messages
      const bonusParts = [];
      if (gotSpeedBonus) bonusParts.push("⚡ Speed Bonus +5");
      if (newStreak === 5) bonusParts.push("🔥 5 Streak! +15 XP");
      setBonusMsg(bonusParts.join("  "));
      if (STREAK_MESSAGES[newStreak]) setStreakMsg(STREAK_MESSAGES[newStreak]);
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1800);
    } else {
      setStreak(0); setLives(l => l - 1);
      setCorrectMap(m => ({ ...m, [currentQ]: false }));
      setFeedbackMsg(WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]);
      setStreakMsg(""); setBonusMsg(""); setShakeWrong(true); setTimeout(() => setShakeWrong(false), 600);
    }
  };

  const nextQuestion = () => {
    if (lives <= 0 || currentQ >= questions.length - 1) {
      const attempted = currentQ + 1;
      setQuestionsAttempted(attempted);
      // Perfect quiz bonus: 2x total XP if 10/10
      let finalXP = xp;
      if (score === attempted && attempted === questions.length) {
        finalXP = xp * PERFECT_QUIZ_MULTIPLIER;
        setXp(finalXP);
      }
      // Check for level-up
      const oldXP = activeProfile?.xp || 0;
      const newXP = oldXP + finalXP;
      const oldLevel = getExplorerLevel(oldXP);
      const newLevel = getExplorerLevel(newXP);
      if (newLevel.index > oldLevel.index) {
        setLevelUpData(newLevel);
      }
      updateActiveXP(finalXP, maxStreak);
      // Sync to Firebase group if joined
      if (groupCode && activeProfile) {
        const updatedProfile = { ...activeProfile, xp: (activeProfile.xp || 0) + finalXP, quizCount: (activeProfile.quizCount || 0) + 1, bestStreak: Math.max(activeProfile.bestStreak || 0, maxStreak) };
        syncProfile(updatedProfile);
      }
      setScreen("results");
    } else {
      setCurrentQ(c => c + 1); setSelected(null); setAnswered(false);
      setFeedbackMsg(""); setStreakMsg(""); setBonusMsg("");
      setQuestionStartTime(Date.now());
    }
  };

  const styles = {
    app: {
      minHeight: "100vh", background: "linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)",
      fontFamily: "'Fredoka', sans-serif", color: "#F1F5F9", position: "relative", overflow: "hidden",
    },
    header: {
      padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,23,42,0.8)",
      backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100,
    },
    backBtn: {
      background: "rgba(255,255,255,0.08)", border: "none", color: "#94A3B8",
      fontSize: 16, padding: "10px 20px", borderRadius: 14, cursor: "pointer",
      fontFamily: "'Fredoka', sans-serif", fontWeight: 500, transition: "all 0.2s",
    },
    container: { maxWidth: 900, margin: "0 auto", padding: "24px 24px 100px" },
  };

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Lilita+One&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-12px); } 40% { transform: translateX(12px); } 60% { transform: translateX(-8px); } 80% { transform: translateX(8px); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(34,197,94,0.3); } 50% { box-shadow: 0 0 40px rgba(34,197,94,0.6); } }
    @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
    @keyframes levelUpBounce { 0% { transform: scale(0); opacity: 0; } 30% { transform: scale(1.4); opacity: 1; } 50% { transform: scale(0.9); } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
    @keyframes levelUpGlow { 0%,100% { filter: drop-shadow(0 0 20px currentColor); } 50% { filter: drop-shadow(0 0 50px currentColor); } }
    @keyframes levelUpFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    button:active { transform: scale(0.96) !important; }
  `;

  // ─── LOADING ────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ fontSize: 64, animation: "float 2s ease-in-out infinite" }}>🌎</div>
        </div>
      </div>
    );
  }

  // ─── CREATE PROFILE ────────────────────────────────────────────────────
  if (screen === "createProfile") {
    const canCreate = newProfileName.trim().length > 0;
    const isFirstProfile = profiles.length === 0;
    const pinToUse = pinEdited ? newProfilePin : randomPin;
    const pinValid = pinToUse.length === 4 && /^\d{4}$/.test(pinToUse);
    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>
        <div style={{ ...styles.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 20, animation: "float 3s ease-in-out infinite" }}>🧭</div>
          <h1 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 36, color: "#86EFAC", marginBottom: 8 }}>
            {isFirstProfile ? "Create Your Explorer" : "New Explorer"}
          </h1>
          <p style={{ fontSize: 17, color: "#94A3B8", marginBottom: 32, maxWidth: 380 }}>
            {isFirstProfile ? "Pick a name, avatar, and secret PIN" : "Add a new explorer to the team"}
          </p>

          {/* Name input */}
          <div style={{ width: "100%", maxWidth: 400, marginBottom: 24 }}>
            <input
              type="text" placeholder="Your name..." value={newProfileName}
              onChange={e => setNewProfileName(e.target.value.slice(0, 20))} autoFocus
              style={{ width: "100%", padding: "18px 24px", borderRadius: 18, fontSize: 20, fontWeight: 600, border: "2px solid rgba(34,197,94,0.3)", background: "rgba(255,255,255,0.05)", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", outline: "none", textAlign: "center", transition: "border 0.3s" }}
              onFocus={e => e.target.style.borderColor = "rgba(34,197,94,0.6)"} onBlur={e => e.target.style.borderColor = "rgba(34,197,94,0.3)"}
            />
          </div>

          {/* Avatar picker */}
          <p style={{ fontSize: 15, color: "#64748B", marginBottom: 12 }}>Choose your avatar</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 340, marginBottom: 28 }}>
            {EXPLORER_AVATARS.map(a => (
              <button key={a.id} onClick={() => setNewProfileAvatar(a.id)} style={{
                width: 72, height: 72, borderRadius: 18, border: `2.5px solid ${newProfileAvatar === a.id ? "#22C55E" : "rgba(255,255,255,0.08)"}`,
                background: newProfileAvatar === a.id ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.03)",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 2, transition: "all 0.2s", transform: newProfileAvatar === a.id ? "scale(1.08)" : "scale(1)",
              }}>
                <span style={{ fontSize: 28 }}>{a.emoji}</span>
                <span style={{ fontSize: 9, color: "#94A3B8", fontFamily: "'Fredoka', sans-serif" }}>{a.label}</span>
              </button>
            ))}
          </div>

          {/* Secret PIN */}
          <div style={{ width: "100%", maxWidth: 400, marginBottom: 24, padding: "18px 20px", borderRadius: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 10 }}>🔒 Pick your secret PIN <span style={{ fontSize: 12, color: "#475569" }}>(use it to sign in on other devices)</span></p>
            <input
              type="tel" placeholder="• • • •" value={pinToUse} maxLength={4}
              onChange={e => { setPinEdited(true); setNewProfilePin(e.target.value.replace(/\D/g, "").slice(0, 4)); }}
              style={{ width: 160, padding: "14px 16px", borderRadius: 14, border: "2px solid rgba(34,197,94,0.2)", background: "rgba(255,255,255,0.05)", color: "#22C55E", fontSize: 32, fontFamily: "'Lilita One', sans-serif", outline: "none", textAlign: "center", letterSpacing: 8 }}
              onFocus={e => e.target.style.borderColor = "rgba(34,197,94,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(34,197,94,0.2)"}
            />
            <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>We suggest {randomPin} — or pick your own lucky number!</p>
          </div>

          {/* Group code (optional, first profile only) */}
          {isFirstProfile && (
            <div style={{ width: "100%", maxWidth: 400, marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>Have a group code? (optional)</p>
              <input type="text" placeholder="TERRA-1234" value={onboardingJoinCode}
                onChange={e => setOnboardingJoinCode(e.target.value.toUpperCase().slice(0, 10))}
                style={{ width: "100%", padding: "14px 20px", borderRadius: 14, fontSize: 17, fontWeight: 600, border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", outline: "none", textAlign: "center", letterSpacing: 2, transition: "border 0.3s" }}
                onFocus={e => e.target.style.borderColor = "rgba(34,197,94,0.4)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 14 }}>
            {!isFirstProfile && (
              <button onClick={() => { setScreen("home"); setNewProfileName(""); setNewProfileAvatar("pilot"); setNewProfilePin(""); setPinEdited(false); }} style={{
                padding: "16px 32px", borderRadius: 99, background: "rgba(255,255,255,0.06)",
                border: "2px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 18,
                fontWeight: 700, cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
              }}>Cancel</button>
            )}
            <button disabled={!canCreate || !pinValid} onClick={async () => {
              const profile = await addProfile(newProfileName.trim(), newProfileAvatar, pinToUse);
              if (onboardingJoinCode && onboardingJoinCode.trim()) {
                const ok = await joinGroup(onboardingJoinCode.trim());
                if (ok && profile) syncProfile(profile);
              }
              setNewProfileName(""); setNewProfileAvatar("pilot"); setNewProfilePin(""); setPinEdited(false); setOnboardingJoinCode("");
              setScreen("home");
            }} style={{
              padding: "16px 48px", borderRadius: 99,
              background: canCreate && pinValid ? "linear-gradient(135deg, #22C55E, #16A34A)" : "rgba(255,255,255,0.06)",
              border: "none", color: canCreate && pinValid ? "#fff" : "#475569", fontSize: 18,
              fontWeight: 700, cursor: canCreate && pinValid ? "pointer" : "default",
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: canCreate && pinValid ? "0 4px 24px rgba(34,197,94,0.4)" : "none",
              transition: "all 0.3s",
            }}>Start Exploring →</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MANAGE PROFILES ───────────────────────────────────────────────────
  if (screen === "manageProfiles") {
    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>
        <div style={styles.header}>
          <button onClick={() => setScreen("home")} style={styles.backBtn}>← Back</button>
          <h2 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 22, color: "#86EFAC" }}>👥 Manage Explorers</h2>
          <div style={{ width: 80 }} />
        </div>
        <div style={{ ...styles.container, maxWidth: 500, display: "flex", flexDirection: "column", gap: 12, paddingTop: 32 }}>
          {profiles.map((p, i) => {
            const av = EXPLORER_AVATARS.find(a => a.id === p.avatarId) || EXPLORER_AVATARS[0];
            const isActive = p.id === activeId;
            return (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "18px 20px",
                borderRadius: 18, background: isActive ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                border: `2px solid ${isActive ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                animation: `slideUp 0.3s ${i * 0.08}s ease-out both`,
              }}>
                <span style={{ fontSize: 36 }}>{av.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4, display: "flex", gap: 16 }}>
                    <span style={{ color: "#F97316" }}>{getExplorerLevel(p.xp).icon} {p.xp} XP</span>
                    <span>🎮 {p.quizCount} quizzes</span>
                    <span>🔥 Best streak: {p.bestStreak}</span>
                  </div>
                </div>
                {isActive && <span style={{ padding: "4px 12px", borderRadius: 99, background: "rgba(34,197,94,0.3)", fontSize: 12, fontWeight: 700, color: "#86EFAC" }}>Active</span>}
                {!isActive && (
                  <button onClick={() => deleteProfile(p.id)} style={{
                    background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.2)",
                    borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "#F87171",
                    fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Fredoka', sans-serif",
                  }}>✕</button>
                )}
              </div>
            );
          })}
          <button onClick={() => { setNewProfileName(""); setNewProfileAvatar("pilot"); setScreen("createProfile"); }} style={{
            padding: "16px 32px", borderRadius: 18, background: "rgba(255,255,255,0.04)",
            border: "2px dashed rgba(255,255,255,0.12)", color: "#94A3B8", fontSize: 17,
            fontWeight: 600, cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginTop: 8, transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 20 }}>➕</span> Add New Explorer
          </button>
        </div>
      </div>
    );
  }

  // ─── WELCOME SCREEN (first-time visitors only) ─────────────────────────
  if (!activeProfile && screen === "home" && profiles.length === 0) {
    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>
        <div style={{ ...styles.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", paddingTop: 40 }}>

          {/* Sign-in flow: enter code */}
          {onboardingStep === "enterCode" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔑</div>
              <h2 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 28, color: "#86EFAC", marginBottom: 8 }}>Welcome Back!</h2>
              <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 28, maxWidth: 320, lineHeight: 1.5 }}>Enter your group code to find your profile</p>
              {groupError && <div style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", fontSize: 14, marginBottom: 16, maxWidth: 320 }}>{groupError}</div>}
              <input type="text" placeholder="TERRA-1234" value={onboardingJoinCode}
                onChange={e => setOnboardingJoinCode(e.target.value.toUpperCase().slice(0, 10))} autoFocus
                style={{ width: "100%", maxWidth: 320, padding: "16px 20px", borderRadius: 14, border: "2px solid rgba(34,197,94,0.3)", background: "rgba(255,255,255,0.05)", color: "#F1F5F9", fontSize: 22, fontFamily: "'Fredoka', sans-serif", outline: "none", textAlign: "center", letterSpacing: 2, marginBottom: 20 }}
                onFocus={e => e.target.style.borderColor = "rgba(34,197,94,0.6)"} onBlur={e => e.target.style.borderColor = "rgba(34,197,94,0.3)"}
              />
              <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 320 }}>
                <button onClick={() => { setOnboardingStep(null); setOnboardingJoinCode(""); setGroupError(""); }} style={{ flex: 1, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Fredoka', sans-serif" }}>Back</button>
                <button disabled={!onboardingJoinCode.trim() || groupLoading} onClick={async () => {
                  setGroupError("");
                  const data = await getGroupMembers(onboardingJoinCode.trim());
                  if (data && data.members.length > 0) { setOnboardingGroupData(data); setOnboardingStep("pickMember"); }
                  else { setGroupError(data ? "No members in this group yet. Tap Back and create a new profile." : "Group not found. Check the code."); }
                }} style={{ flex: 1, padding: "14px", borderRadius: 14, background: onboardingJoinCode.trim() ? "linear-gradient(135deg, #22C55E, #16A34A)" : "rgba(255,255,255,0.06)", border: "none", color: onboardingJoinCode.trim() ? "#fff" : "#475569", fontSize: 16, fontWeight: 700, cursor: onboardingJoinCode.trim() ? "pointer" : "default", fontFamily: "'Fredoka', sans-serif" }}>
                  {groupLoading ? "Looking..." : "Next →"}
                </button>
              </div>
            </>
          )}

          {/* Sign-in flow: pick your name */}
          {onboardingStep === "pickMember" && onboardingGroupData && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
              <h2 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 24, color: "#86EFAC", marginBottom: 4 }}>{onboardingGroupData.name}</h2>
              <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 24 }}>Who are you?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340, marginBottom: 20 }}>
                {onboardingGroupData.members.map((m, i) => {
                  const av = EXPLORER_AVATARS.find(a => a.id === m.avatarId) || EXPLORER_AVATARS[0];
                  return (
                    <button key={m.name + i} onClick={() => { setOnboardingSelectedMember(m); setOnboardingPinInput(""); setOnboardingStep("enterPin"); }} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16,
                      background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)",
                      cursor: "pointer", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", transition: "all 0.2s",
                    }}>
                      <span style={{ fontSize: 28 }}>{av.emoji}</span>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontSize: 17, fontWeight: 700 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>{getExplorerLevel(m.xp || 0).icon} {getExplorerLevel(m.xp || 0).name} · ⚡ {m.xp || 0} XP</div>
                      </div>
                      <span style={{ color: "#64748B" }}>→</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => { setOnboardingStep("enterCode"); setOnboardingGroupData(null); }} style={{ padding: "10px 24px", borderRadius: 99, background: "transparent", border: "none", color: "#64748B", fontSize: 14, cursor: "pointer", fontFamily: "'Fredoka', sans-serif" }}>← Back</button>
            </>
          )}

          {/* Sign-in flow: enter PIN */}
          {onboardingStep === "enterPin" && onboardingSelectedMember && (
            <>
              <span style={{ fontSize: 56, marginBottom: 12 }}>{(EXPLORER_AVATARS.find(a => a.id === onboardingSelectedMember.avatarId) || EXPLORER_AVATARS[0]).emoji}</span>
              <h2 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 28, color: "#86EFAC", marginBottom: 4 }}>Hey, {onboardingSelectedMember.name}!</h2>
              <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 24 }}>Enter your secret PIN</p>
              {groupError && <div style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", fontSize: 14, marginBottom: 16, maxWidth: 300 }}>{groupError}</div>}
              <input type="tel" placeholder="• • • •" value={onboardingPinInput} maxLength={4}
                onChange={e => setOnboardingPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))} autoFocus
                style={{ width: 180, padding: "18px 20px", borderRadius: 18, border: "2px solid rgba(34,197,94,0.3)", background: "rgba(255,255,255,0.05)", color: "#F1F5F9", fontSize: 32, fontFamily: "'Lilita One', sans-serif", outline: "none", textAlign: "center", letterSpacing: 8, marginBottom: 24 }}
                onFocus={e => e.target.style.borderColor = "rgba(34,197,94,0.6)"} onBlur={e => e.target.style.borderColor = "rgba(34,197,94,0.3)"}
              />
              <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 300 }}>
                <button onClick={() => { setOnboardingStep("pickMember"); setOnboardingPinInput(""); setGroupError(""); }} style={{ flex: 1, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Fredoka', sans-serif" }}>Back</button>
                <button disabled={onboardingPinInput.length < 4 || groupLoading} onClick={async () => {
                  setGroupError("");
                  const profile = await signInWithPin(onboardingJoinCode.trim(), onboardingSelectedMember.name, onboardingPinInput);
                  if (profile) {
                    // Create local profile from Firebase data and join group
                    const localProfile = await addProfile(profile.name, profile.avatarId, profile.pin, profile.xp, profile.quizCount, profile.bestStreak);
                    await joinGroup(onboardingJoinCode.trim());
                    setOnboardingStep(null); setOnboardingJoinCode(""); setOnboardingGroupData(null);
                    setOnboardingSelectedMember(null); setOnboardingPinInput("");
                    setScreen("home");
                  }
                }} style={{ flex: 1, padding: "14px", borderRadius: 14, background: onboardingPinInput.length === 4 ? "linear-gradient(135deg, #22C55E, #16A34A)" : "rgba(255,255,255,0.06)", border: "none", color: onboardingPinInput.length === 4 ? "#fff" : "#475569", fontSize: 16, fontWeight: 700, cursor: onboardingPinInput.length === 4 ? "pointer" : "default", fontFamily: "'Fredoka', sans-serif" }}>
                  {groupLoading ? "Signing in..." : "Let's Go! →"}
                </button>
              </div>
            </>
          )}

          {/* Default welcome — no sign-in step active */}
          {!onboardingStep && (
            <>
              <div style={{ marginBottom: 24, animation: "float 4s ease-in-out infinite" }}>
                <svg width={100} height={100} viewBox="0 0 80 80" style={{ filter: "drop-shadow(0 0 20px rgba(34,197,94,0.4))" }}>
                  <defs><linearGradient id="welcomeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22C55E" /><stop offset="100%" stopColor="#16A34A" /></linearGradient></defs>
                  <circle cx="40" cy="40" r="36" fill="url(#welcomeGrad)" />
                  <ellipse cx="28" cy="30" rx="12" ry="14" fill="rgba(255,255,255,0.2)" transform="rotate(-15 28 30)" />
                  <ellipse cx="52" cy="44" rx="10" ry="8" fill="rgba(255,255,255,0.15)" transform="rotate(10 52 44)" />
                  <ellipse cx="36" cy="55" rx="7" ry="5" fill="rgba(255,255,255,0.12)" />
                  <ellipse cx="40" cy="40" rx="14" ry="34" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <ellipse cx="40" cy="40" rx="28" ry="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="4" y1="40" x2="76" y2="40" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                </svg>
              </div>
              <h1 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 52, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1, animation: "popIn 0.6s 0.2s ease-out both" }}>
                <span style={{ color: "#22C55E" }}>terra</span><span style={{ color: "#FFFFFF" }}>nio</span>
              </h1>
              <p style={{ fontSize: 19, color: "#94A3B8", marginBottom: 12, fontWeight: 500, maxWidth: 360, lineHeight: 1.5, animation: "slideUp 0.6s 0.3s ease-out both" }}>The fun way to learn geography with family & friends</p>
              <div style={{ display: "flex", gap: 24, marginTop: 20, marginBottom: 40, animation: "slideUp 0.6s 0.4s ease-out both" }}>
                {[{ emoji: "🗺️", label: "Explore maps" }, { emoji: "🏆", label: "Quiz battles" }, { emoji: "📊", label: "Leaderboards" }].map((f, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{f.emoji}</div>
                    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{f.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setOnboardingJoinCode(""); setNewProfilePin(""); setPinEdited(false); setScreen("createProfile"); }} style={{
                width: "100%", maxWidth: 340, padding: "20px 32px", borderRadius: 99,
                background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none",
                color: "#fff", fontSize: 20, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Fredoka', sans-serif", boxShadow: "0 4px 24px rgba(34,197,94,0.4)",
                animation: "slideUp 0.6s 0.5s ease-out both",
              }}>Start Playing →</button>
              <button onClick={() => { setOnboardingStep("enterCode"); setOnboardingJoinCode(""); setGroupError(""); }} style={{
                marginTop: 14, padding: "12px 24px", borderRadius: 99,
                background: "transparent", border: "none",
                color: "#64748B", fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Fredoka', sans-serif", animation: "slideUp 0.6s 0.6s ease-out both",
              }}>I already have an account</button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── LEADERBOARD ────────────────────────────────────────────────────────
  if (screen === "leaderboard") {
    const medals = ["🥇", "🥈", "🥉"];

    const renderMemberRow = (p, i) => {
      const av = EXPLORER_AVATARS.find(a => a.id === p.avatarId) || EXPLORER_AVATARS[0];
      const level = getExplorerLevel(p.xp || 0);
      const isMe = p.name === activeProfile?.name;
      const rank = i + 1;
      return (
        <div key={p.name + i} style={{
          display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 18,
          background: isMe ? "rgba(34,197,94,0.08)" : rank <= 3 ? "rgba(249,115,22,0.04)" : "rgba(255,255,255,0.03)",
          border: `2px solid ${isMe ? "rgba(34,197,94,0.25)" : rank <= 3 ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.06)"}`,
          animation: `slideUp 0.3s ${i * 0.06}s ease-out both`,
        }}>
          <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
            {rank <= 3 ? <span style={{ fontSize: 28 }}>{medals[rank - 1]}</span>
              : <span style={{ fontSize: 20, fontWeight: 800, color: "#475569", fontFamily: "'Lilita One', sans-serif" }}>{rank}</span>}
          </div>
          <span style={{ fontSize: 32, flexShrink: 0 }}>{av.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#F1F5F9" }}>{p.name}</span>
              {isMe && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(34,197,94,0.2)", color: "#22C55E", fontWeight: 700 }}>YOU</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 13 }}>{level.icon}</span>
              <span style={{ fontSize: 12, color: level.color, fontWeight: 600 }}>{level.name}</span>
              <span style={{ fontSize: 11, color: "#64748B" }}>· 🎮 {p.quizCount || 0} · 🔥 {p.bestStreak || 0}</span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F59E0B", fontFamily: "'Lilita One', sans-serif" }}>{p.xp || 0}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>XP</div>
          </div>
        </div>
      );
    };

    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>
        <div style={styles.header}>
          <button onClick={() => setScreen("home")} style={styles.backBtn}>← Back</button>
          <h2 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 22, color: "#86EFAC" }}>📊 Leaderboard</h2>
          <div style={{ width: 80 }} />
        </div>
        <div style={{ ...styles.container, maxWidth: 520, paddingTop: 16 }}>

          {/* No group yet — show create/join */}
          {!groupCode && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 4 }}>👨‍👩‍👧‍👦</div>
              <h3 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 24, color: "#F1F5F9" }}>Compete Together!</h3>
              <p style={{ fontSize: 15, color: "#94A3B8", textAlign: "center", maxWidth: 320, lineHeight: 1.5 }}>Create a group and share the code with family & friends. Scores sync across all devices in real-time!</p>

              {groupError && <div style={{ padding: "12px 20px", borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", fontSize: 14, textAlign: "center", width: "100%", maxWidth: 320, lineHeight: 1.5 }}>
                {groupError === "offline" ? "Leaderboard requires an internet connection. Please open terranio.net to use this feature." : groupError}
              </div>}

              {/* Create Group Flow */}
              {groupInputMode !== "join" && (
                <>
                  {groupInputMode === "create" ? (
                    <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
                      <input
                        type="text" placeholder="Group name (e.g., The Smiths)" value={groupInputValue}
                        onChange={e => setGroupInputValue(e.target.value.slice(0, 30))} autoFocus
                        style={{ width: "100%", padding: "16px 20px", borderRadius: 14, border: "2px solid rgba(34,197,94,0.3)", background: "rgba(255,255,255,0.05)", color: "#F1F5F9", fontSize: 17, fontFamily: "'Fredoka', sans-serif", outline: "none", textAlign: "center" }}
                        onFocus={e => e.target.style.borderColor = "rgba(34,197,94,0.6)"} onBlur={e => e.target.style.borderColor = "rgba(34,197,94,0.3)"}
                        onKeyDown={async e => { if (e.key === "Enter" && groupInputValue.trim()) { const code = await createGroup(groupInputValue.trim()); if (code && activeProfile) syncProfile(activeProfile); setGroupInputValue(""); setGroupInputMode(null); }}}
                      />
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => { setGroupInputMode(null); setGroupInputValue(""); setGroupError(""); }} style={{ flex: 1, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Fredoka', sans-serif" }}>Cancel</button>
                        <button disabled={!groupInputValue.trim() || groupLoading} onClick={async () => {
                          const code = await createGroup(groupInputValue.trim());
                          if (code && activeProfile) syncProfile(activeProfile);
                          setGroupInputValue(""); setGroupInputMode(null);
                        }} style={{ flex: 1, padding: "14px", borderRadius: 14, background: groupInputValue.trim() ? "linear-gradient(135deg, #22C55E, #16A34A)" : "rgba(255,255,255,0.06)", border: "none", color: groupInputValue.trim() ? "#fff" : "#475569", fontSize: 16, fontWeight: 700, cursor: groupInputValue.trim() ? "pointer" : "default", fontFamily: "'Fredoka', sans-serif" }}>
                          {groupLoading ? "Creating..." : "Create"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setGroupInputMode("create"); setGroupInputValue(""); setGroupError(""); }} style={{
                      width: "100%", maxWidth: 320, padding: "18px 24px", borderRadius: 18,
                      background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none",
                      color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Fredoka', sans-serif", boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
                    }}>Create a Group</button>
                  )}
                </>
              )}

              {groupInputMode !== "create" && groupInputMode !== "join" && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 320 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: 13, color: "#64748B" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>
              )}

              {/* Join Group Flow */}
              {groupInputMode !== "create" && (
                <>
                  {groupInputMode === "join" ? (
                    <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
                      <input
                        type="text" placeholder="TERRA-1234" value={groupInputValue}
                        onChange={e => setGroupInputValue(e.target.value.toUpperCase().slice(0, 10))} autoFocus
                        style={{ width: "100%", padding: "16px 20px", borderRadius: 14, border: "2px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#F1F5F9", fontSize: 17, fontFamily: "'Fredoka', sans-serif", outline: "none", textAlign: "center", letterSpacing: 2 }}
                        onFocus={e => e.target.style.borderColor = "rgba(34,197,94,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                        onKeyDown={async e => { if (e.key === "Enter" && groupInputValue.trim()) { const ok = await joinGroup(groupInputValue.trim()); if (ok && activeProfile) syncProfile(activeProfile); if (ok) { setGroupInputValue(""); setGroupInputMode(null); } }}}
                      />
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => { setGroupInputMode(null); setGroupInputValue(""); setGroupError(""); }} style={{ flex: 1, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Fredoka', sans-serif" }}>Cancel</button>
                        <button disabled={!groupInputValue.trim() || groupLoading} onClick={async () => {
                          const ok = await joinGroup(groupInputValue.trim());
                          if (ok && activeProfile) syncProfile(activeProfile);
                          if (ok) { setGroupInputValue(""); setGroupInputMode(null); }
                        }} style={{ flex: 1, padding: "14px", borderRadius: 14, background: groupInputValue.trim() ? "linear-gradient(135deg, #22C55E, #16A34A)" : "rgba(255,255,255,0.06)", border: "none", color: groupInputValue.trim() ? "#fff" : "#475569", fontSize: 16, fontWeight: 700, cursor: groupInputValue.trim() ? "pointer" : "default", fontFamily: "'Fredoka', sans-serif" }}>
                          {groupLoading ? "Joining..." : "Join"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setGroupInputMode("join"); setGroupInputValue(""); setGroupError(""); }} style={{
                      width: "100%", maxWidth: 320, padding: "18px 24px", borderRadius: 18,
                      background: "rgba(255,255,255,0.04)", border: "2px solid rgba(255,255,255,0.12)",
                      color: "#F1F5F9", fontSize: 18, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Fredoka', sans-serif",
                    }}>Join with Code</button>
                  )}
                </>
              )}
            </div>
          )}

          {/* In a group — show group info + members */}
          {groupCode && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#F1F5F9" }}>{groupName}</div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Code: <span style={{ color: "#22C55E", fontWeight: 700, letterSpacing: 1 }}>{groupCode}</span></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(groupCode); } }} style={{
                    padding: "8px 14px", borderRadius: 10, background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E", fontSize: 13,
                    fontWeight: 600, cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
                  }}>Copy</button>
                  <button onClick={leaveGroup} style={{
                    padding: "8px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", fontSize: 13,
                    fontWeight: 600, cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
                  }}>Leave</button>
                </div>
              </div>

              {groupMembers.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#64748B", fontSize: 15, lineHeight: 1.6 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🕐</div>
                  Share the code <strong style={{ color: "#22C55E" }}>{groupCode}</strong> with family & friends to start competing!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {groupMembers.map((p, i) => renderMemberRow(p, i))}
                </div>
              )}

              <p style={{ textAlign: "center", fontSize: 12, color: "#475569", marginTop: 20 }}>Scores sync automatically after each quiz</p>
            </>
          )}

          {/* Level Legend */}
          <div style={{ marginTop: 32, padding: "20px 24px", borderRadius: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize: 15, color: "#94A3B8", marginBottom: 14, fontWeight: 600, textAlign: "center" }}>Explorer Levels</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {EXPLORER_LEVELS.map((l) => (
                <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: 18 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{l.minXP.toLocaleString()} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── HOME ───────────────────────────────────────────────────────────────
  if (screen === "home") {
    const totalXP = activeProfile?.xp || 0;
    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>
        {/* Leaderboard button in top-left */}
        {activeProfile && (
          <div style={{ position: "fixed", top: 16, left: 16, zIndex: 100 }}>
            <button onClick={() => setScreen("leaderboard")} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 8px",
              borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
              cursor: "pointer", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif",
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 28 }}>📊</span>
              <span style={{ fontWeight: 600, fontSize: 16 }}>Leaderboard</span>
            </button>
          </div>
        )}
        {/* Profile switcher in top-right */}
        {activeProfile && (
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100 }}>
            <ProfileSwitcher
              profiles={profiles} activeProfile={activeProfile}
              onSwitch={switchProfile}
              onAdd={() => { setNewProfileName(""); setNewProfileAvatar("pilot"); setScreen("createProfile"); }}
              onManage={() => setScreen("manageProfiles")}
            />
          </div>
        )}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[ { top: "8%", left: "6%", size: 80, emoji: "🌍", delay: 0, dur: 4 },
            { top: "15%", right: "8%", size: 60, emoji: "🗽", delay: 0.5, dur: 3.5 },
            { top: "60%", left: "4%", size: 55, emoji: "🏔️", delay: 1, dur: 4.5 },
            { top: "70%", right: "6%", size: 70, emoji: "🗼", delay: 1.5, dur: 3.8 },
            { top: "35%", left: "85%", size: 50, emoji: "🍁", delay: 2, dur: 4.2 },
            { top: "85%", left: "50%", size: 45, emoji: "🏛️", delay: 0.8, dur: 3.6 },
          ].map((d, i) => (
            <div key={i} style={{ position: "absolute", top: d.top, left: d.left, right: d.right, fontSize: d.size, opacity: 0.12, animation: `float ${d.dur}s ${d.delay}s ease-in-out infinite` }}>{d.emoji}</div>
          ))}
        </div>
        <div style={{ ...styles.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", paddingTop: 40 }}>
          {/* Terranio Logo — Globe with Meridians */}
          <div style={{ marginBottom: 28, animation: "float 4s ease-in-out infinite" }}>
            <svg width={110} height={110} viewBox="0 0 80 80" style={{ filter: "drop-shadow(0 0 20px rgba(34,197,94,0.4))" }}>
              <defs>
                <linearGradient id="homeLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#16A34A" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="36" fill="url(#homeLogoGrad)" />
              <ellipse cx="28" cy="30" rx="12" ry="14" fill="rgba(255,255,255,0.2)" transform="rotate(-15 28 30)" />
              <ellipse cx="52" cy="44" rx="10" ry="8" fill="rgba(255,255,255,0.15)" transform="rotate(10 52 44)" />
              <ellipse cx="36" cy="55" rx="7" ry="5" fill="rgba(255,255,255,0.12)" />
              <ellipse cx="40" cy="40" rx="14" ry="34" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <ellipse cx="40" cy="40" rx="28" ry="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <ellipse cx="40" cy="26" rx="30" ry="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="4" y1="40" x2="76" y2="40" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <ellipse cx="40" cy="54" rx="30" ry="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </svg>
          </div>
          {/* Terranio Wordmark */}
          <h1 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 52, lineHeight: 1.1, marginBottom: 12, letterSpacing: -1 }}>
            <span style={{ color: "#22C55E" }}>terra</span><span style={{ color: "#FFFFFF" }}>nio</span>
          </h1>
          {activeProfile && <p style={{ fontSize: 18, color: "#94A3B8", marginBottom: 8, fontWeight: 500 }}>Welcome back, {activeProfile.name}!</p>}
          <p style={{ fontSize: 17, color: "#64748B", marginBottom: 28, fontWeight: 500, maxWidth: 400 }}>Master capitals across the Americas & Europe</p>

          {/* Explorer Level Card */}
          {activeProfile && (() => {
            const level = getExplorerLevel(totalXP);
            const xpToNext = level.next ? level.next.minXP - totalXP : 0;
            return (
              <div style={{ width: "100%", maxWidth: 380, marginBottom: 32, borderRadius: 22, background: "rgba(255,255,255,0.04)", border: `1.5px solid ${level.color}33`, animation: "slideUp 0.5s ease-out", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{level.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748B", fontWeight: 600 }}>Current Level</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: level.color, fontFamily: "'Lilita One', sans-serif" }}>{level.name}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>⚡ {totalXP}</div>
                </div>
                {level.next ? (
                  <div style={{ padding: "0 20px 14px" }}>
                    <div style={{ width: "100%", height: 10, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${level.color}, ${level.next.color})`, width: `${Math.max(2, Math.round(level.progress * 100))}%`, transition: "width 1s ease" }} />
                    </div>
                    <div style={{ textAlign: "center", fontSize: 13, color: level.next.color, fontWeight: 600 }}>{xpToNext} XP to {level.next.icon} {level.next.name}</div>
                  </div>
                ) : (
                  <div style={{ padding: "0 20px 14px", fontSize: 13, color: "#F59E0B", fontWeight: 600, textAlign: "center" }}>🏆 Max level reached!</div>
                )}
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 20, width: "100%", maxWidth: 480 }}>
            <button onClick={() => setScreen("explore")} style={{ flex: 1, padding: 32, borderRadius: 28, background: "linear-gradient(160deg, rgba(52,211,153,0.12), rgba(16,185,129,0.06))", border: "2px solid rgba(52,211,153,0.2)", cursor: "pointer", textAlign: "center", transition: "all 0.3s ease", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", animation: "slideUp 0.6s ease-out" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(52,211,153,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(52,211,153,0.2)"; }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🧭</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, fontFamily: "'Lilita One', sans-serif" }}>Explore</div>
              <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.4 }}>Browse maps & capitals</div>
            </button>
            <button onClick={() => setScreen("regionSelect")} style={{ flex: 1, padding: 32, borderRadius: 28, background: "linear-gradient(160deg, rgba(34,197,94,0.12), rgba(22,163,74,0.06))", border: "2px solid rgba(34,197,94,0.2)", cursor: "pointer", textAlign: "center", transition: "all 0.3s ease", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", animation: "slideUp 0.6s 0.1s ease-out both" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)"; }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🏆</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, fontFamily: "'Lilita One', sans-serif" }}>Quiz</div>
              <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.4 }}>10 questions, earn XP!</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── EXPLORE ────────────────────────────────────────────────────────────
  if (screen === "explore") {
    const regionData = exploreRegion ? REGIONS[exploreRegion] : null;
    const filtered = regionData ? regionData.states.filter(([s, c]) => s.toLowerCase().includes(exploreSearch.toLowerCase()) || c.toLowerCase().includes(exploreSearch.toLowerCase())) : [];

    return (
      <div style={{ ...styles.app, ...(exploreRegion && exploreView === "map" ? { display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" } : {}) }}>
        <style>{globalCSS}</style>
        <div style={{ ...styles.header, flexShrink: 0 }}>
          <button onClick={() => { if (exploreRegion) { setExploreRegion(null); setExploreSearch(""); setMapSelectedState(null); } else setScreen("home"); }} style={styles.backBtn}>← Back</button>
          <h2 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 22, color: "#86EFAC" }}>🧭 {exploreRegion ? regionData.emoji + " " + regionData.name : "Explore"}</h2>
          {exploreRegion ? (
            <div style={{ display: "flex", borderRadius: 14, overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
              <button onClick={() => { setExploreView("map"); setMapSelectedState(null); }} style={{ padding: "9px 16px", border: "none", cursor: "pointer", background: exploreView === "map" ? "rgba(34,197,94,0.45)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}><MapIcon active={exploreView === "map"} /></button>
              <button onClick={() => setExploreView("list")} style={{ padding: "9px 18px 9px 16px", border: "none", cursor: "pointer", background: exploreView === "list" ? "rgba(34,197,94,0.45)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}><ListIcon active={exploreView === "list"} /></button>
            </div>
          ) : <div style={{ width: 80 }} />}
        </div>

        <div style={exploreRegion && exploreView === "map" ? { padding: "0 8px 8px", flex: 1, display: "flex", flexDirection: "column" } : styles.container}>
          {!exploreRegion ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
              <p style={{ textAlign: "center", fontSize: 18, color: "#94A3B8", marginBottom: 12 }}>Choose a region to explore</p>
              {Object.entries(REGIONS).map(([key, region], i) => (
                <button key={key} onClick={() => { setExploreRegion(key); setExploreView("map"); setMapSelectedState(null); }} style={{
                  padding: "24px 28px", borderRadius: 22, background: `linear-gradient(135deg, ${region.color}18, ${region.color}08)`,
                  border: `2px solid ${region.color}33`, cursor: "pointer", display: "flex", alignItems: "center", gap: 20,
                  transition: "all 0.3s", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", animation: `slideUp 0.4s ${i * 0.1}s ease-out both`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${region.color}88`; e.currentTarget.style.transform = "translateX(8px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${region.color}33`; e.currentTarget.style.transform = "translateX(0)"; }}>
                  <span style={{ fontSize: 44 }}>{region.emoji}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{region.name}</div>
                    <div style={{ fontSize: 15, color: "#94A3B8", marginTop: 4 }}>{region.states.length} {key === "usa" || key === "mexico" ? "states" : key === "canada" ? "provinces" : "countries"}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 24, color: "#64748B" }}>→</span>
                </button>
              ))}
            </div>
          ) : exploreView === "map" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <InteractiveMap regionKey={exploreRegion} selectedState={mapSelectedState} onSelectState={setMapSelectedState} fullHeight />
              </div>
              <p style={{ textAlign: "center", padding: "8px 0", fontSize: 14, color: "#64748B", flexShrink: 0 }}>Tap a bubble to see its capital · Pinch or scroll to zoom · Drag to pan</p>
            </div>
          ) : (
            <>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 20 }}>🔍</span>
                <input type="text" placeholder="Search..." value={exploreSearch} onChange={e => setExploreSearch(e.target.value)}
                  style={{ width: "100%", padding: "16px 16px 16px 52px", borderRadius: 18, border: "2px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", color: "#F1F5F9", fontSize: 17, fontFamily: "'Fredoka', sans-serif", outline: "none", transition: "border 0.3s" }}
                  onFocus={e => e.target.style.borderColor = `${regionData.color}66`} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {filtered.map(([state, capital], i) => (
                  <div key={state} style={{ padding: "18px 20px", borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", animation: `slideUp 0.3s ${Math.min(i * 0.03, 0.5)}s ease-out both` }}>
                    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{state}</div>
                    <div style={{ fontSize: 14, color: regionData.color, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: regionData.color, display: "inline-block" }} />{capital}
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#64748B", fontSize: 18 }}>No results found for "{exploreSearch}"</div>}
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── REGION SELECT ──────────────────────────────────────────────────────
  if (screen === "regionSelect") {
    const toggleRegion = (key) => setQuizRegions(prev => prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]);
    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>
        <div style={styles.header}>
          <button onClick={() => { setScreen("home"); setQuizRegions([]); }} style={styles.backBtn}>← Back</button>
          <h2 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 22, color: "#86EFAC" }}>🏆 Choose Regions</h2>
          <div style={{ width: 80 }} />
        </div>
        <div style={{ ...styles.container, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ textAlign: "center", fontSize: 18, color: "#94A3B8", marginBottom: 28, marginTop: 8 }}>Select one or more regions to quiz</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 480 }}>
            {Object.entries(REGIONS).map(([key, region], i) => {
              const isSel = quizRegions.includes(key);
              return (
                <button key={key} onClick={() => toggleRegion(key)} style={{
                  padding: "22px 24px", borderRadius: 22,
                  background: isSel ? `linear-gradient(135deg, ${region.color}25, ${region.color}10)` : "rgba(255,255,255,0.03)",
                  border: `2.5px solid ${isSel ? region.color : "rgba(255,255,255,0.08)"}`,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 18,
                  transition: "all 0.3s", color: "#F1F5F9", fontFamily: "'Fredoka', sans-serif", animation: `slideUp 0.4s ${i * 0.1}s ease-out both`,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, border: `2.5px solid ${isSel ? region.color : "#475569"}`, background: isSel ? region.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", flexShrink: 0 }}>
                    {isSel && <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 36 }}>{region.emoji}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{region.name}</div>
                    <div style={{ fontSize: 14, color: "#64748B" }}>{region.states.length} {key === "usa" || key === "mexico" ? "states" : key === "canada" ? "provinces" : "countries"}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => quizRegions.length > 0 && startQuiz(quizRegions)} disabled={quizRegions.length === 0}
            style={{ marginTop: 36, padding: "18px 64px", borderRadius: 99, background: quizRegions.length > 0 ? "linear-gradient(135deg, #22C55E, #16A34A)" : "rgba(255,255,255,0.06)", border: "none", color: quizRegions.length > 0 ? "#fff" : "#475569", fontSize: 20, fontWeight: 700, cursor: quizRegions.length > 0 ? "pointer" : "default", fontFamily: "'Fredoka', sans-serif", boxShadow: quizRegions.length > 0 ? "0 4px 24px rgba(34,197,94,0.4)" : "none", transition: "all 0.3s" }}>Start Quiz →</button>
        </div>
      </div>
    );
  }

  // ─── QUIZ ───────────────────────────────────────────────────────────────
  if (screen === "quiz") {
    const q = questions[currentQ]; const isCorrect = selected === q?.correct; const gameOver = lives <= 0 && answered;
    const isMapTap = q?.type === "map_tap";
    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>
        <ConfettiEffect active={showConfetti} />
        <div style={styles.header}>
          <HeartDisplay lives={lives} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Question</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#E2E8F0", fontFamily: "'Lilita One', sans-serif" }}>{currentQ + 1} / {questions.length}</div>
          </div>
          <XPBadge xp={xp} />
        </div>
        <div style={styles.container}>
          <ProgressBar current={currentQ + (answered ? 1 : 0)} total={questions.length} correct={correctMap} />
          {streak >= 3 && !answered && <div style={{ textAlign: "center", marginBottom: 8, fontSize: 15, fontWeight: 600, color: "#F59E0B", animation: "pulse 1s ease-in-out infinite" }}>🔥 {streak} streak!</div>}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 28, padding: isMapTap ? "20px 16px 16px" : "36px 28px 28px", marginTop: 20, border: "1px solid rgba(255,255,255,0.06)", animation: shakeWrong ? "shake 0.5s ease" : "none" }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: REGIONS[q.region]?.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>{REGIONS[q.region]?.emoji} {REGIONS[q.region]?.name}</span>
            </div>
            <h2 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: isMapTap ? 22 : 26, textAlign: "center", marginBottom: isMapTap ? 8 : (q.shapePath ? 16 : 32), lineHeight: 1.3, color: "#E2E8F0" }}>{q.question}</h2>
            {isMapTap ? (
              <>
                {!answered && <p style={{ textAlign: "center", fontSize: 14, color: "#64748B", marginBottom: 8 }}>Tap the correct {q.region === "europe" ? "country" : "state"} on the map</p>}
                <MapTapQuestion
                  regionKey={q.region}
                  correctState={q.correct}
                  onAnswer={handleAnswer}
                  answered={answered}
                  wasCorrect={isCorrect}
                  tappedState={selected}
                />
              </>
            ) : (
              <>
                {q.shapePath && <ShapeSilhouette pathD={q.shapePath} color={REGIONS[q.region]?.color || "#22C55E"} size={160} />}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {q.options.map((option, i) => {
                    const isThis = selected === option; const isAns = option === q.correct;
                    let bg = "rgba(255,255,255,0.06)", bdr = "rgba(255,255,255,0.1)", tc = "#E2E8F0";
                    if (answered) { if (isAns) { bg = "rgba(52,211,153,0.15)"; bdr = "#34D399"; tc = "#34D399"; } else if (isThis && !isCorrect) { bg = "rgba(248,113,113,0.15)"; bdr = "#F87171"; tc = "#F87171"; } else { bg = "rgba(255,255,255,0.02)"; tc = "#475569"; } }
                    return (
                      <button key={option} onClick={() => handleAnswer(option)} disabled={answered}
                        style={{ padding: "20px 16px", borderRadius: 18, background: bg, border: `2.5px solid ${bdr}`, cursor: answered ? "default" : "pointer", color: tc, fontSize: 17, fontWeight: 600, fontFamily: "'Fredoka', sans-serif", transition: "all 0.25s", animation: `slideUp 0.3s ${i * 0.08}s ease-out both`, position: "relative" }}
                        onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = "#22C55E"; e.currentTarget.style.background = "rgba(34,197,94,0.08)"; } }}
                        onMouseLeave={e => { if (!answered) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; } }}>
                        {answered && isAns && <span style={{ position: "absolute", top: 8, right: 12, fontSize: 18 }}>✓</span>}
                        {answered && isThis && !isCorrect && <span style={{ position: "absolute", top: 8, right: 12, fontSize: 18 }}>✗</span>}
                        {option}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          {answered && (
            <div style={{ textAlign: "center", marginTop: 24, animation: "popIn 0.4s ease-out" }}>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: isCorrect ? "#34D399" : "#F87171", fontFamily: "'Lilita One', sans-serif" }}>{feedbackMsg}</div>
              {streakMsg && <div style={{ fontSize: 20, color: "#F59E0B", fontWeight: 700, marginBottom: 8 }}>{streakMsg}</div>}
              {bonusMsg && <div style={{ fontSize: 14, color: "#22C55E", fontWeight: 600, marginBottom: 8, padding: "6px 16px", borderRadius: 99, background: "rgba(34,197,94,0.1)", display: "inline-block" }}>{bonusMsg}</div>}
              {!isCorrect && !isMapTap && <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 8 }}>The answer is <strong style={{ color: "#34D399" }}>{q.correct}</strong></div>}
              <button onClick={nextQuestion} style={{ marginTop: 12, padding: "16px 48px", borderRadius: 99, background: gameOver ? "linear-gradient(135deg, #EF4444, #DC2626)" : "linear-gradient(135deg, #22C55E, #16A34A)", border: "none", color: "#fff", fontSize: 19, fontWeight: 700, cursor: "pointer", fontFamily: "'Fredoka', sans-serif", boxShadow: "0 4px 20px rgba(34,197,94,0.3)", transition: "all 0.3s" }}>
                {gameOver ? "See Results" : currentQ >= questions.length - 1 ? "Finish!" : "Next →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RESULTS ────────────────────────────────────────────────────────────
  if (screen === "results") {
    const attempted = questionsAttempted || questions.length;
    const reviewQuestions = questions.slice(0, attempted);
    const pct = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    const isPerfect = score === attempted && attempted === questions.length;
    const grade = pct === 100 ? { icon: "💎", label: "Perfect!", color: "#34D399" } : pct >= 80 ? { icon: "🌟", label: "Amazing!", color: "#F59E0B" } : pct >= 60 ? { icon: "👏", label: "Great Job!", color: "#34D399" } : pct >= 40 ? { icon: "💪", label: "Keep Trying!", color: "#3B82F6" } : { icon: "🌱", label: "Keep Learning!", color: "#94A3B8" };
    const level = getExplorerLevel(activeProfile?.xp || 0);
    return (
      <div style={styles.app}>
        <style>{globalCSS}</style>

        {/* Level-Up Celebration Overlay */}
        {levelUpData && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: 32,
          }}>
            {/* Burst particles */}
            {Array.from({ length: 20 }, (_, i) => {
              const angle = (Math.PI * 2 * i) / 20;
              const dist = 120 + Math.random() * 80;
              return (
                <div key={i} style={{
                  position: "absolute", width: 8 + Math.random() * 8, height: 8 + Math.random() * 8,
                  borderRadius: "50%", background: levelUpData.color,
                  left: "50%", top: "42%", opacity: 0,
                  animation: `confettiFall 2s ${i * 0.05}s ease-out forwards`,
                  transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`,
                }} />
              );
            })}
            <div style={{
              fontSize: 120, lineHeight: 1,
              animation: "levelUpBounce 0.8s ease-out, levelUpGlow 2s 0.8s ease-in-out infinite",
              color: levelUpData.color, marginBottom: 24,
            }}>{levelUpData.icon}</div>
            <div style={{
              fontFamily: "'Lilita One', sans-serif", fontSize: 18,
              color: "#94A3B8", textTransform: "uppercase", letterSpacing: 3,
              animation: "levelUpFadeIn 0.6s 0.4s ease-out both",
            }}>Level Up!</div>
            <div style={{
              fontFamily: "'Lilita One', sans-serif", fontSize: 44,
              color: levelUpData.color, marginTop: 8,
              animation: "levelUpFadeIn 0.6s 0.6s ease-out both",
            }}>{levelUpData.name}</div>
            <div style={{
              fontSize: 17, color: "#94A3B8", marginTop: 12, maxWidth: 300,
              animation: "levelUpFadeIn 0.6s 0.8s ease-out both",
            }}>You've unlocked a new explorer rank!</div>
            <button onClick={() => setLevelUpData(null)} style={{
              marginTop: 36, padding: "16px 48px", borderRadius: 99,
              background: `linear-gradient(135deg, ${levelUpData.color}, ${levelUpData.color}CC)`,
              border: "none", color: "#fff", fontSize: 19, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
              boxShadow: `0 4px 24px ${levelUpData.color}66`,
              animation: "levelUpFadeIn 0.6s 1s ease-out both",
            }}>Continue</button>
          </div>
        )}
        <div style={{ ...styles.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 16, animation: "popIn 0.6s ease-out, float 3s 0.6s ease-in-out infinite" }}>{grade.icon}</div>
          <h1 style={{ fontFamily: "'Lilita One', sans-serif", fontSize: 42, color: grade.color, marginBottom: 12, animation: "popIn 0.6s 0.2s ease-out both" }}>{grade.label}</h1>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#E2E8F0", fontFamily: "'Lilita One', sans-serif", marginBottom: 8, animation: "popIn 0.6s 0.4s ease-out both" }}>{score} / {attempted}</div>

          {/* XP Breakdown */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "16px 24px", marginTop: 16, marginBottom: 8, minWidth: 280, animation: "slideUp 0.6s 0.5s ease-out both", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B", fontFamily: "'Lilita One', sans-serif" }}>⚡ {xp} XP</div>
            {isPerfect && <div style={{ fontSize: 14, color: "#34D399", fontWeight: 700, marginTop: 6 }}>🎯 Perfect Quiz — 2x XP Bonus!</div>}
            {speedBonuses > 0 && <div style={{ fontSize: 13, color: "#22C55E", marginTop: 4 }}>⚡ {speedBonuses} speed {speedBonuses === 1 ? "bonus" : "bonuses"} earned</div>}
            {maxStreak >= 3 && <div style={{ fontSize: 13, color: "#F97316", marginTop: 4 }}>🔥 Best streak: {maxStreak}</div>}
          </div>

          {/* Explorer Level Progress */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "14px 24px", marginBottom: 20, minWidth: 280, animation: "slideUp 0.6s 0.65s ease-out both", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{level.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: level.color }}>{level.name}</span>
            </div>
            {level.next && (
              <>
                <div style={{ width: "100%", height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${level.color}, ${level.next.color})`, width: `${Math.round(level.progress * 100)}%`, transition: "width 1s ease" }} />
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{activeProfile?.xp || 0} / {level.next.minXP} XP to {level.next.icon} {level.next.name}</div>
              </>
            )}
            {!level.next && <div style={{ fontSize: 12, color: "#F59E0B" }}>Max level reached!</div>}
          </div>

          <div style={{ display: "flex", gap: 24, marginBottom: 28, animation: "slideUp 0.6s 0.8s ease-out both" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 700, color: "#F87171" }}>❤️ {lives}</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Lives Left</div></div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 700, color: "#34D399" }}>🎯 {pct}%</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Accuracy</div></div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 700, color: "#F97316" }}>🔥 {maxStreak}</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Best Streak</div></div>
          </div>
          <div style={{ width: "100%", maxWidth: 500, marginBottom: 32, animation: "slideUp 0.6s 0.8s ease-out both" }}>
            <h3 style={{ fontSize: 18, color: "#94A3B8", marginBottom: 14, fontWeight: 600 }}>Review</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reviewQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: correctMap[i] ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)", border: `1px solid ${correctMap[i] ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)"}` }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{correctMap[i] ? "✅" : "❌"}</span>
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 6 }}>
                      {q.type === "map_tap" && <span style={{ fontSize: 16, flexShrink: 0 }}>📍</span>}
                      {q.shapePath && q.type !== "map_tap" && <svg viewBox={(() => { const n=q.shapePath.match(/[-\d.]+/g).map(Number); const xs=n.filter((_,i)=>i%2===0),ys=n.filter((_,i)=>i%2===1); const x1=Math.min(...xs),y1=Math.min(...ys),w=Math.max(...xs)-x1,h=Math.max(...ys)-y1; return `${x1-5} ${y1-5} ${w+10} ${h+10}`; })()} style={{ width: 24, height: 24, flexShrink: 0 }}><path d={q.shapePath} fill={REGIONS[q.region]?.color || "#22C55E"} fillOpacity={0.8} /></svg>}
                      <span>{q.shapePath || q.type === "map_tap" ? `${q.question} (${q.state})` : q.question}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: correctMap[i] ? "#34D399" : "#F87171" }}>{q.correct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, animation: "slideUp 0.6s 1s ease-out both" }}>
            <button onClick={() => startQuiz(quizRegions)} style={{ padding: "16px 36px", borderRadius: 99, background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none", color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Fredoka', sans-serif", boxShadow: "0 4px 20px rgba(34,197,94,0.3)" }}>Play Again 🔄</button>
            <button onClick={() => setScreen("home")} style={{ padding: "16px 36px", borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Fredoka', sans-serif" }}>Home 🏠</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
