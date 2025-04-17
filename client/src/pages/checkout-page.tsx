import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect } from "react";
import { DeliveryInfo } from "@shared/schema";

const deliveryInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
  instructions: z.string().optional(),
  paymentMethod: z.enum(["cod", "online"]),
});

type DeliveryInfoValues = z.infer<typeof deliveryInfoSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { cartItems, cartSubtotal, deliveryFee, tax, cartTotal, currentRestaurantId, clearCart } = useCart();
  const { user } = useAuth();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  const form = useForm<DeliveryInfoValues>({
    resolver: zodResolver(deliveryInfoSchema),
    defaultValues: {
      name: user?.name || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      instructions: "",
      paymentMethod: "cod",
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: DeliveryInfoValues) => {
      const deliveryAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`;
      
      const orderData = {
        userId: user?.id,
        restaurantId: currentRestaurantId,
        status: "pending",
        total: cartTotal,
        deliveryAddress,
        paymentMethod: data.paymentMethod,
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryInfo: data,
      };
      
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      clearCart();
      navigate("/order-success");
    },
  });

  const onSubmit = (data: DeliveryInfoValues) => {
    orderMutation.mutate(data);
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 p-2"
          onClick={() => navigate(`/restaurant/${currentRestaurantId}`)}
          aria-label="Back to restaurant menu"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">Checkout</h2>
      </div>
      
      <div className="lg:flex lg:space-x-6">
        <div className="lg:w-2/3">
          <Card className="bg-white rounded-xl shadow-sm mb-6">
            <CardContent className="p-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Delivery Information</h3>
              
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Phone Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Zip Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special instructions for delivery" 
                            className="h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-xl shadow-sm mb-6">
            <CardContent className="p-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h3>
              
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                            <RadioGroupItem value="cod" id="cod" />
                            <div className="ml-3">
                              <label htmlFor="cod" className="font-medium text-gray-800 block">Cash on Delivery</label>
                              <p className="text-sm text-gray-700 opacity-70">Pay with cash when your order arrives</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                            <RadioGroupItem value="online" id="online" />
                            <div className="ml-3">
                              <label htmlFor="online" className="font-medium text-gray-800 block">Online Payment (Demo)</label>
                              <p className="text-sm text-gray-700 opacity-70">Pay securely with credit/debit card</p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-1/3">
          <Card className="bg-white rounded-xl shadow-sm mb-6 sticky top-24">
            <CardContent className="p-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">{cartItems[0]?.restaurantName}</h4>
                
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex items-start">
                        <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center mr-2">
                          {item.quantity}
                        </span>
                        <div>
                          <p className="text-gray-800 font-medium">{item.name}</p>
                          <p className="text-sm text-gray-700 opacity-70">{item.description}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-800">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
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
              
              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
                <span className="text-lg font-medium text-gray-800">Total</span>
                <span className="text-lg font-bold text-gray-800">${cartTotal}</span>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 h-auto"
                onClick={form.handleSubmit(onSubmit)}
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? "Processing..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
