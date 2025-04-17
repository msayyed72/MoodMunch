import { createContext, ReactNode, useContext, useState } from "react";
import { CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeFromCart: (itemId: number) => void;
  incrementItem: (itemId: number) => void;
  decrementItem: (itemId: number) => void;
  clearCart: () => void;
  cartSubtotal: string;
  deliveryFee: string;
  tax: string;
  cartTotal: string;
  isCartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  currentRestaurantId: number | null;
}

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<number | null>(null);
  const { toast } = useToast();

  const calculateCartSubtotal = (): string => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    return subtotal.toFixed(2);
  };

  const cartSubtotal = calculateCartSubtotal();
  const deliveryFee = cartItems.length > 0 ? "2.99" : "0.00";
  const tax = (parseFloat(cartSubtotal) * 0.1).toFixed(2);
  const cartTotal = (
    parseFloat(cartSubtotal) +
    parseFloat(deliveryFee) +
    parseFloat(tax)
  ).toFixed(2);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const addToCart = (newItem: Omit<CartItem, "id" | "quantity">) => {
    // If trying to add an item from a different restaurant, show warning
    if (cartItems.length > 0 && currentRestaurantId !== newItem.restaurantId) {
      toast({
        variant: "destructive",
        title: "Items from different restaurants",
        description: "Your cart contains items from a different restaurant. Would you like to clear your cart and add this item?",
        action: (
          <button
            className="rounded bg-white text-primary font-medium py-1 px-3"
            onClick={() => {
              setCartItems([{...newItem, id: 1, quantity: 1}]);
              setCurrentRestaurantId(newItem.restaurantId);
              openCart();
            }}
          >
            Clear & Add
          </button>
        ),
      });
      return;
    }

    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.menuItemId === newItem.menuItemId
      );

      if (existingItemIndex !== -1) {
        // If item already exists, increment quantity
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // If adding first item, set the current restaurant
        if (prev.length === 0) {
          setCurrentRestaurantId(newItem.restaurantId);
        }
        // Add new item with id and quantity
        const newId = prev.length > 0 ? Math.max(...prev.map(item => item.id)) + 1 : 1;
        return [...prev, { ...newItem, id: newId, quantity: 1 }];
      }
    });

    toast({
      title: "Item added to cart",
      description: `${newItem.name} has been added to your cart.`,
    });

    openCart();
  };

  const removeFromCart = (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    
    // If removing last item, clear current restaurant
    if (cartItems.length === 1) {
      setCurrentRestaurantId(null);
    }
  };

  const incrementItem = (itemId: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementItem = (itemId: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter((item) => !(item.id === itemId && item.quantity === 1))
    );
    
    // If removing last item, clear current restaurant
    if (cartItems.length === 1 && cartItems[0].id === itemId && cartItems[0].quantity === 1) {
      setCurrentRestaurantId(null);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCurrentRestaurantId(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        incrementItem,
        decrementItem,
        clearCart,
        cartSubtotal,
        deliveryFee,
        tax,
        cartTotal,
        isCartOpen,
        toggleCart,
        closeCart,
        openCart,
        currentRestaurantId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
