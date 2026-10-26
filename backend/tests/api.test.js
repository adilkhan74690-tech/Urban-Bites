import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

import { app } from '../src/app.js';
import { MenuItem } from '../src/models/MenuItem.js';
import { Order } from '../src/models/Order.js';
import { Reservation } from '../src/models/Reservation.js';
import { Admin } from '../src/models/Admin.js';
import { SEED_MENU_ITEMS } from '../src/data/menuSeed.js';

let mongod;
let seededDishes = [];

describe('Urban Bites — Backend API Test Suite', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await Reservation.deleteMany({});
    await Admin.deleteMany({});

    // Seed test menu
    seededDishes = await MenuItem.insertMany(SEED_MENU_ITEMS);
  });

  // 1. Health Check
  describe('GET /api/health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.status, 'healthy');
      assert.equal(res.body.service, 'Urban Bites API');
      assert.ok(res.body.timestamp);
    });
  });

  // 2. Menu Endpoints
  describe('GET /api/menu', () => {
    it('should return all active seeded dishes', async () => {
      const res = await request(app).get('/api/menu');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.count, SEED_MENU_ITEMS.length);
      assert.ok(Array.isArray(res.body.data));
    });

    it('should filter dishes by category (Burgers)', async () => {
      const res = await request(app).get('/api/menu?category=Burgers');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.count > 0);
      res.body.data.forEach((dish) => {
        assert.equal(dish.category, 'Burgers');
      });
    });

    it('should filter dishes by vegetarian flag', async () => {
      const res = await request(app).get('/api/menu?isVegetarian=true');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      res.body.data.forEach((dish) => {
        assert.equal(dish.isVegetarian, true);
      });
    });

    it('should search dishes by keyword', async () => {
      const res = await request(app).get('/api/menu?search=Cheeseburger');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.count >= 1);
      assert.ok(res.body.data[0].name.includes('Cheeseburger'));
    });

    it('should fetch single dish by ID', async () => {
      const targetDish = seededDishes[0];
      const res = await request(app).get(`/api/menu/${targetDish._id}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, targetDish.name);
      assert.equal(res.body.data.price, targetDish.price);
    });

    it('should return 404 for non-existent dish ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/menu/${fakeId}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Menu item not found');
    });
  });

  // 3. Order Endpoints & Validation
  describe('POST /api/orders', () => {
    it('should reject order if required fields are missing', async () => {
      const res = await request(app).post('/api/orders').send({});
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Validation failed');
      assert.ok(Array.isArray(res.body.errors));
    });

    it('should reject order with invalid phone number', async () => {
      const res = await request(app).post('/api/orders').send({
        customerName: 'Aarav Mehta',
        phone: '12345', // invalid
        email: 'aarav@example.com',
        orderType: 'pickup',
        items: [{ menuItemId: seededDishes[0]._id, quantity: 1 }],
        paymentMethod: 'cod',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      const phoneErr = res.body.errors.find((e) => e.field === 'phone');
      assert.ok(phoneErr);
    });

    it('should reject delivery order without delivery address', async () => {
      const res = await request(app).post('/api/orders').send({
        customerName: 'Aarav Mehta',
        phone: '9876543210',
        email: 'aarav@example.com',
        orderType: 'delivery',
        deliveryAddress: '', // missing
        items: [{ menuItemId: seededDishes[0]._id, quantity: 1 }],
        paymentMethod: 'cod',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      const addrErr = res.body.errors.find((e) => e.field === 'deliveryAddress');
      assert.ok(addrErr);
    });

    it('should reject order with empty items array', async () => {
      const res = await request(app).post('/api/orders').send({
        customerName: 'Aarav Mehta',
        phone: '9876543210',
        email: 'aarav@example.com',
        orderType: 'pickup',
        items: [],
        paymentMethod: 'cod',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('should reject order containing unavailable (sold out) items', async () => {
      // Find the unavailable item in seeds (Smoked Chicken Pizza)
      const unavailableDish = seededDishes.find((d) => !d.isAvailable);
      assert.ok(unavailableDish, 'Unavailable seed dish should exist');

      const res = await request(app).post('/api/orders').send({
        customerName: 'Aarav Mehta',
        phone: '9876543210',
        email: 'aarav@example.com',
        orderType: 'pickup',
        items: [{ menuItemId: unavailableDish._id, quantity: 1 }],
        paymentMethod: 'cod',
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('unavailable or sold out'));
    });

    it('should calculate authoritative subtotal, delivery fee, and tax on server', async () => {
      const dish1 = seededDishes.find((d) => d.isAvailable && d.name.includes('Cheeseburger')); // 389
      const dish2 = seededDishes.find((d) => d.isAvailable && d.name.includes('Mojito')); // 199

      const qty1 = 2; // 389 * 2 = 778
      const qty2 = 1; // 199 * 1 = 199
      const expectedSubtotal = 389 * 2 + 199 * 1; // 977
      // 977 >= 799 threshold -> deliveryFee = 0
      const expectedDeliveryFee = 0;
      const expectedTax = Math.round(expectedSubtotal * 0.05); // Math.round(977 * 0.05) = 49
      const expectedTotal = expectedSubtotal + expectedDeliveryFee + expectedTax; // 1026

      const payload = {
        customerName: 'Aarav Mehta',
        phone: '9876543210',
        email: 'aarav@example.com',
        orderType: 'delivery',
        deliveryAddress: 'Flat 402, Pine Crest, Indiranagar',
        notes: 'Ring bell twice',
        items: [
          // Client sends tampered prices to test authoritative recalculation
          { menuItemId: dish1._id, quantity: qty1, price: 1 },
          { menuItemId: dish2._id, quantity: qty2, price: 1 },
        ],
        paymentMethod: 'cod',
      };

      const res = await request(app).post('/api/orders').send(payload);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      const createdOrder = res.body.data;

      assert.ok(createdOrder.orderId.startsWith('UB-ORD-'));
      assert.equal(createdOrder.subtotal, expectedSubtotal);
      assert.equal(createdOrder.deliveryFee, expectedDeliveryFee);
      assert.equal(createdOrder.tax, expectedTax);
      assert.equal(createdOrder.total, expectedTotal);
      assert.equal(createdOrder.orderStatus, 'confirmed');
      assert.equal(createdOrder.paymentStatus, 'pending');
      assert.equal(createdOrder.items.length, 2);
      assert.equal(createdOrder.items[0].price, 389); // Authoritative DB price preserved!
    });

    it('should charge delivery fee of ₹49 when subtotal is below ₹799 on delivery orders', async () => {
      const cheapDish = seededDishes.find((d) => d.isAvailable && d.price < 400);
      const expectedSubtotal = cheapDish.price * 1; // below 799
      const expectedDeliveryFee = 49;
      const expectedTax = Math.round(expectedSubtotal * 0.05);
      const expectedTotal = expectedSubtotal + expectedDeliveryFee + expectedTax;

      const res = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'Priya Sharma',
          phone: '9812345678',
          email: 'priya@example.com',
          orderType: 'delivery',
          deliveryAddress: '12th Main Road, Indiranagar',
          items: [{ menuItemId: cheapDish._id, quantity: 1 }],
          paymentMethod: 'cod',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.subtotal, expectedSubtotal);
      assert.equal(res.body.data.deliveryFee, expectedDeliveryFee);
      assert.equal(res.body.data.total, expectedTotal);
    });
  });

  // 4. Order Inspection & Status Updates
  describe('GET & PATCH /api/orders', () => {
    let testOrderId;

    beforeEach(async () => {
      const dish = seededDishes.find((d) => d.isAvailable);
      const order = await Order.create({
        orderId: 'UB-ORD-TEST-1234',
        customerName: 'Test Diner',
        phone: '9876543210',
        email: 'test@example.com',
        orderType: 'pickup',
        items: [
          {
            menuItem: dish._id,
            name: dish.name,
            price: dish.price,
            quantity: 1,
            itemTotal: dish.price,
          },
        ],
        subtotal: dish.price,
        deliveryFee: 0,
        tax: Math.round(dish.price * 0.05),
        total: dish.price + Math.round(dish.price * 0.05),
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'confirmed',
      });
      testOrderId = order.orderId;
    });

    it('should fetch order by orderId', async () => {
      const res = await request(app).get(`/api/orders/${testOrderId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.orderId, testOrderId);
      assert.equal(res.body.data.customerName, 'Test Diner');
    });

    it('should return 404 for non-existent orderId', async () => {
      const res = await request(app).get('/api/orders/UB-NONEXISTENT-999');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it('should update order status to preparing', async () => {
      const res = await request(app)
        .patch(`/api/orders/${testOrderId}/status`)
        .send({ status: 'preparing' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.orderStatus, 'preparing');
    });

    it('should reject invalid order status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${testOrderId}/status`)
        .send({ status: 'invalid_status_xyz' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  // 5. Table Reservations Endpoints
  describe('POST & GET /api/reservations', () => {
    it('should reject reservation with past date', async () => {
      const res = await request(app).post('/api/reservations').send({
        customerName: 'Aarav Mehta',
        phone: '9876543210',
        email: 'aarav@example.com',
        reservationDate: '2020-01-01', // past date
        timeSlot: '07:30 PM',
        guests: 4,
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      const dateErr = res.body.errors.find((e) => e.field === 'reservationDate');
      assert.ok(dateErr);
    });

    it('should reject reservation with invalid guest count (e.g. 0 or 25)', async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await request(app).post('/api/reservations').send({
        customerName: 'Aarav Mehta',
        phone: '9876543210',
        email: 'aarav@example.com',
        reservationDate: todayStr,
        timeSlot: '07:30 PM',
        guests: 25, // exceeds limit
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('should create valid reservation with unique reference code', async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await request(app).post('/api/reservations').send({
        customerName: 'Priya Sharma',
        phone: '9988776655',
        email: 'priya@example.com',
        reservationDate: todayStr,
        timeSlot: '08:00 PM',
        guests: 4,
        specialRequests: 'Window table for birthday celebration',
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.referenceCode.startsWith('UB-RES-'));
      assert.equal(res.body.data.customerName, 'Priya Sharma');
      assert.equal(res.body.data.guests, 4);
      assert.equal(res.body.data.status, 'confirmed');

      // Test retrieving the newly created reservation by reference code
      const refRes = await request(app).get(`/api/reservations/${res.body.data.referenceCode}`);
      assert.equal(refRes.status, 200);
      assert.equal(refRes.body.success, true);
      assert.equal(refRes.body.data.referenceCode, res.body.data.referenceCode);
    });

    it('should return 404 for non-existent reservation reference code', async () => {
      const res = await request(app).get('/api/reservations/UB-RES-00000');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });

  // 6. Phase 4: Admin Authentication & Authorization
  describe('Phase 4: Admin Authentication & Protected Endpoints', () => {
    let validToken;
    let seededAdmin;

    beforeEach(async () => {
      // Seed initial admin
      seededAdmin = await Admin.create({
        name: 'Head Chef & Admin',
        email: 'admin@urbanbites.com',
        password: 'secure_password_123',
        role: 'superadmin',
      });

      // Obtain a valid token for authorized test cases
      const loginRes = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@urbanbites.com', password: 'secure_password_123' });
      validToken = loginRes.body.token;
    });

    describe('POST /api/admin/login', () => {
      it('should reject login if email or password is missing', async () => {
        const res = await request(app).post('/api/admin/login').send({});
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
      });

      it('should reject login with wrong password', async () => {
        const res = await request(app).post('/api/admin/login').send({
          email: 'admin@urbanbites.com',
          password: 'wrong_password_xyz',
        });
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.equal(res.body.message, 'Invalid email or password.');
      });

      it('should reject login for non-existent admin email', async () => {
        const res = await request(app).post('/api/admin/login').send({
          email: 'ghost@urbanbites.com',
          password: 'secure_password_123',
        });
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
      });

      it('should successfully authenticate and return JWT token', async () => {
        const res = await request(app).post('/api/admin/login').send({
          email: 'admin@urbanbites.com',
          password: 'secure_password_123',
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.token);
        assert.equal(res.body.admin.email, 'admin@urbanbites.com');
        assert.equal(res.body.admin.role, 'superadmin');
      });
    });

    describe('Protected Route Authorization Checks', () => {
      it('should return 401 when no token is provided to protected endpoints', async () => {
        const res1 = await request(app).get('/api/admin/stats');
        assert.equal(res1.status, 401);
        assert.equal(res1.body.success, false);

        const res2 = await request(app).post('/api/admin/menu').send({ name: 'Unauthorized Dish' });
        assert.equal(res2.status, 401);
      });

      it('should return 401 when malformed or fake token is provided', async () => {
        const res = await request(app)
          .get('/api/admin/stats')
          .set('Authorization', 'Bearer fake_invalid_token_123');
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
      });

      it('should allow access to dashboard statistics with valid token', async () => {
        const res = await request(app)
          .get('/api/admin/stats')
          .set('Authorization', `Bearer ${validToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok('totalOrders' in res.body.data);
        assert.ok('totalRevenue' in res.body.data);
        assert.ok('totalDishes' in res.body.data);
      });
    });

    describe('Admin Menu CRUD Management', () => {
      it('should allow admin to create a new menu item', async () => {
        const newDishPayload = {
          name: 'Artisanal Burrata & Pesto Focaccia',
          description: 'Creamy Puglia burrata, housemade basil pine nut pesto on warm focaccia.',
          price: 379,
          category: 'Starters',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
          isVegetarian: true,
          isPopular: true,
          preparationTime: '12 min',
        };

        const res = await request(app)
          .post('/api/admin/menu')
          .set('Authorization', `Bearer ${validToken}`)
          .send(newDishPayload);

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.name, newDishPayload.name);
        assert.equal(res.body.data.price, 379);

        // Verify dish is now in database
        const dbDish = await MenuItem.findById(res.body.data._id);
        assert.ok(dbDish);
        assert.equal(dbDish.name, newDishPayload.name);
      });

      it('should reject creating menu item with negative price', async () => {
        const res = await request(app)
          .post('/api/admin/menu')
          .set('Authorization', `Bearer ${validToken}`)
          .send({
            name: 'Negative Price Dish',
            description: 'Invalid dish',
            price: -100,
            category: 'Burgers',
            image: 'https://example.com/img.jpg',
          });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
      });

      it('should allow admin to edit an existing menu item price and details', async () => {
        const targetDish = seededDishes[0];

        const res = await request(app)
          .put(`/api/admin/menu/${targetDish._id}`)
          .set('Authorization', `Bearer ${validToken}`)
          .send({
            name: 'Updated Gourmet Smash Burger',
            price: 429, // updated price
          });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.price, 429);
        assert.equal(res.body.data.name, 'Updated Gourmet Smash Burger');

        const dbDish = await MenuItem.findById(targetDish._id);
        assert.equal(dbDish.price, 429);
      });

      it('should allow admin to toggle dish availability (Available / Sold Out)', async () => {
        const targetDish = seededDishes[0];
        assert.equal(targetDish.isAvailable, true);

        // Mark Sold Out
        const res1 = await request(app)
          .patch(`/api/admin/menu/${targetDish._id}/availability`)
          .set('Authorization', `Bearer ${validToken}`)
          .send({ isAvailable: false });

        assert.equal(res1.status, 200);
        assert.equal(res1.body.data.isAvailable, false);

        // Mark Available again
        const res2 = await request(app)
          .patch(`/api/admin/menu/${targetDish._id}/availability`)
          .set('Authorization', `Bearer ${validToken}`)
          .send({ isAvailable: true });

        assert.equal(res2.status, 200);
        assert.equal(res2.body.data.isAvailable, true);
      });

      it('should allow admin to delete a menu item from database', async () => {
        const targetDish = seededDishes[0];

        const res = await request(app)
          .delete(`/api/admin/menu/${targetDish._id}`)
          .set('Authorization', `Bearer ${validToken}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);

        // Verify item is removed from database
        const dbDish = await MenuItem.findById(targetDish._id);
        assert.equal(dbDish, null);
      });
    });

    describe('Admin Order & Reservation Status Updates', () => {
      it('should allow admin to update order status to delivered', async () => {
        const order = await Order.create({
          orderId: 'UB-ORD-ADMIN-TEST',
          customerName: 'Aarav Mehta',
          phone: '9876543210',
          email: 'aarav@example.com',
          orderType: 'pickup',
          items: [{ menuItem: seededDishes[0]._id, name: 'Dish', price: 200, quantity: 1, itemTotal: 200 }],
          subtotal: 200,
          deliveryFee: 0,
          tax: 10,
          total: 210,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          orderStatus: 'confirmed',
        });

        const res = await request(app)
          .patch(`/api/admin/orders/${order.orderId}/status`)
          .set('Authorization', `Bearer ${validToken}`)
          .send({ status: 'delivered' });

        assert.equal(res.status, 200);
        assert.equal(res.body.data.orderStatus, 'delivered');
      });

      it('should allow admin to cancel a table reservation', async () => {
        const resRecord = await Reservation.create({
          referenceCode: 'UB-RES-ADMIN-1',
          customerName: 'Priya Sharma',
          phone: '9988776655',
          email: 'priya@example.com',
          reservationDate: '2026-11-01',
          timeSlot: '08:00 PM',
          guests: 2,
          status: 'confirmed',
        });

        const res = await request(app)
          .patch(`/api/admin/reservations/${resRecord._id}/status`)
          .set('Authorization', `Bearer ${validToken}`)
          .send({ status: 'cancelled' });

        assert.equal(res.status, 200);
        assert.equal(res.body.data.status, 'cancelled');
      });
    });
  });

  // 6. Payment & Razorpay Integration (Phase 5)
  describe('Razorpay Payment Flow (Phase 5)', () => {
    const TEST_KEY_SECRET = 'test_secret_for_sha256_mock';
    const TEST_WEBHOOK_SECRET = 'test_webhook_secret_hmac';

    before(() => {
      process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;
      process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
    });

    it('GET /api/payment/config should return 200 with test mode configuration', async () => {
      const res = await request(app).get('/api/payment/config');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.mode, 'test');
      assert.equal(res.body.currency, 'INR');
    });

    it('POST /api/payment/create-order should validate order presence', async () => {
      const res = await request(app)
        .post('/api/payment/create-order')
        .send({});
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('POST /api/payment/create-order should return 404 for non-existent order', async () => {
      const res = await request(app)
        .post('/api/payment/create-order')
        .send({ orderId: 'UB-NONEXISTENT' });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it('POST /api/payment/create-order should calculate paise amount for unpaid order', async () => {
      const order = await Order.create({
        orderId: 'UB-ORD-PAY-TEST-1',
        customerName: 'Karan Singh',
        phone: '9876543210',
        email: 'karan@example.com',
        orderType: 'delivery',
        deliveryAddress: 'Indiranagar 100ft Rd',
        items: [{ menuItem: seededDishes[0]._id, name: 'Burger', price: 300, quantity: 1, itemTotal: 300 }],
        subtotal: 300,
        deliveryFee: 49,
        tax: 15,
        total: 364,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      const res = await request(app)
        .post('/api/payment/create-order')
        .send({ orderId: order.orderId });

      assert.equal(res.status, 200);
      assert.equal(res.body.orderId, order.orderId);
      assert.equal(res.body.amount, 36400); // 364 INR * 100 paise
      assert.equal(res.body.currency, 'INR');
    });

    it('POST /api/payment/create-order should reject already-paid order', async () => {
      const order = await Order.create({
        orderId: 'UB-ORD-PAY-PAID',
        customerName: 'Karan Singh',
        phone: '9876543210',
        email: 'karan@example.com',
        orderType: 'pickup',
        items: [{ menuItem: seededDishes[0]._id, name: 'Burger', price: 300, quantity: 1, itemTotal: 300 }],
        subtotal: 300,
        deliveryFee: 0,
        tax: 15,
        total: 315,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      });

      const res = await request(app)
        .post('/api/payment/create-order')
        .send({ orderId: order.orderId });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already been paid/i);
    });

    it('POST /api/payment/verify should reject missing fields with 400', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .send({ orderId: 'UB-ORD-TEST' });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('POST /api/payment/verify should reject tampered / invalid signatures with 400', async () => {
      const order = await Order.create({
        orderId: 'UB-ORD-PAY-TAMPER',
        customerName: 'Rohan Gupta',
        phone: '9876543210',
        email: 'rohan@example.com',
        orderType: 'delivery',
        deliveryAddress: 'Koramangala 4th Block',
        items: [{ menuItem: seededDishes[0]._id, name: 'Pizza', price: 500, quantity: 1, itemTotal: 500 }],
        subtotal: 500,
        deliveryFee: 49,
        tax: 25,
        total: 574,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      const res = await request(app)
        .post('/api/payment/verify')
        .send({
          orderId: order.orderId,
          razorpayOrderId: 'order_test_fake_123',
          razorpayPaymentId: 'pay_test_fake_456',
          razorpaySignature: 'invalid_tampered_signature_hex_value',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /signature/i);

      // Verify order paymentStatus updated to failed
      const updated = await Order.findOne({ orderId: order.orderId });
      assert.equal(updated.paymentStatus, 'failed');
    });

    it('POST /api/payment/verify should verify valid HMAC-SHA256 signature and confirm order', async () => {
      const order = await Order.create({
        orderId: 'UB-ORD-PAY-VALID',
        customerName: 'Simran Kaur',
        phone: '9876543210',
        email: 'simran@example.com',
        orderType: 'delivery',
        deliveryAddress: 'HSR Layout Sector 1',
        items: [{ menuItem: seededDishes[0]._id, name: 'Biryani', price: 400, quantity: 1, itemTotal: 400 }],
        subtotal: 400,
        deliveryFee: 49,
        tax: 20,
        total: 469,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      const razorpayOrderId = 'order_valid_rzp_987';
      const razorpayPaymentId = 'pay_valid_rzp_654';
      const validSignature = crypto
        .createHmac('sha256', TEST_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      const res = await request(app)
        .post('/api/payment/verify')
        .send({
          orderId: order.orderId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.paymentStatus, 'paid');
      assert.equal(res.body.data.orderStatus, 'confirmed');
      assert.equal(res.body.data.razorpayPaymentId, razorpayPaymentId);

      // Verify DB persistence
      const saved = await Order.findOne({ orderId: order.orderId });
      assert.equal(saved.paymentStatus, 'paid');
      assert.equal(saved.orderStatus, 'confirmed');

      // Idempotency test: repeating the same verification call
      const repeatRes = await request(app)
        .post('/api/payment/verify')
        .send({
          orderId: order.orderId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      assert.equal(repeatRes.status, 200);
      assert.equal(repeatRes.body.success, true);
      assert.match(repeatRes.body.message, /idempotent/i);
    });

    it('POST /api/payment/failure should record payment failure', async () => {
      const order = await Order.create({
        orderId: 'UB-ORD-PAY-FAIL',
        customerName: 'Ananya Sen',
        phone: '9876543210',
        email: 'ananya@example.com',
        orderType: 'pickup',
        items: [{ menuItem: seededDishes[0]._id, name: 'Starter', price: 250, quantity: 1, itemTotal: 250 }],
        subtotal: 250,
        deliveryFee: 0,
        tax: 13,
        total: 263,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      const res = await request(app)
        .post('/api/payment/failure')
        .send({
          orderId: order.orderId,
          reason: 'Customer cancelled transaction at UPI prompt',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      const updated = await Order.findOne({ orderId: order.orderId });
      assert.equal(updated.paymentStatus, 'failed');
      assert.equal(updated.paymentFailureReason, 'Customer cancelled transaction at UPI prompt');
    });

    it('POST /api/payment/switch-to-cod should allow switching unpaid order to COD', async () => {
      const order = await Order.create({
        orderId: 'UB-ORD-SWITCH-COD',
        customerName: 'Vikram Joshi',
        phone: '9876543210',
        email: 'vikram@example.com',
        orderType: 'delivery',
        deliveryAddress: 'Whitefield Main Road',
        items: [{ menuItem: seededDishes[0]._id, name: 'Burger', price: 300, quantity: 1, itemTotal: 300 }],
        subtotal: 300,
        deliveryFee: 49,
        tax: 15,
        total: 364,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      const res = await request(app)
        .post('/api/payment/switch-to-cod')
        .send({ orderId: order.orderId });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.paymentMethod, 'cod');
      assert.equal(res.body.data.orderStatus, 'confirmed');

      const updated = await Order.findOne({ orderId: order.orderId });
      assert.equal(updated.paymentMethod, 'cod');
      assert.equal(updated.orderStatus, 'confirmed');
    });

    it('POST /api/payment/webhook should verify signature and reconcile payment.captured', async () => {
      const order = await Order.create({
        orderId: 'UB-ORD-WEBHOOK-1',
        customerName: 'Neha Rao',
        phone: '9876543210',
        email: 'neha@example.com',
        orderType: 'delivery',
        deliveryAddress: 'MG Road',
        items: [{ menuItem: seededDishes[0]._id, name: 'Pasta', price: 350, quantity: 1, itemTotal: 350 }],
        subtotal: 350,
        deliveryFee: 49,
        tax: 18,
        total: 417,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      const webhookBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_live_777',
              order_id: 'order_rzp_webhook_999',
              amount: 41700,
              currency: 'INR',
              status: 'captured',
              notes: {
                orderId: order.orderId,
              },
            },
          },
        },
      };

      const rawPayload = JSON.stringify(webhookBody);
      const signature = crypto
        .createHmac('sha256', TEST_WEBHOOK_SECRET)
        .update(rawPayload)
        .digest('hex');

      // Test invalid signature rejection
      const invalidRes = await request(app)
        .post('/api/payment/webhook')
        .set('x-razorpay-signature', 'wrong_signature_here')
        .set('Content-Type', 'application/json')
        .send(rawPayload);
      assert.equal(invalidRes.status, 400);

      // Test valid signature acceptance & reconciliation
      const validRes = await request(app)
        .post('/api/payment/webhook')
        .set('x-razorpay-signature', signature)
        .set('Content-Type', 'application/json')
        .send(rawPayload);

      assert.equal(validRes.status, 200);
      assert.equal(validRes.body.status, 'ok');

      // Check DB order updated
      const reconciled = await Order.findOne({ orderId: order.orderId });
      assert.equal(reconciled.paymentStatus, 'paid');
      assert.equal(reconciled.orderStatus, 'confirmed');
      assert.equal(reconciled.razorpayPaymentId, 'pay_webhook_live_777');
    });
  });
});

