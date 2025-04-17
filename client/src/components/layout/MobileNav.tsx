import { useLocation } from "wouter";
import { Home, Search, ShoppingCart, FileText, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNav() {
  const [location, navigate] = useLocation();
  const { items: cartItems, toggleCart } = useCart();
  const { user } = useAuth();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-between items-center">
        <button 
          className={`flex flex-col items-center p-2 ${location === "/" ? "text-primary" : "text-gray-700 opacity-70"}`}
          onClick={() => navigate("/")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button 
          className="flex flex-col items-center p-2 text-gray-700 opacity-70"
          onClick={() => navigate("/search")}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </button>
        
        <button 
          className="flex flex-col items-center p-2 text-gray-700 opacity-70"
          onClick={toggleCart}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">Cart</span>
        </button>
        
        <button 
          className={`flex flex-col items-center p-2 ${location === "/orders" ? "text-primary" : "text-gray-700 opacity-70"}`}
          onClick={() => navigate("/orders")}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        
        <button 
          className={`flex flex-col items-center p-2 ${location === "/auth" || location === "/profile" ? "text-primary" : "text-gray-700 opacity-70"}`}
          onClick={() => user ? navigate("/profile") : navigate("/auth")}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Account</span>
        </button>
      </div>
    </div>
  );
}
