import React, { lazy, Suspense, memo } from 'react';
import { Skeleton } from '../components/ui/skeleton';

// Lazy load heavy sections that are below the fold
const TestimonialsSection = lazy(() => import('./sections/TestimonialsSection'));
const TeamsSection = lazy(() => import('./sections/TeamsSection'));
const CTASection = lazy(() => import('./sections/CTASection'));
const FooterSection = lazy(() => import('./sections/FooterSection'));

// Loading fallback component
const SectionSkeleton = memo(() => (
  <div className="py-16 space-y-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  </div>
));

SectionSkeleton.displayName = 'SectionSkeleton';

// Wrapper components with Suspense
export const LazyTestimonialsSection = memo((props) => (
  <Suspense fallback={<SectionSkeleton />}>
    <TestimonialsSection {...props} />
  </Suspense>
));

export const LazyTeamsSection = memo((props) => (
  <Suspense fallback={<SectionSkeleton />}>
    <TeamsSection {...props} />
  </Suspense>
));

export const LazyCTASection = memo((props) => (
  <Suspense fallback={<SectionSkeleton />}>
    <CTASection {...props} />
  </Suspense>
));

export const LazyFooterSection = memo((props) => (
  <Suspense fallback={<SectionSkeleton />}>
    <FooterSection {...props} />
  </Suspense>
));

// Set display names
LazyTestimonialsSection.displayName = 'LazyTestimonialsSection';
LazyTeamsSection.displayName = 'LazyTeamsSection';
LazyCTASection.displayName = 'LazyCTASection';
LazyFooterSection.displayName = 'LazyFooterSection';
