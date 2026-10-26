import { Reservation } from '../models/Reservation.js';

/**
 * @desc Create a new table reservation
 * @route POST /api/reservations
 */
export const createReservation = async (req, res, next) => {
  try {
    const {
      customerName,
      phone,
      email,
      reservationDate,
      timeSlot,
      guests,
      specialRequests,
    } = req.body;

    // Reject past dates
    const todayStr = new Date().toISOString().split('T')[0];
    if (reservationDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Reservation date cannot be in the past.',
      });
    }

    // Generate unique reference code
    const referenceCode = `UB-RES-${Math.floor(10000 + Math.random() * 90000)}`;

    const reservation = await Reservation.create({
      referenceCode,
      customerName: customerName.trim(),
      phone: phone.trim().replace(/[\s-]/g, ''),
      email: email.trim().toLowerCase(),
      reservationDate,
      timeSlot,
      guests: Number(guests),
      specialRequests: specialRequests ? specialRequests.trim() : undefined,
      status: 'confirmed',
    });

    res.status(201).json({
      success: true,
      message: 'Table reserved successfully',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get reservation by unique reference code
 * @route GET /api/reservations/:referenceCode
 */
export const getReservationByReference = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      referenceCode: req.params.referenceCode.toUpperCase(),
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all reservations (for staff / admin portal)
 * @route GET /api/reservations
 */
export const getAllReservations = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const filter = {};

    if (date) {
      filter.reservationDate = date;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const reservations = await Reservation.find(filter).sort({
      reservationDate: 1,
      timeSlot: 1,
    });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};
