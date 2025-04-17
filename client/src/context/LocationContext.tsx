import { createContext, ReactNode, useState, useEffect, useContext } from "react";

interface Location {
  country: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  currency: string;
  currencySymbol: string;
}

interface LocationContextType {
  userLocation: Location;
  setUserLocation: (location: Partial<Location>) => void;
  isLocating: boolean;
  detectLocation: () => Promise<void>;
  formatPrice: (price: string | number) => string;
}

const defaultLocation: Location = {
  country: "United States",
  city: "New York",
  latitude: null,
  longitude: null,
  currency: "USD",
  currencySymbol: "$"
};

export const LocationContext = createContext<LocationContextType | null>(null);

const currencyExchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.78,
  JPY: 151.64,
  INR: 83.48,
  CAD: 1.36,
  AUD: 1.48,
  CNY: 7.23,
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<Location>(defaultLocation);
  const [isLocating, setIsLocating] = useState(false);

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const result = data.results[0].components;
        setUserLocation({
          country: result.country || defaultLocation.country,
          city: result.city || defaultLocation.city,
          latitude,
          longitude,
          currency: getCurrencyByCountry(result.country_code) || defaultLocation.currency,
          currencySymbol: getCurrencySymbol(result.country_code) || defaultLocation.currencySymbol
        });
      }
    } catch (error) {
      console.error('Error detecting location:', error);
    } finally {
      setIsLocating(false);
    }
  };

  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const convertedPrice = numericPrice * (currencyExchangeRates[userLocation.currency] || 1);
    return new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: userLocation.currency
    }).format(convertedPrice);
  };

  return (
    <LocationContext.Provider value={{
      userLocation,
      setUserLocation: (location) => setUserLocation({ ...userLocation, ...location }),
      isLocating,
      detectLocation,
      formatPrice
    }}>
      {children}
    </LocationContext.Provider>
  );
};

const countryCurrencyMap: Record<string, { currency: string; symbol: string }> = {
  "United States": { currency: "USD", symbol: "$" },
  "United Kingdom": { currency: "GBP", symbol: "£" },
  "Canada": { currency: "CAD", symbol: "$" },
  "Australia": { currency: "AUD", symbol: "$" },
  "Japan": { currency: "JPY", symbol: "¥" },
  "India": { currency: "INR", symbol: "₹" },
  "China": { currency: "CNY", symbol: "¥" },
  "Germany": { currency: "EUR", symbol: "€" },
  "France": { currency: "EUR", symbol: "€" },
  "Italy": { currency: "EUR", symbol: "€" },
  "Spain": { currency: "EUR", symbol: "€" },
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<Location>(defaultLocation);
  const [isLocating, setIsLocating] = useState(false);

  const updateLocation = (locationData: Partial<Location>) => {
    setUserLocation(prevLocation => ({
      ...prevLocation,
      ...locationData
    }));
  };

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      // In a real app, we would use geolocation API and reverse geocoding
      // For this demo, we'll simulate location detection with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Randomly select a country for demo purposes
      const countries = Object.keys(countryCurrencyMap);
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const { currency, symbol } = countryCurrencyMap[randomCountry];
      
      updateLocation({
        country: randomCountry,
        city: randomCountry === "United States" ? "New York" : 
              randomCountry === "United Kingdom" ? "London" :
              randomCountry === "Japan" ? "Tokyo" :
              randomCountry === "India" ? "Mumbai" :
              randomCountry === "China" ? "Beijing" :
              randomCountry === "Australia" ? "Sydney" :
              randomCountry === "Canada" ? "Toronto" : "Paris",
        currency,
        currencySymbol: symbol,
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180
      });
    } catch (error) {
      console.error("Error detecting location:", error);
    } finally {
      setIsLocating(false);
    }
  };

  // Convert price from USD to user's local currency
  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
    
    if (isNaN(numericPrice)) return `${userLocation.currencySymbol}0.00`;
    
    const exchangeRate = currencyExchangeRates[userLocation.currency] || 1;
    const convertedPrice = numericPrice * exchangeRate;
    
    // Format based on currency
    if (userLocation.currency === 'JPY' || userLocation.currency === 'CNY') {
      return `${userLocation.currencySymbol}${Math.round(convertedPrice)}`;
    } else {
      return `${userLocation.currencySymbol}${convertedPrice.toFixed(2)}`;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        setUserLocation: updateLocation,
        isLocating,
        detectLocation,
        formatPrice
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}