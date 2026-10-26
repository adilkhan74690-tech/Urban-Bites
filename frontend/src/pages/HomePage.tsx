import React from 'react';
import { Hero } from '../components/home/Hero';
import { PopularDishes } from '../components/home/PopularDishes';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { StorySection } from '../components/home/StorySection';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { NewsletterSection } from '../components/home/NewsletterSection';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <PopularDishes />
      <CategoryGrid />
      <StorySection />
      <ReviewsSection />
      <NewsletterSection />
    </div>
  );
};
