import React, { memo, useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useOptimizedInView } from "../../hooks/useOptimizedInView.js";
import { MemoizedBadge } from "../MemoizedComponents";
import { animateContainer, animateItem } from "../OptimizedAnimations.jsx";
import { Card, CardContent } from "../../components/ui/Card";
import { ChevronDown, HelpCircle, Mail, Flame } from "lucide-react";

const PopularFAQCard = memo(({ question, answer, theme }) => {
  return (
    <Card className={`rounded-2xl border shadow-xl ${
      theme === "dark"
        ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
        : "bg-white/90 border-gray-200/50 backdrop-blur-xl"
    }`}>
      <CardContent className="p-5">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-2 line-clamp-2`}>
              {question}
            </h3>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} text-sm leading-relaxed mb-3 line-clamp-3`}>
              {answer}
            </p>
            <button className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${theme === "dark" ? "border-slate-600 text-gray-300 hover:bg-slate-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} transition-colors duration-200`}>
              Getting Started
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PopularFAQCard.displayName = "PopularFAQCard";

const FAQItem = memo(({ question, answer, isOpen, onToggle, index, theme }) => {
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
      className={`rounded-2xl border shadow-xl overflow-hidden ${
        theme === "dark"
          ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
          : "bg-white/90 border-gray-200/50 backdrop-blur-xl"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-6 text-left flex items-center justify-between group hover:bg-opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-4">
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {question}
          </h3>
        </div>
        <div
          ref={iconRef}
          className={`flex-shrink-0 w-6 h-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} transition-transform duration-200`}
        >
          <ChevronDown className="w-6 h-6" />
        </div>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: 0 }}
      >
        <div className={`px-6 pb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"} leading-relaxed text-base border-t ${theme === "dark" ? "border-slate-700" : "border-gray-200"}`}>
          {answer}
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
  const popularRef = useRef(null);
  const tabsRef = useRef(null);
  const faqRef = useRef(null);

  const [openItems, setOpenItems] = useState(new Set([0]));
  const [activeTab, setActiveTab] = useState("getting-started");
  const [theme, setTheme] = useState("dark");

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
      animateItem(popularRef.current, { delay: 0.4 });
      animateItem(tabsRef.current, { delay: 0.5 });
      animateItem(faqRef.current, { delay: 0.6 });
    }
  }, [inView]);

  const popularQuestions = [
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
    }
  ];

  const faqCategories = {
    "getting-started": [
      {
        question: "What is Offly?",
        answer: "Offly is your personal accountability and reflection assistant. It helps you build healthy habits, avoid distractions, and reflect on your progress—without the guilt."
      },
      {
        question: "How do I check in?",
        answer: "Once a day, Offly prompts you to check in. You can share what distractions you avoided, what good habits you practiced, and how you're feeling. This helps you reflect, stay consistent, and feel proud of small wins."
      },
      {
        question: "How do I set my preferences?",
        answer: "During your first login, you'll be asked about your interests and goals. These help personalize your Offly experience and improve follow suggestions."
      }
    ],
    "features": [
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
      }
    ],
    "privacy": [
      {
        question: "Are my check-ins public?",
        answer: "No. Check-ins are always private. Only your shared achievements or streaks are visible to others."
      },
      {
        question: "Can I follow other users?",
        answer: "Yes! When you follow someone, their posts will appear in your \"Following\" feed."
      },
      {
        question: "Can I share achievements outside the app?",
        answer: "Yes. You can share your progress to LinkedIn, Facebook, and other platforms. Offly generates a clean, celebratory post for you—no extra effort needed."
      }
    ],
    "future": [
      {
        question: "What's coming next?",
        answer: "We're constantly improving! Here's what's coming: Bonusly Integrations, Offly for Corporate, Event based Anti-TODO list integration, and Building Offly communities and streaks."
      }
    ]
  };

  const tabs = [
    { id: "getting-started", label: "Getting Started" },
    { id: "features", label: "Features" },
    { id: "privacy", label: "Privacy" },
    { id: "future", label: "Future" }
  ];

  return (
    <div className={`py-32 ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black" : "bg-gradient-to-br from-gray-50 via-white to-gray-100"} relative overflow-hidden`} ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={containerRef} className="text-center mb-20">
          <div ref={badgeRef}>
            <MemoizedBadge className="mb-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">
              ❓ FAQ
            </MemoizedBadge>
          </div>

          <h2
            ref={titleRef}
            className={`text-5xl sm:text-6xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-8`}
          >
            Got{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Questions?
            </span>
          </h2>

          <p
            ref={descriptionRef}
            className={`text-xl ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-12 max-w-3xl mx-auto leading-relaxed`}
          >
            Everything you need to know about Offly. From getting started to advanced features, we've got you covered.
          </p>
        </div>

        {/* Popular Questions Section */}
        <div ref={popularRef} className="mb-16">
          <div className="flex items-center space-x-2 mb-8">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Popular Questions
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularQuestions.map((item, index) => (
              <PopularFAQCard
                key={index}
                question={item.question}
                answer={item.answer}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div ref={tabsRef} className="mb-12">
          <div className={`flex justify-center ${theme === "dark" ? "bg-slate-800/80" : "bg-gray-100"} rounded-2xl p-2 max-w-lg mx-auto`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-8 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${theme === "dark" ? "bg-emerald-500 text-white" : "bg-emerald-500 text-white"} shadow-lg`
                    : `${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div ref={faqRef} className="space-y-4">
          {faqCategories[activeTab].map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openItems.has(index)}
              onToggle={() => toggleItem(index)}
              index={index}
              theme={theme}
            />
          ))}
        </div>

        <div className="mt-20 text-center">
          <Card className={`rounded-2xl border shadow-xl ${
            theme === "dark"
              ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
              : "bg-white/90 border-gray-200/50 backdrop-blur-xl"
          } max-w-2xl mx-auto overflow-hidden`}>
            <CardContent className="p-10 relative">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-6`}>
                Still have questions?
              </h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} text-lg leading-relaxed`}>
                Reach out to us directly via{" "}
                <a
                  href="mailto:support@offly.app"
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
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