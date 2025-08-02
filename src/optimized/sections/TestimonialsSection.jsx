import React, { memo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useOptimizedInView } from "../../hooks/useOptimizedInView.js";
import { MemoizedCard } from "../MemoizedComponents";

const TestimonialsSection = memo(({ theme, themeColors }) => {
  const { ref, inView } = useOptimizedInView();
  const titleSectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const testimonialsGridRef = useRef(null);
  const testimonialRefs = useRef([]);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "SC",
      rating: 5,
      content:
        "Offly helped me recognize patterns in my mood that I never noticed before. The insights are genuinely life-changing.",
    },
    {
      name: "Marcus Thompson",
      role: "Teacher",
      avatar: "MT",
      rating: 5,
      content:
        "As someone who struggles with work-life balance, the AI assistant's recommendations have been a game-changer. It's like having a personal wellness coach.",
    },
    {
      name: "Elena Rodriguez",
      role: "Entrepreneur",
      avatar: "ER",
      rating: 5,
      content:
        "The team features transformed how our startup approaches mental health. We're more connected and productive than ever.",
    },
  ];

  useEffect(() => {
    if (inView) {
      // Animate title section container
      gsap.fromTo(
        titleSectionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      );

      // Animate title
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" },
      );

      // Animate subtitle
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" },
      );

      // Animate testimonials grid container
      gsap.fromTo(
        testimonialsGridRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power2.out" },
      );

      // Animate individual testimonials
      testimonialRefs.current.forEach((el, index) => {
        if (el) {
          gsap.fromTo(
            el,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: 0.5 + index * 0.1,
              ease: "power2.out",
            },
          );
        }
      });
    }
  }, [inView]);

  return (
    <div
      className={`py-32 ${
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 to-slate-900"
          : "bg-gradient-to-b from-indigo-50 to-purple-100/80"
      }`}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleSectionRef} className="text-center mb-16">
          <h2
            ref={titleRef}
            className={`text-4xl sm:text-5xl font-bold ${themeColors.text.primary} mb-6`}
          >
            What our{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              users say
            </span>
          </h2>
          <p
            ref={subtitleRef}
            className={`text-xl ${themeColors.text.secondary} max-w-3xl mx-auto`}
          >
            Real stories from people who've transformed their emotional wellness
            journey with Offly.
          </p>
        </div>

        <div
          ref={testimonialsGridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              ref={(el) => (testimonialRefs.current[index] = el)}
            >
              <MemoizedCard className={`p-6 ${themeColors.card} shadow-xl h-full`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <h4 className={`${themeColors.text.primary} font-semibold`}>
                      {testimonial.name}
                    </h4>
                    <p className={`${themeColors.text.muted} text-sm`}>{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className={`${themeColors.text.secondary} leading-relaxed`}>
                  {testimonial.content}
                </p>
              </MemoizedCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

TestimonialsSection.displayName = "TestimonialsSection";

export default TestimonialsSection;
