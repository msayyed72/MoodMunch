import { db } from "./db";
import { users, moods, foods, restaurants, restaurantFoods, menuItems } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  console.log("Checking if database needs seeding...");

  // Check if we already have moods
  const existingMoods = await db.select().from(moods);
  if (existingMoods.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  console.log("Seeding database with initial data...");

  // Seed moods
  const moodData = [
    { name: "Happy", icon: "emotion-happy-line", color: "#FFCC29" },
    { name: "Sad", icon: "emotion-sad-line", color: "#6665DD" },
    { name: "Stressed", icon: "mental-health-line", color: "#FF5C58" },
    { name: "Relaxed", icon: "rest-time-line", color: "#61B15A" },
    { name: "Energetic", icon: "run-line", color: "#FFA500" },
  ];

  const insertedMoods = await db.insert(moods).values(moodData).returning();
  console.log(`Inserted ${insertedMoods.length} moods`);

  // Seed foods for each mood
  const foodData = [
    // Happy mood foods
    { 
      name: "Pizza", 
      description: "Comfort food that boosts your happiness with its perfect balance of carbs and cheese.",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[0].id 
    },
    { 
      name: "Ice Cream", 
      description: "A sweet treat that triggers the release of serotonin, perfect for celebrating good moments.",
      imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[0].id 
    },
    { 
      name: "Pasta", 
      description: "A versatile dish that satisfies your carb cravings and provides quick energy for your good mood.",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[0].id 
    },
    
    // Sad mood foods
    { 
      name: "Chocolate", 
      description: "Rich in compounds that help elevate mood, chocolate is a classic comfort food for emotional relief.",
      imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[1].id 
    },
    { 
      name: "Mac and Cheese", 
      description: "A warm, creamy comfort food that provides a sense of nostalgia and security.",
      imageUrl: "https://images.unsplash.com/photo-1543352634-99a5d50ae78e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[1].id 
    },
    { 
      name: "Soup", 
      description: "Warm, nourishing soups can be both comforting and hydrating when you're feeling down.",
      imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[1].id 
    },
    
    // Stressed mood foods
    { 
      name: "Dark Chocolate", 
      description: "Contains compounds that can reduce stress hormones and improve cognitive function.",
      imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[2].id 
    },
    { 
      name: "Herbal Tea", 
      description: "Chamomile and other herbal teas can help calm your nervous system and reduce anxiety.",
      imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[2].id 
    },
    { 
      name: "Avocado Toast", 
      description: "Rich in B vitamins that help your body manage stress, with complex carbs for sustained energy.",
      imageUrl: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[2].id 
    },
    
    // Relaxed mood foods
    { 
      name: "Sushi", 
      description: "Light and nutritious, sushi provides omega-3 fatty acids that can help maintain your calm state.",
      imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[3].id 
    },
    { 
      name: "Mediterranean Salad", 
      description: "Fresh ingredients rich in antioxidants help maintain a balanced mood and energy level.",
      imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[3].id 
    },
    { 
      name: "Smoothie Bowl", 
      description: "Packed with fruits that contain natural sugars to maintain your relaxed state without a crash.",
      imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[3].id 
    },
    
    // Energetic mood foods
    { 
      name: "Protein Bowl", 
      description: "Balanced mix of protein and complex carbs to sustain your energy throughout the day.",
      imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[4].id 
    },
    { 
      name: "Energy Bars", 
      description: "Nutrient-dense snacks designed to provide quick energy when you're on the move.",
      imageUrl: "https://images.unsplash.com/photo-1571748982800-eac93a4ea375?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[4].id 
    },
    { 
      name: "Fresh Fruit Salad", 
      description: "Natural sugars and vitamins from a variety of fruits to keep your energy levels high.",
      imageUrl: "https://images.unsplash.com/photo-1568158879083-c42860933ed7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      moodId: insertedMoods[4].id 
    },
  ];

  const insertedFoods = await db.insert(foods).values(foodData).returning();
  console.log(`Inserted ${insertedFoods.length} foods`);

  // Seed restaurants
  const restaurantData = [
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
      name: "Zen Sushi",
      description: "Traditional and creative sushi rolls prepared by expert chefs using fresh ingredients.",
      imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      rating: 47,
      reviewCount: 192,
      deliveryTime: "35-50 min",
      deliveryFee: "$4.99",
      cuisines: ["Japanese", "Sushi", "Asian"],
    },
  ];

  const insertedRestaurants = await db.insert(restaurants).values(restaurantData).returning();
  console.log(`Inserted ${insertedRestaurants.length} restaurants`);

  // Create restaurant-food associations
  const restaurantFoodAssociations = [
    // Pizza Palace serves Pizza
    {
      restaurantId: insertedRestaurants[0].id,
      foodId: insertedFoods.find(f => f.name === "Pizza")!.id,
    },
    // Giuseppe's serves Pizza and Pasta
    {
      restaurantId: insertedRestaurants[1].id,
      foodId: insertedFoods.find(f => f.name === "Pizza")!.id,
    },
    {
      restaurantId: insertedRestaurants[1].id,
      foodId: insertedFoods.find(f => f.name === "Pasta")!.id,
    },
    // Sweet Treats serves Ice Cream and Chocolate
    {
      restaurantId: insertedRestaurants[2].id,
      foodId: insertedFoods.find(f => f.name === "Ice Cream")!.id,
    },
    {
      restaurantId: insertedRestaurants[2].id,
      foodId: insertedFoods.find(f => f.name === "Chocolate")!.id,
    },
    // Comfort Kitchen serves Mac and Cheese and Soup
    {
      restaurantId: insertedRestaurants[3].id,
      foodId: insertedFoods.find(f => f.name === "Mac and Cheese")!.id,
    },
    {
      restaurantId: insertedRestaurants[3].id,
      foodId: insertedFoods.find(f => f.name === "Soup")!.id,
    },
    // Zen Sushi serves Sushi
    {
      restaurantId: insertedRestaurants[4].id,
      foodId: insertedFoods.find(f => f.name === "Sushi")!.id,
    },
  ];

  const insertedAssociations = await db.insert(restaurantFoods).values(restaurantFoodAssociations).returning();
  console.log(`Inserted ${insertedAssociations.length} restaurant-food associations`);

  // Add menu items
  const menuItemsData = [
    // Pizza Palace menu items
    {
      restaurantId: insertedRestaurants[0].id,
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
      price: "12.99",
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    },
    {
      restaurantId: insertedRestaurants[0].id,
      name: "Pepperoni Pizza",
      description: "Traditional pizza topped with tomato sauce, mozzarella, and spicy pepperoni.",
      price: "14.99",
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    },
    // Giuseppe's menu items
    {
      restaurantId: insertedRestaurants[1].id,
      name: "Fettuccine Alfredo",
      description: "Rich and creamy pasta with parmesan cheese and butter sauce.",
      price: "15.99",
      imageUrl: "https://images.unsplash.com/photo-1645112411341-6c4fd023882c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    },
    {
      restaurantId: insertedRestaurants[1].id,
      name: "Supreme Pizza",
      description: "Loaded pizza with pepperoni, sausage, bell peppers, onions, and olives.",
      price: "16.99",
      imageUrl: "https://images.unsplash.com/photo-1593246049226-ded77bf90326?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    },
    // Sweet Treats menu items
    {
      restaurantId: insertedRestaurants[2].id,
      name: "Vanilla Bean Ice Cream",
      description: "Smooth and creamy vanilla ice cream made with real vanilla beans.",
      price: "5.99",
      imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    },
    {
      restaurantId: insertedRestaurants[2].id,
      name: "Triple Chocolate Brownie",
      description: "Rich chocolate brownie with chocolate chips and chocolate sauce.",
      price: "6.99",
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
    },
  ];

  const insertedMenuItems = await db.insert(menuItems).values(menuItemsData).returning();
  console.log(`Inserted ${insertedMenuItems.length} menu items`);

  // Create test user
  const hashedPassword = await hashPassword("testpassword");
  
  const userData = {
    username: "testuser",
    password: hashedPassword,
    name: "Test User",
    email: "test@example.com",
  };

  const insertedUser = await db.insert(users).values(userData).returning();
  console.log(`Inserted test user: ${insertedUser[0].username}`);

  console.log("Database seeding complete!");
}

// Export the seed function so it can be called from other files
export { seedDatabase };