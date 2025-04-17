import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/context/CartContext";
import { useLocation } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User } from "lucide-react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { cartItems, toggleCart } = useCart();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 
            className="text-2xl font-bold font-sans cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <span className="text-primary">Food</span>
            <span className="text-secondary">Mood</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="relative p-2"
            onClick={toggleCart}
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 focus:outline-none">
              <User className="h-5 w-5 text-gray-700" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem className="font-medium">
                    Hi, {user.name || user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => navigate("/auth")}>
                  Login / Register
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
