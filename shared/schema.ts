import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

// Moods table
export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertMoodSchema = createInsertSchema(moods).pick({
  name: true,
  icon: true,
  color: true,
});

// Foods table
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  moodId: integer("mood_id").notNull(),
});

export const insertFoodSchema = createInsertSchema(foods).pick({
  name: true,
  description: true,
  imageUrl: true,
  moodId: true,
});

// Restaurants table
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  deliveryFee: text("delivery_fee").notNull(),
  cuisines: text("cuisines").array().notNull(),
  country: text("country").default("United States"),
  city: text("city").default("New York"),
  currency: text("currency").default("USD"),
  currencySymbol: text("currency_symbol").default("$"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).pick({
  name: true,
  description: true,
  imageUrl: true,
  rating: true,
  reviewCount: true,
  deliveryTime: true,
  deliveryFee: true,
  cuisines: true,
  country: true,
  city: true,
  currency: true,
  currencySymbol: true,
  latitude: true,
  longitude: true,
});

// Restaurant-Food junction table
export const restaurantFoods = pgTable("restaurant_foods", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  foodId: integer("food_id").notNull(),
});

export const insertRestaurantFoodSchema = createInsertSchema(restaurantFoods).pick({
  restaurantId: true,
  foodId: true,
});

// Menu items table
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  restaurantId: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  status: text("status").notNull(),
  total: text("total").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  restaurantId: true,
  status: true,
  total: true,
  deliveryAddress: true,
  paymentMethod: true,
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: text("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  menuItemId: true,
  quantity: true,
  price: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moods.$inferSelect;

export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Food = typeof foods.$inferSelect;

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export type InsertRestaurantFood = z.infer<typeof insertRestaurantFoodSchema>;
export type RestaurantFood = typeof restaurantFoods.$inferSelect;

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  instructions?: string;
}

export interface CartItem {
  id: number;
  menuItemId: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
}

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const moodsRelations = relations(moods, ({ many }) => ({
  foods: many(foods),
}));

export const foodsRelations = relations(foods, ({ one, many }) => ({
  mood: one(moods, {
    fields: [foods.moodId],
    references: [moods.id],
  }),
  restaurantFoods: many(restaurantFoods),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  menuItems: many(menuItems),
  restaurantFoods: many(restaurantFoods),
  orders: many(orders),
}));

export const restaurantFoodsRelations = relations(restaurantFoods, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantFoods.restaurantId],
    references: [restaurants.id],
  }),
  food: one(foods, {
    fields: [restaurantFoods.foodId],
    references: [foods.id],
  }),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));
