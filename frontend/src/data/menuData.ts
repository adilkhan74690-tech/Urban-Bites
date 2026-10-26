import { MenuItem } from '../types';

export const FALLBACK_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Burgers
  {
    id: 'ub-burg-1',
    name: 'The Urban Smoked Cheeseburger',
    description: 'Double smashed tender patties, smoked cheddar, caramelized onions, crisp lettuce, and our signature secret house sauce on a toasted brioche bun.',
    price: 389,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    preparationTime: '15-20 min',
    tags: ['Best Seller', 'Chef Special']
  },
  {
    id: 'ub-burg-2',
    name: 'Truffle Mushroom Swiss Burger',
    description: 'Grilled portobello and shiitake mushroom blend, aged Swiss cheese, truffle garlic aioli, and baby arugula on an artisanal bun.',
    price: 349,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.8,
    preparationTime: '15-18 min',
    tags: ['Vegetarian', 'Gourmet']
  },
  {
    id: 'ub-burg-3',
    name: 'Nashville Crispy Hot Chicken Burger',
    description: 'Buttermilk fried chicken breast dredged in cayenne pepper glaze, spicy dill pickles, and creamy cooling slaw on buttered brioche.',
    price: 369,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isAvailable: true,
    isPopular: false,
    rating: 4.7,
    preparationTime: '15-20 min',
    tags: ['Spicy']
  },
  {
    id: 'ub-burg-4',
    name: 'Crispy Paneer Makhani Burger',
    description: 'Golden spiced panko paneer steak layered with velvety butter makhani spread, pickled red onions, and fresh mint chutney.',
    price: 329,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.6,
    preparationTime: '12-15 min',
    tags: ['Vegetarian', 'Fusion']
  },

  // Pizza
  {
    id: 'ub-piz-1',
    name: 'Wood-Fired Margherita Classica',
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, hand-torn sweet basil, and a drizzle of extra virgin Tuscan olive oil.',
    price: 449,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    preparationTime: '20-25 min',
    tags: ['Classic', 'Wood Fired']
  },
  {
    id: 'ub-piz-2',
    name: 'Spicy Diavola Pepperoni Pizza',
    description: 'Slow-fermented sourdough crust topped with artisanal spicy cured pepperoni, chili-infused honey, mozzarella, and roasted garlic.',
    price: 549,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    preparationTime: '20-25 min',
    tags: ['Best Seller']
  },
  {
    id: 'ub-piz-3',
    name: 'Quattro Formaggi & Fig Pizza',
    description: 'Four-cheese harmony of gorgonzola, aged parmesan, fior di latte, and creamy ricotta, topped with balsamic macerated black mission figs.',
    price: 529,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.7,
    preparationTime: '20 min',
    tags: ['Gourmet']
  },
  {
    id: 'ub-piz-4',
    name: 'Smoked Chicken & BBQ Red Onion Pizza',
    description: 'Hickory-smoked chicken strips, sweet smoky barbecue sauce, aged cheddar, crisp scallions, and charred sweet corn.',
    price: 499,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isAvailable: false, // demonstrates unavailable state cleanly
    isPopular: false,
    rating: 4.6,
    preparationTime: '20 min',
    tags: ['Sold Out Today']
  },

  // Indian
  {
    id: 'ub-ind-1',
    name: 'Old Delhi Butter Chicken (Murgh Makhani)',
    description: 'Clay-oven charred boneless chicken simmered gently in a silky, rich reduction of ripe vine tomatoes, butter, and fragrant kasuri methi.',
    price: 489,
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true,
    rating: 5.0,
    preparationTime: '25-30 min',
    tags: ['Signature', 'Best Seller']
  },
  {
    id: 'ub-ind-2',
    name: 'Dal Makhani Slow-Simmered 24 Hours',
    description: 'Black urad lentils and kidney beans slow-cooked overnight on gentle charcoal embers, finished with churned white butter and cream.',
    price: 369,
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    preparationTime: '15-20 min',
    tags: ['Vegetarian', 'Heritage Recipe']
  },
  {
    id: 'ub-ind-3',
    name: 'Paneer Lababdar with Garlic Naan',
    description: 'Cubes of fresh cottage cheese cooked in a luscious cashew, onion, and tomato gravy, garnished with grated paneer and coriander.',
    price: 419,
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.8,
    preparationTime: '20 min',
    tags: ['Vegetarian']
  },
  {
    id: 'ub-ind-4',
    name: 'Dum Biryani with Mint Burani Raita',
    description: 'Aromatic long-grain basmati rice layered with spiced tender cuts, saffron, caramelized onions, and sealed in a clay pot.',
    price: 519,
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    preparationTime: '25 min',
    tags: ['Chef Special']
  },

  // Starters
  {
    id: 'ub-str-1',
    name: 'Crispy Calamari & Lime Tartar',
    description: 'Tender squid rings lightly dusted with seasoned semolina and sea salt, served with tangy charred lime tartar sauce.',
    price: 359,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true,
    rating: 4.7,
    preparationTime: '12-15 min',
    tags: ['Seafood']
  },
  {
    id: 'ub-str-2',
    name: 'Avocado & Truffle Hummus Bowl',
    description: 'Silky smooth chickpeas whipped with ripe avocado and tahini, crowned with toasted pine nuts, smoked paprika, and warm zaatar pita.',
    price: 299,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.6,
    preparationTime: '10 min',
    tags: ['Vegetarian', 'Healthy']
  },
  {
    id: 'ub-str-3',
    name: 'Fiery Korean Glazed Chicken Wings',
    description: 'Double-fried ultra-crispy jumbo wings tossed in sticky gochujang sweet-spicy glaze, toasted sesame seeds, and spring onions.',
    price: 379,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1527477378408-1bc128217737?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    preparationTime: '15 min',
    tags: ['Popular']
  },
  {
    id: 'ub-str-4',
    name: 'Tandoori Stuffed Mushroom Caps',
    description: 'Plump button mushrooms stuffed with spiced cream cheese and herbs, marinated in yellow mustard and grilled in our tandoor.',
    price: 319,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.6,
    preparationTime: '15 min',
    tags: ['Vegetarian']
  },

  // Desserts
  {
    id: 'ub-des-1',
    name: 'Warm Belgian Chocolate Lava Cake',
    description: 'Molten center dark chocolate cake with 70% Callebaut cocoa, served with artisanal Madagascar vanilla bean gelato.',
    price: 289,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 5.0,
    preparationTime: '12 min',
    tags: ['Best Seller']
  },
  {
    id: 'ub-des-2',
    name: 'Classic Espresso Tiramisu',
    description: 'Espresso-soaked Italian savoiardi ladyfingers layered with whipped mascarpone cream, dusted with Valrhona cocoa powder.',
    price: 299,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.8,
    preparationTime: '5 min',
    tags: ['Italian']
  },
  {
    id: 'ub-des-3',
    name: 'Kesar Pista Rasmalai Tres Leches',
    description: 'Cardamom saffron milk cake soaked with three reduced sweet milks, crowned with silver vark and slivered Iranian pistachios.',
    price: 269,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    preparationTime: '5 min',
    tags: ['Signature', 'Fusion']
  },

  // Beverages
  {
    id: 'ub-bev-1',
    name: 'Alfonso Mango Passionfruit Mojito',
    description: 'Fresh Ratnagiri mango puree, wild passionfruit, crushed fresh garden mint, Persian lime, and sparkling mountain soda.',
    price: 199,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    preparationTime: '5-8 min',
    tags: ['Refreshing', 'Seasonal']
  },
  {
    id: 'ub-bev-2',
    name: 'Cold Brew Salted Caramel Frappe',
    description: 'Slow-steeped Arabica cold brew blended with Himalayan pink salt caramel, almond milk, and chilled espresso crema.',
    price: 229,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.7,
    preparationTime: '5 min',
    tags: ['Coffee']
  },
  {
    id: 'ub-bev-3',
    name: 'Smoked Masala Lemonade Cooler',
    description: 'Fresh pressed lemons infused with roasted cumin, black rock salt, crushed ginger, and mint over artisanal crushed ice.',
    price: 169,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.8,
    preparationTime: '5 min',
    tags: ['Digestive', 'House Favorite']
  }
];


export const RESTAURANT_INFO = {
  name: 'Urban Bites',
  tagline: 'Good Food. Great Mood.',
  phone: '+91 80 4123 4567',
  email: 'contact@urbanbites.com',
  address: '14, Brigade Gateway, Indiranagar, Bengaluru, Karnataka 560038',
  hours: {
    weekdays: '11:30 AM – 11:00 PM',
    weekends: '11:00 AM – 11:45 PM'
  },
  deliveryFee: 49,
  freeDeliveryThreshold: 799,
  taxRatePercent: 5 // 5% GST on restaurant food
};
