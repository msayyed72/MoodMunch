import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import FoodRecommendationPage from "@/pages/food-recommendation-page";
import RestaurantListPage from "@/pages/restaurant-list-page";
import RestaurantMenuPage from "@/pages/restaurant-menu-page";
import CheckoutPage from "@/pages/checkout-page";
import OrderSuccessPage from "@/pages/order-success-page";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import MobileNav from "./components/layout/MobileNav";
import CartSidebar from "./components/cart/CartSidebar";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { MoodProvider } from "./context/MoodContext";
import { CartProvider } from "./context/CartContext";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route path="/recommendations" component={FoodRecommendationPage} />
      <Route path="/restaurants" component={RestaurantListPage} />
      <Route path="/restaurant/:id" component={RestaurantMenuPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/order-success" component={OrderSuccessPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MoodProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
              <MobileNav />
              <CartSidebar />
              <Toaster />
            </div>
          </CartProvider>
        </MoodProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
