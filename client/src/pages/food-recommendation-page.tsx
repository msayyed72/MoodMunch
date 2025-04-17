import { useQuery } from "@tanstack/react-query";
import { useMood } from "@/context/MoodContext";
import { useLocation } from "wouter";
import { Food } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function FoodRecommendationPage() {
  const { selectedMood, setSelectedFood } = useMood();
  const [, navigate] = useLocation();
  
  // Redirect to home if no mood is selected
  useEffect(() => {
    if (!selectedMood) {
      navigate("/");
    }
  }, [selectedMood, navigate]);

  const { data: foods, isLoading, error } = useQuery<Food[]>({
    queryKey: ["/api/foods", selectedMood?.id],
    enabled: !!selectedMood,
  });

  const handleFindRestaurants = (food: Food) => {
    setSelectedFood(food);
    navigate("/restaurants");
  };

  if (!selectedMood) {
    return null; // Will redirect to home in useEffect
  }

  const getMoodColor = (name: string): string => {
    switch (name.toLowerCase()) {
      case "happy": return "bg-amber-400 text-white";
      case "sad": return "bg-indigo-500 text-white";
      case "stressed": return "bg-red-500 text-white";
      case "relaxed": return "bg-green-500 text-white";
      case "energetic": return "bg-orange-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 p-2"
          onClick={() => navigate("/")}
          aria-label="Back to mood selection"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">
          Recommendations for <span className="text-primary">{selectedMood.name}</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          // Skeleton loading state
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden shadow-sm">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-500 mb-2">Failed to load food recommendations</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : foods?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-2">No recommendations found for this mood</p>
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
            >
              Try Another Mood
            </Button>
          </div>
        ) : (
          foods?.map((food) => (
            <Card key={food.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <img 
                src={food.imageUrl} 
                alt={food.name} 
                className="w-full h-48 object-cover" 
              />
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{food.name}</h3>
                <p className="text-gray-700 opacity-70 mb-3">{food.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`${getMoodColor(selectedMood.name)} text-xs py-1 px-3 rounded-full`}>
                    {selectedMood.name} Mood
                  </span>
                  <Button 
                    className="bg-secondary hover:bg-secondary/90 text-white"
                    onClick={() => handleFindRestaurants(food)}
                  >
                    Find Restaurants
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
