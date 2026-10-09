// Fills the database with demo users, categories and products.
// Run with: npm run seed   (this clears the existing data first)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

const categories = [
  { name: 'Cement', description: 'OPC and PPC cement for structural work' },
  { name: 'Steel & TMT', description: 'TMT bars, binding wire and structural steel' },
  { name: 'Bricks & Blocks', description: 'Red bricks, fly-ash bricks and AAC blocks' },
  { name: 'Tiles', description: 'Floor, wall and vitrified tiles' },
  { name: 'Plywood & Boards', description: 'Plywood, MDF and laminates for interiors' },
  { name: 'Paint', description: 'Interior and exterior emulsions, primers' },
  { name: 'Sanitary & Plumbing', description: 'CPVC pipes, fittings and bath ware' },
];

const products = [
  ['Cement', 'UltraTech OPC 53 Grade Cement', 420, 'bag (50 kg)', 'High-strength OPC 53 grade cement for slabs, columns and beams. Fast setting with consistent quality.', 800],
  ['Cement', 'ACC Suraksha PPC Cement', 380, 'bag (50 kg)', 'Portland pozzolana cement ideal for plastering, masonry and general construction work.', 650],
  ['Steel & TMT', 'Fe 550D TMT Bar 12mm', 68, 'kg', 'Earthquake-resistant Fe 550D TMT bar with high ductility, suitable for residential and commercial buildings.', 5000],
  ['Steel & TMT', 'Fe 500 TMT Bar 8mm', 66, 'kg', 'Fe 500 grade TMT bar for ring, stirrups and light structural work.', 4200],
  ['Bricks & Blocks', 'Red Clay Bricks (First Class)', 9, 'piece', 'Well-burnt first class red clay bricks with uniform size and good compressive strength.', 25000],
  ['Bricks & Blocks', 'AAC Block 600x200x150', 62, 'piece', 'Lightweight autoclaved aerated concrete blocks that cut dead load and improve insulation.', 3000],
  ['Tiles', 'Vitrified Floor Tile 600x600 Glossy', 48, 'sq ft', 'Double-charged glossy vitrified tile with low water absorption, for living rooms and offices.', 2400],
  ['Tiles', 'Anti-Skid Bathroom Tile 300x300', 38, 'sq ft', 'Matte anti-skid ceramic tile designed for bathrooms, balconies and wet areas.', 1800],
  ['Plywood & Boards', 'BWP Marine Plywood 18mm', 145, 'sq ft', 'Boiling water proof marine plywood for modular kitchens and wardrobes. Termite and borer resistant.', 900],
  ['Plywood & Boards', 'Pre-Laminated MDF Board 18mm', 95, 'sq ft', 'Pre-laminated MDF in walnut finish, ready for furniture and wall paneling without extra polish.', 600],
  ['Paint', 'Premium Interior Emulsion 20L', 6200, 'bucket', 'Low-odour, washable interior emulsion with smooth matte finish. Covers about 1,400 sq ft per coat.', 60],
  ['Paint', 'Exterior Weatherproof Paint 10L', 4800, 'bucket', 'Exterior emulsion with anti-algal and UV protection for walls exposed to rain and sun.', 45],
  ['Sanitary & Plumbing', 'CPVC Pipe 1 inch (3 m)', 520, 'length', 'Hot and cold water CPVC pipe, lead-free and corrosion resistant, for internal plumbing.', 400],
  ['Sanitary & Plumbing', 'Wall-Hung Western Toilet', 8900, 'piece', 'Wall-hung ceramic WC with soft-close seat, saves floor space and is easy to clean.', 25],
];

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Order.deleteMany(),
  ]);

  const [, seller, seller2] = await User.create([
    { name: 'Admin', email: 'admin@buildhub.dev', password: 'admin123', role: 'admin' },
    { name: 'Rahul Traders', email: 'seller@buildhub.dev', password: 'seller123', role: 'seller', company: 'Rahul Building Materials' },
    { name: 'Shree Interiors', email: 'seller2@buildhub.dev', password: 'seller123', role: 'seller', company: 'Shree Interior Supplies' },
    { name: 'Demo Buyer', email: 'buyer@buildhub.dev', password: 'buyer123', role: 'buyer' },
  ]);

  // .create() one at a time so the slug hook runs for each category.
  const createdCategories = [];
  for (const c of categories) {
    createdCategories.push(await Category.create(c));
  }
  const byName = Object.fromEntries(createdCategories.map((c) => [c.name, c._id]));

  const interiorCategories = ['Tiles', 'Plywood & Boards', 'Paint', 'Sanitary & Plumbing'];
  await Product.insertMany(
    products.map(([category, name, price, unit, description, inventory]) => ({
      name,
      price,
      unit,
      description,
      inventory,
      category: byName[category],
      seller: interiorCategories.includes(category) ? seller2._id : seller._id,
    }))
  );

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  console.log('Logins: admin@buildhub.dev / admin123, seller@buildhub.dev / seller123, buyer@buildhub.dev / buyer123');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
