import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon, MapPin, Store, Clock } from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Order } from "@shared/schema";

export default function OrderSuccessPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders/latest"],
    enabled: !!user,
  });

  // Redirect if no order data is found and not loading
  useEffect(() => {
    if (!isLoading && !order) {
      navigate("/");
    }
  }, [order, isLoading, navigate]);

  // Format order time (simulated)
  const estimatedDeliveryTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-10 text-center">
      <div className="max-w-md mx-auto">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="h-10 w-10 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-700 opacity-70 mb-6">
          Your order has been placed and will be delivered in about 30-45 minutes. 
          You can track your order status below.
        </p>
        
        <Card className="bg-white rounded-xl shadow-sm mb-6">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">
                Order #{isLoading ? "..." : (order?.id || "").toString().padStart(5, '0')}
              </h3>
              <span className="bg-green-100 text-green-700 text-xs py-1 px-3 rounded-full">
                Confirmed
              </span>
            </div>
            
            <div className="space-y-3 mb-4 text-left">
              <div className="flex items-center">
                <Store className="text-primary h-5 w-5 mr-3" />
                <span className="text-gray-700">
                  {isLoading ? "Loading restaurant information..." : "Restaurant Name"}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="text-primary h-5 w-5 mr-3" />
                <span className="text-gray-700">
                  {isLoading ? "Loading address..." : order?.deliveryAddress}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="text-primary h-5 w-5 mr-3" />
                <span className="text-gray-700">
                  Estimated delivery: {estimatedDeliveryTime()}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
              <div className="bg-primary h-2 rounded-full w-1/4"></div>
            </div>
            
            <Button 
              className="w-full bg-secondary hover:bg-secondary/90 text-white"
              onClick={() => navigate("/orders")}
            >
              Track Order
            </Button>
          </CardContent>
        </Card>
        
        <Button 
          variant="ghost"
          className="text-primary"
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}
