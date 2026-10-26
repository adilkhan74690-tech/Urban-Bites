import { MenuItem } from '../models/MenuItem.js';

/**
 * @desc Get all menu items with optional category and vegetarian filtering
 * @route GET /api/menu
 */
export const getMenuItems = async (req, res, next) => {
  try {
    const { category, isVegetarian, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (isVegetarian === 'true') {
      filter.isVegetarian = true;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single menu item by ID
 * @route GET /api/menu/:id
 */
export const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};
