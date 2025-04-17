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

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

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

const getCurrencyByCountry = (countryCode: string | undefined): string | undefined => {
  // Implement your logic to get currency based on country code
  if (countryCode === 'USA') return 'USD';
  if (countryCode === 'GBR') return 'GBP';
  return undefined;
}

const getCurrencySymbol = (countryCode: string | undefined): string | undefined => {
  // Implement your logic to get currency symbol based on country code
  if (countryCode === 'USA') return '$';
  if (countryCode === 'GBR') return '£';
  return undefined;
}

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