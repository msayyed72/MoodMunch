import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get all moods
  app.get("/api/moods", async (req, res) => {
    try {
      const moods = await storage.getAllMoods();
      res.json(moods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch moods" });
    }
  });

  // Get foods by mood
  app.get("/api/foods/:moodId", async (req, res) => {
    try {
      const moodId = parseInt(req.params.moodId);
      const foods = await storage.getFoodsByMood(moodId);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch foods" });
    }
  });

  // Get all foods
  app.get("/api/foods", async (req, res) => {
    try {
      const foods = await storage.getAllFoods();
      res.json(foods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch foods" });
    }
  });

  // Get restaurants by food
  app.get("/api/restaurants/:foodId", async (req, res) => {
    try {
      const foodId = parseInt(req.params.foodId);
      const restaurants = await storage.getRestaurantsByFood(foodId);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  // Get all restaurants
  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getAllRestaurants();
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  // Get a specific restaurant
  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(id);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurant" });
    }
  });

  // Get menu items for a restaurant
  app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const menuItems = await storage.getMenuItems(restaurantId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  // Create an order
  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to place an order" });
      }

      const orderData = {
        userId: req.user.id,
        restaurantId: req.body.restaurantId,
        status: req.body.status,
        total: req.body.total,
        deliveryAddress: req.body.deliveryAddress,
        paymentMethod: req.body.paymentMethod,
      };

      const order = await storage.createOrder(orderData);
      
      // Add order items
      for (const item of req.body.items) {
        await storage.addOrderItem({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get user's orders
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to view orders" });
      }

      const orders = await storage.getOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get user's latest order
  app.get("/api/orders/latest", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to view orders" });
      }

      const order = await storage.getLatestOrderByUser(req.user.id);
      if (!order) {
        return res.status(404).json({ error: "No orders found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest order" });
    }
  });

  // Get a specific order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to view orders" });
      }

      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Check if order belongs to user
      if (order.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to view this order" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
