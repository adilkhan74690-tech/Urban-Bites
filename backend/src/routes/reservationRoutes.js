import express from 'express';
import {
  createReservation,
  getReservationByReference,
  getAllReservations,
} from '../controllers/reservationController.js';
import { validateReservationInput } from '../middleware/validate.js';

const router = express.Router();

router.post('/', validateReservationInput, createReservation);
router.get('/', getAllReservations);
router.get('/:referenceCode', getReservationByReference);

export default router;
