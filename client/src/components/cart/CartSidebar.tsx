import { useCart } from "@/context/CartContext";
import { useLocation } from "wouter";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function CartSidebar() {
  const { 
    items, 
    removeFromCart, 
    incrementItem, 
    decrementItem,
    cartSubtotal,
    deliveryFee,
    tax,
    cartTotal,
    isCartOpen,
    closeCart,
  } = useCart();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to proceed to checkout",
        variant: "destructive",
      });
      closeCart();
      navigate("/auth");
      return;
    }

    closeCart();
    navigate("/checkout");
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-lg transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Your Cart</h3>
          <button 
            className="p-2"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h4>
              <p className="text-gray-700 opacity-70 mb-4">Add items from a restaurant to get started</p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  closeCart();
                  navigate("/");
                }}
              >
                Explore Restaurants
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">{items[0].restaurantName}</h4>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="flex items-center mr-2">
                        <button 
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                          onClick={() => decrementItem(item.id)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 text-gray-700" />
                        </button>
                        <span className="mx-2 w-6 text-center">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                          onClick={() => incrementItem(item.id)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </button>
                      </div>
                      <div className="flex-grow ml-2">
                        <p className="text-gray-800 font-medium">{item.name}</p>
                        <p className="text-sm text-gray-700 opacity-70">{item.description}</p>
                      </div>
                      <div className="ml-2 flex items-start">
                        <span className="font-medium text-gray-800 mr-2">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        <button 
                          className="text-red-500"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium text-gray-800">${cartSubtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Delivery Fee</span>
                <span className="font-medium text-gray-800">${deliveryFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tax</span>
                <span className="font-medium text-gray-800">${tax}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-800">Total</span>
              <span className="text-lg font-bold text-gray-800">${cartTotal}</span>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 h-auto"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}