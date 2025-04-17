import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Restaurant, MenuItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function RestaurantMenuPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/restaurant/:id");
  const restaurantId = match ? parseInt(params.id) : null;
  const { addToCart } = useCart();

  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const response = await fetch(`/api/restaurants/${restaurantId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch restaurant');
      }
      return response.json();
    },
    enabled: !!restaurantId,
  });

  const { data: menuItems, isLoading: isLoadingMenu, error } = useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", restaurantId, "menu"],
    queryFn: async () => {
      if (!restaurantId) return [];
      const response = await fetch(`/api/restaurants/${restaurantId}/menu`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      return response.json();
    },
    enabled: !!restaurantId,
  });

  const handleAddToCart = (item: MenuItem) => {
    if (restaurant) {
      addToCart({
        menuItemId: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      });
    }
  };

  if (!restaurantId || (!isLoadingRestaurant && !restaurant)) {
    navigate("/restaurants");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
        <button 
          className="mr-2 p-2"
          onClick={() => navigate("/restaurants")}
          aria-label="Back to restaurant list"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">
          {isLoadingRestaurant ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            restaurant?.name
          )}
        </h2>
      </div>
      
      <Card className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
        {isLoadingRestaurant ? (
          <Skeleton className="w-full h-48 md:h-64" />
        ) : (
          <img 
            src={restaurant?.imageUrl} 
            alt={restaurant?.name} 
            className="w-full h-48 md:h-64 object-cover" 
          />
        )}
        <CardContent className="p-4">
          {isLoadingRestaurant ? (
            <>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <div className="flex flex-wrap gap-2">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
            </>
          ) : (
            <>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center space-x-1 bg-green-50 py-1 px-2 rounded-lg mr-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-800">{(restaurant?.rating as number / 10).toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-700 opacity-70">({restaurant?.reviewCount} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {restaurant?.cuisines?.map((cuisine, index) => (
                      <span key={index} className="bg-gray-200 text-gray-800 text-xs py-1 px-3 rounded-full">
                        {cuisine}
                      </span>
                    )) || null}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-700 opacity-70 h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span className="text-sm text-gray-700">{restaurant?.deliveryTime}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-700 opacity-70 h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1"></path><path d="M8 12h8"></path><circle cx="8" cy="20" r="1"></circle><circle cx="16" cy="20" r="1"></circle><path d="M16 8 18 12 21 11 19 17 13 17 14 16"></path><path d="m9 8 1 8"></path><path d="M4 9h5"></path></svg>
                    <span className="text-sm text-gray-700">{restaurant?.deliveryFee} delivery</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 opacity-70">{restaurant?.description}</p>
            </>
          )}
        </CardContent>
      </Card>
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Menu</h3>
        
        {isLoadingMenu ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm flex">
                <Skeleton className="w-24 h-24 rounded-lg mr-4" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">Failed to load menu items</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : menuItems?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No menu items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {menuItems?.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm flex">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-24 h-24 rounded-lg object-cover mr-4" 
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <span className="font-medium text-gray-800">${parseFloat(item.price).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-700 opacity-70 mb-3">{item.description}</p>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white py-1 px-3 h-auto"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
