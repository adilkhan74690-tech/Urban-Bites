import mongoose from 'mongoose';

export const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
];

const reservationSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Customer name too long'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    reservationDate: {
      type: String,
      required: [true, 'Reservation date is required'],
      trim: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: {
        values: TIME_SLOTS,
        message: '{VALUE} is not an available reservation time slot',
      },
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Party size must be at least 1 guest'],
      max: [20, 'For parties larger than 20, please contact restaurant directly'],
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ reservationDate: 1, timeSlot: 1 });
reservationSchema.index({ createdAt: -1 });

export const Reservation = mongoose.model('Reservation', reservationSchema);
