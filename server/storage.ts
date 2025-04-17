import { users, moods, foods, restaurants, restaurantFoods, menuItems, orders, orderItems, type User, type InsertUser, type Mood, type Food, type Restaurant, type MenuItem, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type RestaurantFood } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";

type SessionStore = session.Store;

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mood methods
  getAllMoods(): Promise<Mood[]>;
  getMood(id: number): Promise<Mood | undefined>;
  
  // Food methods
  getAllFoods(): Promise<Food[]>;
  getFood(id: number): Promise<Food | undefined>;
  getFoodsByMood(moodId: number): Promise<Food[]>;
  
  // Restaurant methods
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantsByFood(foodId: number): Promise<Restaurant[]>;
  
  // Restaurant-Food junction methods
  getRestaurantFoods(): Promise<RestaurantFood[]>;
  
  // Menu items methods
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getMenuItems(restaurantId: number): Promise<MenuItem[]>;
  
  // Order methods
  createOrder(order: Omit<InsertOrder, "createdAt">): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getLatestOrderByUser(userId: number): Promise<Order | undefined>;
  
  // Order items methods
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private moods: Map<number, Mood>;
  private foods: Map<number, Food>;
  private restaurants: Map<number, Restaurant>;
  private restaurantFoods: Map<number, RestaurantFood>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  sessionStore: session.SessionStore;
  
  // ID counters
  private userId: number;
  private moodId: number;
  private foodId: number;
  private restaurantId: number;
  private restaurantFoodId: number;
  private menuItemId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.moods = new Map();
    this.foods = new Map();
    this.restaurants = new Map();
    this.restaurantFoods = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.moodId = 1;
    this.foodId = 1;
    this.restaurantId = 1;
    this.restaurantFoodId = 1;
    this.menuItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Mood methods
  async getAllMoods(): Promise<Mood[]> {
    return Array.from(this.moods.values());
  }
  
  async getMood(id: number): Promise<Mood | undefined> {
    return this.moods.get(id);
  }
  
  // Food methods
  async getAllFoods(): Promise<Food[]> {
    return Array.from(this.foods.values());
  }
  
  async getFood(id: number): Promise<Food | undefined> {
    return this.foods.get(id);
  }
  
  async getFoodsByMood(moodId: number): Promise<Food[]> {
    return Array.from(this.foods.values()).filter(
      (food) => food.moodId === moodId,
    );
  }
  
  // Restaurant methods
  async getAllRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }
  
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }
  
  async getRestaurantsByFood(foodId: number): Promise<Restaurant[]> {
    // Find restaurant-food pairs for the given food ID
    const restaurantFoodPairs = Array.from(this.restaurantFoods.values()).filter(
      (pair) => pair.foodId === foodId,
    );
    
    // Get the restaurant IDs from the pairs
    const restaurantIds = restaurantFoodPairs.map((pair) => pair.restaurantId);
    
    // Return restaurants with matching IDs
    return Array.from(this.restaurants.values()).filter(
      (restaurant) => restaurantIds.includes(restaurant.id),
    );
  }
  
  // Restaurant-Food junction methods
  async getRestaurantFoods(): Promise<RestaurantFood[]> {
    return Array.from(this.restaurantFoods.values());
  }
  
  // Menu items methods
  async getAllMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }
  
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  async getMenuItems(restaurantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.restaurantId === restaurantId,
    );
  }
  
  // Order methods
  async createOrder(order: Omit<InsertOrder, "createdAt">): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date(),
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first
  }
  
  async getLatestOrderByUser(userId: number): Promise<Order | undefined> {
    const userOrders = await this.getOrdersByUser(userId);
    return userOrders.length > 0 ? userOrders[0] : undefined;
  }
  
  // Order items methods
  async addOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const orderItem: OrderItem = { ...item, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }
  
  // Initialize with sample data
  private initializeSampleData() {
    // Add moods
    const moods: Partial<Mood>[] = [
      { name: "Happy", icon: "emotion-happy-line", color: "#FFCC29" },
      { name: "Sad", icon: "emotion-sad-line", color: "#6665DD" },
      { name: "Stressed", icon: "mental-health-line", color: "#FF5C58" },
      { name: "Relaxed", icon: "rest-time-line", color: "#61B15A" },
      { name: "Energetic", icon: "run-line", color: "#FFA500" },
    ];
    
    moods.forEach((mood) => {
      const id = this.moodId++;
      this.moods.set(id, { ...mood, id } as Mood);
    });
    
    // Add foods for each mood
    // Happy mood foods
    const happyFoods: Partial<Food>[] = [
      { 
        name: "Pizza", 
        description: "Comfort food that boosts your happiness with its perfect balance of carbs and cheese.",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 1 
      },
      { 
        name: "Ice Cream", 
        description: "A sweet treat that triggers the release of serotonin, perfect for celebrating good moments.",
        imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 1 
      },
      { 
        name: "Pasta", 
        description: "A versatile dish that satisfies your carb cravings and provides quick energy for your good mood.",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 1 
      },
    ];
    
    // Sad mood foods
    const sadFoods: Partial<Food>[] = [
      { 
        name: "Chocolate", 
        description: "Rich in compounds that help elevate mood, chocolate is a classic comfort food for emotional relief.",
        imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 2 
      },
      { 
        name: "Mac and Cheese", 
        description: "A warm, creamy comfort food that provides a sense of nostalgia and security.",
        imageUrl: "https://images.unsplash.com/photo-1543352634-99a5d50ae78e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 2 
      },
      { 
        name: "Soup", 
        description: "Warm, nourishing soups can be both comforting and hydrating when you're feeling down.",
        imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 2 
      },
    ];
    
    // Stressed mood foods
    const stressedFoods: Partial<Food>[] = [
      { 
        name: "Dark Chocolate", 
        description: "Contains compounds that can reduce stress hormones and improve cognitive function.",
        imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 3 
      },
      { 
        name: "Herbal Tea", 
        description: "Chamomile and other herbal teas can help calm your nervous system and reduce anxiety.",
        imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 3 
      },
      { 
        name: "Avocado Toast", 
        description: "Rich in B vitamins that help your body manage stress, with complex carbs for sustained energy.",
        imageUrl: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 3 
      },
    ];
    
    // Relaxed mood foods
    const relaxedFoods: Partial<Food>[] = [
      { 
        name: "Sushi", 
        description: "Light and nutritious, sushi provides omega-3 fatty acids that can help maintain your calm state.",
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 4 
      },
      { 
        name: "Mediterranean Salad", 
        description: "Fresh ingredients rich in antioxidants help maintain a balanced mood and energy level.",
        imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 4 
      },
      { 
        name: "Smoothie Bowl", 
        description: "Packed with fruits that contain natural sugars to maintain your relaxed state without a crash.",
        imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 4 
      },
    ];
    
    // Energetic mood foods
    const energeticFoods: Partial<Food>[] = [
      { 
        name: "Protein Bowl", 
        description: "Balanced mix of protein and complex carbs to sustain your energy throughout the day.",
        imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 5 
      },
      { 
        name: "Energy Bars", 
        description: "Nutrient-dense snacks designed to provide quick energy when you're on the move.",
        imageUrl: "https://images.unsplash.com/photo-1571748982800-eac93a4ea375?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 5 
      },
      { 
        name: "Fresh Fruit Salad", 
        description: "Natural sugars and vitamins from a variety of fruits to keep your energy levels high.",
        imageUrl: "https://images.unsplash.com/photo-1568158879083-c42860933ed7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        moodId: 5 
      },
    ];
    
    // Add all foods
    [...happyFoods, ...sadFoods, ...stressedFoods, ...relaxedFoods, ...energeticFoods].forEach((food) => {
      const id = this.foodId++;
      this.foods.set(id, { ...food, id } as Food);
    });
    
    // Add restaurants
    const restaurants: Partial<Restaurant>[] = [
      {
        name: "Pizza Palace",
        description: "Authentic Italian pizzas made with fresh ingredients and traditional recipes.",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 48,
        reviewCount: 234,
        deliveryTime: "30-45 min",
        deliveryFee: "$2.99",
        cuisines: ["Italian", "Pizza", "Fast Delivery"],
      },
      {
        name: "Giuseppe's",
        description: "Family-owned Italian restaurant with wood-fired pizzas and homemade pasta.",
        imageUrl: "https://images.unsplash.com/photo-1564759298141-cba1a71c7f69?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 45,
        reviewCount: 187,
        deliveryTime: "40-55 min",
        deliveryFee: "$3.49",
        cuisines: ["Italian", "Pizza", "Pasta"],
      },
      {
        name: "Sweet Treats",
        description: "Homemade ice cream and desserts using organic, locally-sourced ingredients.",
        imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 47,
        reviewCount: 156,
        deliveryTime: "25-40 min",
        deliveryFee: "$3.99",
        cuisines: ["Dessert", "Ice Cream", "Sweets"],
      },
      {
        name: "Pasta Paradise",
        description: "Authentic Italian pasta dishes made with imported ingredients and traditional recipes.",
        imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 46,
        reviewCount: 203,
        deliveryTime: "35-50 min",
        deliveryFee: "$3.29",
        cuisines: ["Italian", "Pasta", "Vegetarian Options"],
      },
      {
        name: "Chocolate Heaven",
        description: "Premium chocolates and desserts for chocolate lovers of all kinds.",
        imageUrl: "https://images.unsplash.com/photo-1549007994-cb8bed potomatic?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 49,
        reviewCount: 178,
        deliveryTime: "30-45 min",
        deliveryFee: "$4.49",
        cuisines: ["Dessert", "Chocolate", "Bakery"],
      },
      {
        name: "Comfort Kitchen",
        description: "Homestyle cooking with a focus on classic comfort foods and family recipes.",
        imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 44,
        reviewCount: 142,
        deliveryTime: "40-55 min",
        deliveryFee: "$2.79",
        cuisines: ["American", "Comfort Food", "Mac and Cheese"],
      },
      {
        name: "Soup & Soul",
        description: "Artisanal soups made fresh daily with seasonal ingredients and global flavors.",
        imageUrl: "https://images.unsplash.com/photo-1589227365533-cee630bd59bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 46,
        reviewCount: 128,
        deliveryTime: "30-45 min",
        deliveryFee: "$3.19",
        cuisines: ["Soup", "Healthy", "Vegetarian Options"],
      },
      {
        name: "Zen Sushi",
        description: "Traditional and creative sushi rolls prepared by expert chefs using fresh ingredients.",
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 47,
        reviewCount: 192,
        deliveryTime: "35-50 min",
        deliveryFee: "$4.99",
        cuisines: ["Japanese", "Sushi", "Asian"],
      },
      {
        name: "Mediterranean Magic",
        description: "Fresh Mediterranean dishes featuring olive oil, herbs, and traditional recipes.",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 45,
        reviewCount: 167,
        deliveryTime: "35-50 min",
        deliveryFee: "$3.69",
        cuisines: ["Mediterranean", "Healthy", "Salads"],
      },
      {
        name: "Smoothie Station",
        description: "Nutritious smoothies and bowls made with fresh fruits, superfoods, and plant-based proteins.",
        imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 46,
        reviewCount: 145,
        deliveryTime: "20-35 min",
        deliveryFee: "$2.99",
        cuisines: ["Smoothies", "Healthy", "Vegan"],
      },
      {
        name: "Protein Power",
        description: "Nutrient-dense meals designed for active individuals and fitness enthusiasts.",
        imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 45,
        reviewCount: 163,
        deliveryTime: "30-45 min",
        deliveryFee: "$3.49",
        cuisines: ["Healthy", "Protein", "Fitness"],
      },
      {
        name: "Fruit Fusion",
        description: "Colorful fruit salads, platters, and desserts made with the freshest seasonal fruits.",
        imageUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
        rating: 44,
        reviewCount: 132,
        deliveryTime: "25-40 min",
        deliveryFee: "$3.29",
        cuisines: ["Fruit", "Healthy", "Dessert"],
      },
    ];
    
    restaurants.forEach((restaurant) => {
      const id = this.restaurantId++;
      this.restaurants.set(id, { ...restaurant, id } as Restaurant);
    });
    
    // Set up restaurant-food relationships
    // For Pizza (food id 1)
    this.addRestaurantFood(1, 1); // Pizza Palace
    this.addRestaurantFood(1, 2); // Giuseppe's
    
    // For Ice Cream (food id 2)
    this.addRestaurantFood(2, 3); // Sweet Treats
    
    // For Pasta (food id 3)
    this.addRestaurantFood(3, 2); // Giuseppe's
    this.addRestaurantFood(3, 4); // Pasta Paradise
    
    // For Chocolate (food id 4)
    this.addRestaurantFood(4, 3); // Sweet Treats
    this.addRestaurantFood(4, 5); // Chocolate Heaven
    
    // For Mac and Cheese (food id 5)
    this.addRestaurantFood(5, 6); // Comfort Kitchen
    
    // For Soup (food id 6)
    this.addRestaurantFood(6, 6); // Comfort Kitchen
    this.addRestaurantFood(6, 7); // Soup & Soul
    
    // For Dark Chocolate (food id 7)
    this.addRestaurantFood(7, 5); // Chocolate Heaven
    
    // For Herbal Tea (food id 8)
    this.addRestaurantFood(8, 7); // Soup & Soul
    
    // For Avocado Toast (food id 9)
    this.addRestaurantFood(9, 6); // Comfort Kitchen
    this.addRestaurantFood(9, 9); // Mediterranean Magic
    
    // For Sushi (food id 10)
    this.addRestaurantFood(10, 8); // Zen Sushi
    
    // For Mediterranean Salad (food id 11)
    this.addRestaurantFood(11, 9); // Mediterranean Magic
    
    // For Smoothie Bowl (food id 12)
    this.addRestaurantFood(12, 10); // Smoothie Station
    
    // For Protein Bowl (food id 13)
    this.addRestaurantFood(13, 11); // Protein Power
    
    // For Energy Bars (food id 14)
    this.addRestaurantFood(14, 11); // Protein Power
    
    // For Fresh Fruit Salad (food id 15)
    this.addRestaurantFood(15, 10); // Smoothie Station
    this.addRestaurantFood(15, 12); // Fruit Fusion
    
    // Add menu items for each restaurant
    this.addMenuItemsForRestaurants();
  }
  
  private addRestaurantFood(foodId: number, restaurantId: number) {
    const id = this.restaurantFoodId++;
    this.restaurantFoods.set(id, { id, foodId, restaurantId });
  }
  
  private addMenuItemsForRestaurants() {
    // Pizza Palace menu items
    const pizzaPalaceItems: Partial<MenuItem>[] = [
      {
        restaurantId: 1,
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, fresh mozzarella, and basil.",
        price: "12.99",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 1,
        name: "Pepperoni Pizza",
        description: "Classic pizza topped with tomato sauce, mozzarella, and spicy pepperoni.",
        price: "14.99",
        imageUrl: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 1,
        name: "Vegetarian Pizza",
        description: "Pizza topped with bell peppers, olives, onions, mushrooms, and fresh tomatoes.",
        price: "13.99",
        imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4fe41?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 1,
        name: "Garlic Breadsticks",
        description: "Freshly baked breadsticks brushed with garlic butter and herbs.",
        price: "5.99",
        imageUrl: "https://images.unsplash.com/photo-1548369937-47519962c11a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
    ];
    
    // Giuseppe's menu items
    const giuseppesItems: Partial<MenuItem>[] = [
      {
        restaurantId: 2,
        name: "Classic Spaghetti",
        description: "Traditional spaghetti with homemade tomato sauce and fresh basil.",
        price: "13.99",
        imageUrl: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 2,
        name: "Fettuccine Alfredo",
        description: "Creamy fettuccine pasta with parmesan cheese and butter sauce.",
        price: "15.99",
        imageUrl: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 2,
        name: "Meat Lover's Pizza",
        description: "Pizza loaded with pepperoni, sausage, bacon, and ground beef.",
        price: "16.99",
        imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 2,
        name: "Caprese Salad",
        description: "Fresh mozzarella, tomatoes, and basil drizzled with balsamic glaze.",
        price: "9.99",
        imageUrl: "https://images.unsplash.com/photo-1629212207517-912f9817883b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
    ];
    
    // Sweet Treats menu items
    const sweetTreatsItems: Partial<MenuItem>[] = [
      {
        restaurantId: 3,
        name: "Vanilla Bean Ice Cream",
        description: "Creamy vanilla ice cream made with real vanilla beans.",
        price: "4.99",
        imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 3,
        name: "Triple Chocolate Sundae",
        description: "Chocolate ice cream with hot fudge, chocolate chips, and chocolate sauce.",
        price: "6.99",
        imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 3,
        name: "Fresh Fruit Parfait",
        description: "Layers of yogurt, granola, and seasonal fresh fruits.",
        price: "5.99",
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        restaurantId: 3,
        name: "Assorted Chocolate Box",
        description: "Selection of handcrafted milk and dark chocolates with various fillings.",
        price: "12.99",
        imageUrl: "https://images.unsplash.com/photo-1549007994-1b73e2c5be2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
    ];
    
    // Add all menu items
    [...pizzaPalaceItems, ...giuseppesItems, ...sweetTreatsItems].forEach((item) => {
      const id = this.menuItemId++;
      this.menuItems.set(id, { ...item, id } as MenuItem);
    });
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Mood methods
  async getAllMoods(): Promise<Mood[]> {
    return db.select().from(moods);
  }

  async getMood(id: number): Promise<Mood | undefined> {
    const [mood] = await db.select().from(moods).where(eq(moods.id, id));
    return mood;
  }

  // Food methods
  async getAllFoods(): Promise<Food[]> {
    return db.select().from(foods);
  }

  async getFood(id: number): Promise<Food | undefined> {
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    return food;
  }

  async getFoodsByMood(moodId: number): Promise<Food[]> {
    return db.select().from(foods).where(eq(foods.moodId, moodId));
  }

  // Restaurant methods
  async getAllRestaurants(): Promise<Restaurant[]> {
    return db.select().from(restaurants);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async getRestaurantsByFood(foodId: number): Promise<Restaurant[]> {
    const restaurantFoodPairs = await db.select()
      .from(restaurantFoods)
      .where(eq(restaurantFoods.foodId, foodId));
    
    const restaurantIds = restaurantFoodPairs.map(pair => pair.restaurantId);
    
    if (restaurantIds.length === 0) {
      return [];
    }
    
    return db.select()
      .from(restaurants)
      .where(
        restaurantIds.map(id => eq(restaurants.id, id)).reduce((a, b) => ({ ...a, or: b }))
      );
  }

  // Restaurant-Food junction methods
  async getRestaurantFoods(): Promise<RestaurantFood[]> {
    return db.select().from(restaurantFoods);
  }

  // Menu items methods
  async getAllMenuItems(): Promise<MenuItem[]> {
    return db.select().from(menuItems);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem;
  }

  async getMenuItems(restaurantId: number): Promise<MenuItem[]> {
    return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }

  // Order methods
  async createOrder(order: Omit<InsertOrder, "createdAt">): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt, 'desc');
  }

  async getLatestOrderByUser(userId: number): Promise<Order | undefined> {
    const [order] = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt, 'desc')
      .limit(1);
    
    return order;
  }

  // Order items methods
  async addOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(item).returning();
    return orderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
}

// Export database storage instance
export const storage = new DatabaseStorage();
