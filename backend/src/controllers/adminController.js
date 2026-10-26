import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { MenuItem, CATEGORIES } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';
import { Reservation } from '../models/Reservation.js';
import { JWT_SECRET } from '../middleware/auth.js';

/**
 * @desc Admin Login
 * @route POST /api/admin/login
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login timestamp
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get current admin profile
 * @route GET /api/admin/profile
 */
export const getAdminProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      createdAt: req.admin.createdAt,
    },
  });
};

/**
 * @desc Get admin dashboard statistics
 * @route GET /api/admin/stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      orders,
      activeReservations,
      totalDishes,
      availableDishes,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.find({}, 'total orderStatus'),
      Reservation.countDocuments({ status: 'confirmed' }),
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ isAvailable: true }),
    ]);

    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const activeOrders = orders.filter((o) =>
      ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.orderStatus)
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        activeOrders,
        activeReservations,
        totalDishes,
        availableDishes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a new menu item
 * @route POST /api/admin/menu
 */
export const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, isVegetarian, isPopular, preparationTime, tags } = req.body;

    if (!name || !description || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, and image are required.',
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number.',
      });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed: ${CATEGORIES.join(', ')}`,
      });
    }

    const newItem = await MenuItem.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image: image.trim(),
      isVegetarian: Boolean(isVegetarian),
      isPopular: Boolean(isPopular),
      isAvailable: true,
      preparationTime: preparationTime ? preparationTime.trim() : '15-20 min',
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update an existing menu item
 * @route PUT /api/admin/menu/:id
 */
export const updateMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, image, isVegetarian, isPopular, isAvailable, preparationTime, tags } = req.body;

    const dish = await MenuItem.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed: ${CATEGORIES.join(', ')}`,
      });
    }

    if (name) dish.name = name.trim();
    if (description) dish.description = description.trim();
    if (price !== undefined) dish.price = Number(price);
    if (category) dish.category = category;
    if (image) dish.image = image.trim();
    if (isVegetarian !== undefined) dish.isVegetarian = Boolean(isVegetarian);
    if (isPopular !== undefined) dish.isPopular = Boolean(isPopular);
    if (isAvailable !== undefined) dish.isAvailable = Boolean(isAvailable);
    if (preparationTime) dish.preparationTime = preparationTime.trim();
    if (Array.isArray(tags)) dish.tags = tags;

    await dish.save();

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: dish,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle / Update menu item availability
 * @route PATCH /api/admin/menu/:id/availability
 */
export const updateDishAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isAvailable boolean is required',
      });
    }

    const dish = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable: Boolean(isAvailable) },
      { new: true }
    );

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Dish availability updated to ${dish.isAvailable ? 'Available' : 'Sold Out'}`,
      data: dish,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete menu item
 * @route DELETE /api/admin/menu/:id
 */
export const deleteMenuItem = async (req, res, next) => {
  try {
    const dish = await MenuItem.findByIdAndDelete(req.params.id);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `"${dish.name}" was successfully removed from menu.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update reservation status
 * @route PATCH /api/admin/reservations/:id/status
 */
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { referenceCode: req.params.id };

    const reservation = await Reservation.findOneAndUpdate(
      query,
      { status },
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Reservation status updated to ${status}`,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};
