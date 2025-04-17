
import { createContext, ReactNode, useContext, useState } from "react";

export interface CartItem {
  id: number;
  menuItemId: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  specialInstructions?: string;
  customizations?: Record<string, string>;
  restaurantId: number;
  restaurantName: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateInstructions: (itemId: number, instructions: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getTaxes: () => number;
  getDeliveryFee: () => number;
  isCartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const TAX_RATE = 0.08;
  const BASE_DELIVERY_FEE = 2.99;

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.menuItemId === item.menuItemId);
      if (existingItem) {
        return prev.map(i => 
          i.menuItemId === item.menuItemId 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (itemId: number) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const updateInstructions = (itemId: number, instructions: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, specialInstructions: instructions } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const getSubtotal = () => {
    return items.reduce((sum, item) => 
      sum + parseFloat(item.price) * item.quantity, 0
    );
  };

  const getTaxes = () => getSubtotal() * TAX_RATE;

  const getDeliveryFee = () => {
    const subtotal = getSubtotal();
    return subtotal > 30 ? 0 : BASE_DELIVERY_FEE;
  };

  const getTotal = () => {
    return getSubtotal() + getTaxes() + getDeliveryFee();
  };

  const toggleCart = () => setIsCartOpen(prev => !prev);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      updateInstructions,
      clearCart,
      getSubtotal,
      getTotal,
      getTaxes,
      getDeliveryFee,
      isCartOpen,
      toggleCart,
      closeCart
    }}>
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
