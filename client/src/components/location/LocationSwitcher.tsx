import { useState } from "react";
import { MapPin, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation } from "@/context/LocationContext";
import { cn } from "@/lib/utils";

const locations = [
  { country: "United States", city: "New York" },
  { country: "United States", city: "Los Angeles" },
  { country: "United Kingdom", city: "London" },
  { country: "Canada", city: "Toronto" },
  { country: "Australia", city: "Sydney" },
  { country: "Japan", city: "Tokyo" },
  { country: "India", city: "Mumbai" },
  { country: "Germany", city: "Berlin" },
  { country: "France", city: "Paris" },
  { country: "Italy", city: "Rome" },
  { country: "Spain", city: "Madrid" },
  { country: "China", city: "Beijing" },
];

export default function LocationSwitcher() {
  const { userLocation, setUserLocation, isLocating, detectLocation } = useLocation();
  const [open, setOpen] = useState(false);

  const handleSelectLocation = (country: string, city: string) => {
    // Get currency and symbol based on country
    let currency = "USD";
    let currencySymbol = "$";

    if (country === "United Kingdom") {
      currency = "GBP";
      currencySymbol = "£";
    } else if (["Germany", "France", "Italy", "Spain"].includes(country)) {
      currency = "EUR";
      currencySymbol = "€";
    } else if (country === "Japan") {
      currency = "JPY";
      currencySymbol = "¥";
    } else if (country === "India") {
      currency = "INR";
      currencySymbol = "₹";
    } else if (country === "China") {
      currency = "CNY";
      currencySymbol = "¥";
    } else if (country === "Australia") {
      currency = "AUD";
      currencySymbol = "$";
    } else if (country === "Canada") {
      currency = "CAD";
      currencySymbol = "$";
    }

    setUserLocation({
      country,
      city,
      currency,
      currencySymbol
    });
    setOpen(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a location"
            className="flex items-center justify-between w-[200px] bg-background/60 backdrop-blur-sm"
          >
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              <span className="truncate">
                {userLocation.city}, {userLocation.country}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search location..." />
            <CommandList>
              <CommandEmpty>No location found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => detectLocation()}
                  className="flex items-center"
                >
                  {isLocating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  <span>{isLocating ? "Detecting location..." : "Detect my location"}</span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Available Locations">
                {locations.map(({ country, city }) => (
                  <CommandItem
                    key={`${country}-${city}`}
                    value={`${city}, ${country}`}
                    onSelect={() => handleSelectLocation(country, city)}
                    className="flex items-center"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        userLocation.country === country && userLocation.city === city
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span>
                      {city}, {country}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}