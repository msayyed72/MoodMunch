import { useQuery } from "@tanstack/react-query";
import { Mood } from "@shared/schema";
import { useMood } from "@/context/MoodContext";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { setSelectedMood } = useMood();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: moods, isLoading, error } = useQuery<Mood[]>({
    queryKey: ["/api/moods"],
  });

  const handleMoodSelection = (mood: Mood) => {
    setSelectedMood(mood);
    navigate("/recommendations");
  };

  const getMoodIconColor = (name: string): { bgColor: string, icon: JSX.Element } => {
    switch (name.toLowerCase()) {
      case "happy":
        return { 
          bgColor: "bg-amber-400", 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        };
      case "sad":
        return { 
          bgColor: "bg-indigo-500", 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        };
      case "stressed":
        return { 
          bgColor: "bg-red-500", 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
        };
      case "relaxed":
        return { 
          bgColor: "bg-green-500", 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
        };
      case "energetic":
        return { 
          bgColor: "bg-orange-500", 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        };
      default:
        return { 
          bgColor: "bg-gray-500", 
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
        };
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">How are you feeling today?</h2>
      <p className="text-gray-700 mb-6">Select your mood and we'll recommend foods that match</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {isLoading ? (
          // Skeleton loading state
          Array(5).fill(0).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="pt-6 p-5 flex flex-col items-center justify-center">
                <Skeleton className="w-16 h-16 rounded-full mb-3" />
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-500 mb-2">Failed to load moods</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : (
          moods?.map((mood) => {
            const { bgColor, icon } = getMoodIconColor(mood.name);
            
            return (
              <button 
                key={mood.id}
                className="mood-card bg-white rounded-xl p-5 flex flex-col items-center justify-center shadow-sm hover:scale-105 transition-transform duration-200 border-2 border-transparent hover:border-primary"
                onClick={() => handleMoodSelection(mood)}
              >
                <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center mb-3`}>
                  {icon}
                </div>
                <span className="font-medium text-gray-800">{mood.name}</span>
              </button>
            );
          })
        )}
      </div>
      
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Previous Orders</h3>
          {user ? (
            <div>
              <p className="text-gray-700 opacity-70 mb-4">You can view your order history here</p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => navigate("/orders")}
              >
                View Orders
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 opacity-70 mb-4">Sign in to view your order history</p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
