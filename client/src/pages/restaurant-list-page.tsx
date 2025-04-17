import { useQuery } from "@tanstack/react-query";
import { useMood } from "@/context/MoodContext";
import { useLocation } from "wouter";
import { Restaurant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Clock, Bike } from "lucide-react";
import { useEffect } from "react";

export default function RestaurantListPage() {
  const { selectedFood } = useMood();
  const [, navigate] = useLocation();

  // Redirect to home if no food is selected
  useEffect(() => {
    if (!selectedFood) {
      navigate("/recommendations");
    }
  }, [selectedFood, navigate]);

  const { data: restaurants, isLoading, error } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", selectedFood?.id],
    enabled: !!selectedFood,
  });

  const handleViewMenu = (restaurantId: number) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (!selectedFood) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 p-2"
          onClick={() => navigate("/recommendations")}
          aria-label="Back to food recommendations"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">
          Restaurants with <span className="text-primary">{selectedFood.name}</span>
        </h2>
      </div>
      
      <div className="space-y-6 mb-8">
        {isLoading ? (
          // Skeleton loading state
          Array(3).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden shadow-sm">
              <div className="md:flex">
                <Skeleton className="w-full md:w-48 h-48" />
                <div className="p-4 md:flex-1">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-20 rounded-full" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">Failed to load restaurants</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : restaurants?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No restaurants found for this food</p>
            <Button 
              onClick={() => navigate("/recommendations")}
              variant="outline"
            >
              Try Another Food
            </Button>
          </div>
        ) : (
          restaurants?.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="md:flex">
                <img 
                  src={restaurant.imageUrl} 
                  alt={restaurant.name} 
                  className="w-full md:w-48 h-48 object-cover" 
                />
                <div className="p-4 md:flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{restaurant.name}</h3>
                    <div className="flex items-center space-x-1 bg-green-50 py-1 px-2 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-800">{(restaurant.rating / 10).toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 opacity-70 mb-3">{restaurant.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.cuisines.map((cuisine, index) => (
                      <span key={index} className="bg-gray-200 text-gray-800 text-xs py-1 px-3 rounded-full">
                        {cuisine}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="text-gray-700 opacity-70 h-4 w-4 mr-1" />
                        <span className="text-sm text-gray-700">{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Bike className="text-gray-700 opacity-70 h-4 w-4 mr-1" />
                        <span className="text-sm text-gray-700">{restaurant.deliveryFee} delivery</span>
                      </div>
                    </div>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => handleViewMenu(restaurant.id)}
                    >
                      View Menu
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
