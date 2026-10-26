import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Is parking available at the restaurant?',
    answer: 'Yes! We provide complimentary valet parking for all dine-in guests right outside our main entrance in Indiranagar.',
  },
  {
    question: 'Do you offer Jain or Vegan options?',
    answer: 'Absolutely. Many of our items can be prepared without onion and garlic upon request, and our menu features dedicated vegan dishes clearly labeled.',
  },
  {
    question: 'How does table holding work for reservations?',
    answer: 'We hold reserved tables for 15 minutes past the scheduled booking time. If you are delayed, please call our front desk directly.',
  },
  {
    question: 'Do you cater for private parties or corporate events?',
    answer: 'Yes, we accommodate private rooftop dining for groups up to 40 guests and outdoor artisanal catering. Contact our team at events@urbanbites.com.',
  },
];

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields (Name, Email, and Message).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
            Visit &amp; Connect
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal-900">
            Contact Urban Bites
          </h1>
          <p className="text-sm text-charcoal-800">
            Have a question, feedback, or special event request? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-warmgray-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-charcoal-900">Our Location</h3>
              <p className="text-xs text-charcoal-800 leading-relaxed">
                {RESTAURANT_INFO.address}
              </p>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 mt-4 inline-block"
            >
              Get Directions →
            </a>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-warmgray-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-charcoal-900">Phone &amp; Orders</h3>
              <p className="text-xs text-charcoal-800 leading-relaxed">
                Direct front desk and takeaway inquiries.
              </p>
              <p className="font-mono text-sm font-bold text-charcoal-900">
                {RESTAURANT_INFO.phone}
              </p>
            </div>
            <span className="text-xs text-emerald-700 font-semibold mt-4">
              Lines Open During Hours
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-warmgray-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-charcoal-900">Email Inquiries</h3>
              <p className="text-xs text-charcoal-800 leading-relaxed">
                Feedback, partnerships, and event catering.
              </p>
              <p className="text-xs font-bold text-charcoal-900">
                {RESTAURANT_INFO.email}
              </p>
            </div>
            <span className="text-xs text-warmgray-400 mt-4">
              Replies within 24 hours
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-warmgray-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-charcoal-900">Dining Hours</h3>
              <div className="text-xs text-charcoal-800 space-y-1">
                <p><strong>Mon–Fri:</strong> {RESTAURANT_INFO.hours.weekdays}</p>
                <p><strong>Sat–Sun:</strong> {RESTAURANT_INFO.hours.weekends}</p>
              </div>
            </div>
            <span className="text-xs text-brand-600 font-semibold mt-4">
              Kitchen Closes 30m Prior
            </span>
          </div>
        </div>

        {/* Message Form & FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-warmgray-200 shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                  Message Sent Successfully
                </h3>
                <p className="text-sm text-charcoal-800 max-w-md mx-auto">
                  Thank you for reaching out, {formData.name}! Our team will get back to you shortly at {formData.email}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      subject: 'General Inquiry',
                      message: '',
                    });
                  }}
                  className="px-6 py-2.5 rounded-full bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 transition-all"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vikram Seth"
                      className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vikram@example.com"
                      className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                      Topic / Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="General Inquiry">General Dining Inquiry</option>
                      <option value="Table Reservation">Table Reservation Question</option>
                      <option value="Private Catering">Private Event Catering</option>
                      <option value="Feedback">Feedback on Experience</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your note, question or special celebration request here..."
                    className="w-full p-3 rounded-xl bg-cream-50 border border-warmgray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-warm transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: FAQ Accordion */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-charcoal-800 mt-1">
                Quick answers to common questions about dining at Urban Bites.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-warmgray-200 overflow-hidden shadow-xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-charcoal-900 hover:text-brand-600 transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-warmgray-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-charcoal-800 leading-relaxed border-t border-warmgray-100 bg-cream-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct Visit Card */}
            <div className="p-5 rounded-2xl bg-charcoal-900 text-white space-y-2 shadow-sm border border-charcoal-800">
              <h3 className="font-bold text-sm text-brand-400">Planning a large group visit?</h3>
              <p className="text-xs text-warmgray-300 leading-relaxed">
                For groups of 10 or more, we recommend reserving at least 48 hours in advance to secure our mezzanine dining booths.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
