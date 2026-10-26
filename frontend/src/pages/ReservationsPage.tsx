import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2, Sparkles, AlertCircle, Phone, Mail, User, Bookmark, Loader2 } from 'lucide-react';
import { Reservation } from '../types';
import { createReservation } from '../services/api';

const TIME_SLOTS = [
  // Lunch Slots
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
  // Dinner Slots
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
];

export const ReservationsPage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    reservationDate: todayStr,
    timeSlot: '07:30 PM',
    guests: 2,
    specialRequests: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedReservation, setSubmittedReservation] = useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Please enter your name.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Please enter a valid 10-digit Indian phone number.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.reservationDate) {
      errs.reservationDate = 'Please select a reservation date.';
    } else if (formData.reservationDate < todayStr) {
      errs.reservationDate = 'Reservation date cannot be in the past.';
    }
    if (formData.guests < 1 || formData.guests > 20) {
      errs.guests = 'Party size must be between 1 and 20 guests.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      // Submit reservation to Express backend and MongoDB
      const createdReservation: Reservation = await createReservation({
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        reservationDate: formData.reservationDate,
        timeSlot: formData.timeSlot,
        guests: Number(formData.guests),
        specialRequests: formData.specialRequests.trim() || undefined,
      });

      // Save locally to session as fallback
      try {
        const existing = JSON.parse(localStorage.getItem('urban_bites_reservations') || '[]');
        localStorage.setItem('urban_bites_reservations', JSON.stringify([createdReservation, ...existing]));
      } catch (e) {
        console.error(e);
      }

      setSubmittedReservation(createdReservation);
    } catch (err: any) {
      console.error('Reservation failed:', err);
      setServerError(err.message || 'Could not record table reservation. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
            Table Reservations
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal-900">
            Book Your Table
          </h1>
          <p className="text-sm text-charcoal-800">
            Experience our warm hospitality and wood-fired gastronomy in our Indiranagar dining room.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Reservation Error:</p>
              <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {submittedReservation ? (
          /* Confirmation Success Card */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warmgray-200 shadow-warm text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Table Reserved &amp; Confirmed</span>
              </span>
              <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-2">
                We're Excited to Host You!
              </h2>
              <p className="text-sm text-charcoal-800 max-w-md mx-auto">
                A table has been confirmed for <strong className="text-charcoal-900">{submittedReservation.customerName}</strong>.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="p-4 rounded-2xl bg-cream-100 border border-warmgray-200 inline-block">
              <p className="text-xs text-warmgray-400 uppercase tracking-widest font-semibold mb-1">
                Booking Reference Code
              </p>
              <p className="font-mono text-2xl font-extrabold text-brand-600 tracking-wider">
                {submittedReservation.referenceCode}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto pt-2">
              <div className="p-4 rounded-xl bg-cream-50 border border-warmgray-200">
                <span className="text-xs text-warmgray-400 block font-medium">Date</span>
                <span className="font-bold text-sm text-charcoal-900">{submittedReservation.reservationDate}</span>
              </div>
              <div className="p-4 rounded-xl bg-cream-50 border border-warmgray-200">
                <span className="text-xs text-warmgray-400 block font-medium">Time Slot</span>
                <span className="font-bold text-sm text-charcoal-900">{submittedReservation.timeSlot}</span>
              </div>
              <div className="p-4 rounded-xl bg-cream-50 border border-warmgray-200">
                <span className="text-xs text-warmgray-400 block font-medium">Party Size</span>
                <span className="font-bold text-sm text-charcoal-900">{submittedReservation.guests} Guests</span>
              </div>
            </div>

            {submittedReservation.specialRequests && (
              <p className="text-xs text-charcoal-800 max-w-md mx-auto italic">
                Note: "{submittedReservation.specialRequests}"
              </p>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmittedReservation(null);
                  setFormData({
                    customerName: '',
                    phone: '',
                    email: '',
                    reservationDate: todayStr,
                    timeSlot: '07:30 PM',
                    guests: 2,
                    specialRequests: '',
                  });
                }}
                className="px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Make Another Reservation
              </button>
            </div>
          </div>
        ) : (
          /* Reservation Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-warmgray-200 shadow-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date, Time, and Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date Picker */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    <CalendarIcon className="w-3.5 h-3.5 text-brand-600" />
                    <span>Reservation Date *</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={formData.reservationDate}
                    onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                    className={`w-full p-3 rounded-xl bg-cream-50 border text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.reservationDate ? 'border-rose-500 bg-rose-50/20' : 'border-warmgray-200'
                    }`}
                  />
                  {errors.reservationDate && (
                    <p className="text-xs text-rose-500">{errors.reservationDate}</p>
                  )}
                </div>

                {/* Guests */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span>Number of Guests *</span>
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest (Solo)' : `${num} Guests`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Slot Picker */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>Select Time Slot *</span>
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <optgroup label="Lunch Service">
                      {TIME_SLOTS.slice(0, 5).map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Dinner Service">
                      {TIME_SLOTS.slice(5).map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-warmgray-100">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-brand-600" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className={`w-full p-3 rounded-xl bg-cream-50 border text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.customerName ? 'border-rose-500 bg-rose-50/20' : 'border-warmgray-200'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-rose-500">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    <Phone className="w-3.5 h-3.5 text-brand-600" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className={`w-full p-3 rounded-xl bg-cream-50 border text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-warmgray-200'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 text-brand-600" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="priya@example.com"
                    className={`w-full p-3 rounded-xl bg-cream-50 border text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-warmgray-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-1.5 pt-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                  <Bookmark className="w-3.5 h-3.5 text-brand-600" />
                  <span>Special Requests / Occasion (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="e.g. Anniversary dinner, corner booth preferred, high chair for toddler..."
                  className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Policy note */}
              <div className="p-4 rounded-2xl bg-cream-50 border border-warmgray-200 flex items-start gap-2.5 text-xs text-charcoal-800">
                <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Tables are held for up to 15 minutes past your reserved time. For parties larger than 12 guests or private dining inquiries, please contact us directly at +91 98765 43210.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-warmgray-300 text-white font-bold text-sm shadow-md hover:shadow-warm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Reservation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Table Reservation</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
