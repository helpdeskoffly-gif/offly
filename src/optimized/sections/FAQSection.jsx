import React, { memo, useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useOptimizedInView } from "../../hooks/useOptimizedInView.js";
import { MemoizedBadge } from "../MemoizedComponents";
import { animateContainer, animateItem } from "../OptimizedAnimations.jsx";
import { Card, CardContent } from "../../components/ui/Card";

const FAQItem = memo(({ question, answer, isOpen, onToggle, index }) => {
  const contentRef = useRef(null);
  const iconRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.to(contentRef.current, {
        height: "auto",
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.to(iconRef.current, {
        rotation: 180,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(cardRef.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
      });
    } else if (contentRef.current) {
      gsap.to(contentRef.current, {
        height: 0,
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.to(iconRef.current, {
        rotation: 0,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(cardRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  return (
    <div 
      ref={cardRef}
      className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50 rounded-2xl overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 opacity-0"></div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/8 via-pink-500/6 to-violet-500/8 opacity-0 blur-xl"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <button
          onClick={onToggle}
          className="w-full px-8 py-6 text-left flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"></div>
            <h3 className="text-lg font-semibold text-white">{question}</h3>
          </div>
                      <div
              ref={iconRef}
              className="flex-shrink-0 w-6 h-6 text-gray-400"
            >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
        <div
          ref={contentRef}
          className="overflow-hidden"
          style={{ height: 0 }}
        >
          <div className="px-8 pb-6 text-gray-300 leading-relaxed text-base border-t border-gray-700/30 bg-gradient-to-b from-gray-800/20 to-transparent">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
});

FAQItem.displayName = "FAQItem";

const FAQSection = memo(() => {
  const { ref, inView } = useOptimizedInView();
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const faqRef = useRef(null);
  const bgElement1Ref = useRef(null);
  const bgElement2Ref = useRef(null);
  const bgElement3Ref = useRef(null);
  const bgElement4Ref = useRef(null);

  const [openItems, setOpenItems] = useState(new Set([0])); // Open first item by default

  const toggleItem = (itemIndex) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemIndex)) {
      newOpenItems.delete(itemIndex);
    } else {
      newOpenItems.add(itemIndex);
    }
    setOpenItems(newOpenItems);
  };

  useEffect(() => {
    if (inView) {
      animateItem(badgeRef.current, { delay: 0.1 });
      animateItem(titleRef.current, { delay: 0.2 });
      animateItem(descriptionRef.current, { delay: 0.3 });
      animateItem(faqRef.current, { delay: 0.4 });
      
      // Animate background elements with GSAP
      if (bgElement1Ref.current) {
        gsap.to(bgElement1Ref.current, {
          opacity: [0.3, 0.8, 0.3],
          duration: 2,
          repeat: -1,
          ease: "power2.inOut"
        });
      }
      if (bgElement2Ref.current) {
        gsap.to(bgElement2Ref.current, {
          opacity: [0.2, 0.6, 0.2],
          duration: 2.5,
          repeat: -1,
          ease: "power2.inOut",
          delay: 0.5
        });
      }
      if (bgElement3Ref.current) {
        gsap.to(bgElement3Ref.current, {
          opacity: [0.25, 0.7, 0.25],
          duration: 3,
          repeat: -1,
          ease: "power2.inOut",
          delay: 1
        });
      }
      if (bgElement4Ref.current) {
        gsap.to(bgElement4Ref.current, {
          opacity: [0.15, 0.5, 0.15],
          duration: 2.8,
          repeat: -1,
          ease: "power2.inOut",
          delay: 1.5
        });
      }
    }
  }, [inView]);

  const faqData = [
    {
      question: "What is Offly?",
      answer: "Offly is your personal accountability and reflection assistant. It helps you build healthy habits, avoid distractions, and reflect on your progress—without the guilt."
    },
    {
      question: "How do I check in?",
      answer: "Once a day, Offly prompts you to check in. You can share what distractions you avoided, what good habits you practiced, and how you're feeling. This helps you reflect, stay consistent, and feel proud of small wins."
    },
    {
      question: "What are achievements?",
      answer: "Offly rewards you with achievements for things like consistent check-ins, completing anti–to-do list items, and reaching new streak milestones. These achievements can be kept private or shared."
    },
    {
      question: "How do streaks work?",
      answer: "You build a streak by checking in every day. The more consistent you are, the longer your streak!"
    },
    {
      question: "What is the Offly Community?",
      answer: "The community is a positive space where users share achievements, streak milestones, and anti–to-do victories. Everyone's progress is celebrated."
    },
    {
      question: "Can I follow other users?",
      answer: "Yes! When you follow someone, their posts will appear in your \"Following\" feed."
    },
    {
      question: "Are my check-ins public?",
      answer: "No. Check-ins are always private. Only your shared achievements or streaks are visible to others."
    },
    {
      question: "Can I share achievements outside the app?",
      answer: "Yes. You can share your progress to LinkedIn, Facebook, and other platforms. Offly generates a clean, celebratory post for you—no extra effort needed."
    },
    {
      question: "How do I set my preferences?",
      answer: "During your first login, you'll be asked about your interests and goals. These help personalize your Offly experience and improve follow suggestions."
    },
    {
      question: "What's coming next?",
      answer: "We're constantly improving! Here's what's coming: Bonusly Integrations, Offly for Corporate, Event based Anti-TODO list integration, and Building Offly communities and streaks."
    }
  ];

  return (
    <div className="py-32 bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden" ref={ref}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div ref={bgElement1Ref} className="absolute top-20 left-10 w-2 h-2 bg-emerald-400 rounded-full opacity-30"></div>
        <div ref={bgElement2Ref} className="absolute top-40 right-20 w-1 h-1 bg-teal-400 rounded-full opacity-20"></div>
        <div ref={bgElement3Ref} className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-25"></div>
        <div ref={bgElement4Ref} className="absolute bottom-20 right-10 w-1 h-1 bg-emerald-300 rounded-full opacity-15"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={containerRef} className="text-center mb-20">
          <div ref={badgeRef}>
            <MemoizedBadge className="mb-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30">
              ❓ FAQ
            </MemoizedBadge>
          </div>

          <h2
            ref={titleRef}
            className="text-5xl sm:text-6xl font-bold text-white mb-8"
          >
            Got{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Questions?
            </span>
          </h2>

          <p
            ref={descriptionRef}
            className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Everything you need to know about Offly. From getting started to advanced features, we've got you covered.
          </p>
        </div>

        <div ref={faqRef} className="space-y-6">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openItems.has(index)}
              onToggle={() => toggleItem(index)}
              index={index}
            />
          ))}
        </div>

        <div className="mt-20 text-center">
          <Card className="border-gray-800/50 bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-sm max-w-2xl mx-auto overflow-hidden">
            <CardContent className="p-10 relative">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-60"></div>
              <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-teal-400 rounded-full opacity-40"></div>
              
              <h3 className="text-2xl font-bold text-white mb-6">
                Still have questions?
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Reach out to us directly via{" "}
                <a
                  href="mailto:support@offly.app"
                  className="text-emerald-400 font-semibold"
                >
                  support@offly.app
                </a>{" "}
                or message us in the app. We're ✨ here for you!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

FAQSection.displayName = "FAQSection";

export default FAQSection; 