import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/context/CartContext";
import { useLocation as useWouterLocation } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, LogOut, Settings, FileText, Heart, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationSwitcher from "@/components/location/LocationSwitcher";
import { useLocation } from "@/context/LocationContext";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { items: cartItems, toggleCart } = useCart();
  const [, navigate] = useWouterLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-md border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 
            className="text-2xl font-bold font-sans cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Food</span>
            <span className="text-gray-800">Mood</span>
          </h1>
          
          <nav className="hidden md:flex ml-8 space-x-1">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-gray-700 hover:text-primary hover:bg-gray-50"
            >
              <Home className="mr-1 h-4 w-4" />
              Home
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/restaurants")}
              className="text-gray-700 hover:text-primary hover:bg-gray-50"
            >
              <Heart className="mr-1 h-4 w-4" />
              Restaurants
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <LocationSwitcher />
          </div>
          
          <Button 
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            aria-label="Shopping Cart"
            className="relative rounded-full h-9 w-9 border border-gray-200 bg-white hover:bg-gray-50"
          >
            <ShoppingCart className="h-4 w-4 text-gray-700" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 border border-gray-200 bg-white hover:bg-gray-50"
              >
                <User className="h-4 w-4 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <div className="px-2 py-3 border-b">
                    <p className="text-sm font-medium leading-none">{user.name || user.username}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")}
                    className="flex items-center py-2"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => navigate("/orders")}
                    className="flex items-center py-2"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Order History</span>
                  </DropdownMenuItem>

                  {user.role === 'admin' && (
                    <DropdownMenuItem 
                      onClick={() => navigate("/admin")}
                      className="flex items-center py-2"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="px-2 py-2.5 border-b">
                    <p className="text-sm font-medium">Account</p>
                  </div>
                  <DropdownMenuItem 
                    onClick={() => navigate("/auth")}
                    className="flex items-center py-2"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign in or Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
