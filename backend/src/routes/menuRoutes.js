import express from 'express';
import { getMenuItems, getMenuItemById } from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

export default router;
