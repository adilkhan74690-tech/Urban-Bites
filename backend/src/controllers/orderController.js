import { MenuItem } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';

export const TAX_RATE_PERCENT = 5;
export const STANDARD_DELIVERY_FEE = 49;
export const FREE_DELIVERY_THRESHOLD = 799;

/**
 * @desc Create a new order with authoritative server-side price calculation
 * @route POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      phone,
      email,
      orderType,
      deliveryAddress,
      notes,
      items,
      paymentMethod,
    } = req.body;

    // Fetch authoritative menu items from database
    const itemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await MenuItem.find({ _id: { $in: itemIds } });

    // Validate that all items exist in DB
    if (dbMenuItems.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected menu items do not exist in our menu.',
      });
    }

    // Map DB items by ID for O(1) lookup
    const menuMap = new Map();
    for (const dish of dbMenuItems) {
      menuMap.set(dish._id.toString(), dish);
    }

    // Build authoritative items list and calculate subtotal
    const verifiedItems = [];
    let calculatedSubtotal = 0;

    for (const cartItem of items) {
      const dish = menuMap.get(cartItem.menuItemId.toString());

      if (!dish) {
        return res.status(400).json({
          success: false,
          message: `Dish with ID ${cartItem.menuItemId} not found.`,
        });
      }

      // Check real-time availability
      if (!dish.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Sorry, "${dish.name}" is currently unavailable or sold out. Please remove it from your cart.`,
        });
      }

      const quantity = Number(cartItem.quantity);
      const itemTotal = dish.price * quantity;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        menuItem: dish._id,
        name: dish.name,
        price: dish.price,
        quantity,
        itemTotal,
      });
    }

    // Authoritative Delivery Fee calculation
    const calculatedDeliveryFee =
      orderType === 'pickup' || calculatedSubtotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : STANDARD_DELIVERY_FEE;

    // Authoritative 5% Tax calculation
    const calculatedTax = Math.round(calculatedSubtotal * (TAX_RATE_PERCENT / 100));

    // Authoritative Total
    const calculatedTotal = calculatedSubtotal + calculatedDeliveryFee + calculatedTax;

    // Generate unique order ID
    const uniqueOrderId = `UB-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = await Order.create({
      orderId: uniqueOrderId,
      customerName: customerName.trim(),
      phone: phone.trim().replace(/[\s-]/g, ''),
      email: email.trim().toLowerCase(),
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      tax: calculatedTax,
      total: calculatedTotal,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: paymentMethod === 'razorpay' ? 'pending' : 'confirmed',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get order details by unique orderId
 * @route GET /api/orders/:orderId
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate(
      'items.menuItem',
      'image category isVegetarian'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all orders (for staff / admin portal)
 * @route GET /api/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, orderType } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    if (orderType && orderType !== 'all') {
      filter.orderType = orderType;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update order status (for kitchen / admin)
 * @route PATCH /api/orders/:orderId/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
