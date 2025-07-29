import React, { memo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useOptimizedInView } from "../../hooks/useOptimizedInView.js";
import Logo from "../../components/Logo";

const FooterSection = memo(() => {
  const { ref, inView } = useOptimizedInView();
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const productLinksRef = useRef(null);
  const companyLinksRef = useRef(null);
  const bottomSectionRef = useRef(null);
  const copyrightRef = useRef(null);
  const legalLinksRef = useRef(null);

  const productLinks = [
    "Features",
    "Pricing",
    "Dashboard",
    "Mobile App",
    "AI Assistant",
  ];
  const companyLinks = ["About", "Blog", "Careers", "Press", "Contact"];
  const legalLinks = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

  useEffect(() => {
    if (inView) {
      // Animate main container
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      );

      // Animate logo section
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: "power2.out" },
      );

      // Animate product links
      gsap.fromTo(
        productLinksRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" },
      );

      // Animate company links
      gsap.fromTo(
        companyLinksRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" },
      );

      // Animate bottom section
      gsap.fromTo(
        bottomSectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" },
      );

      // Animate copyright
      gsap.fromTo(
        copyrightRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.5, ease: "power2.out" },
      );

      // Animate legal links
      gsap.fromTo(
        legalLinksRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.6, ease: "power2.out" },
      );
    }
  }, [inView]);

  return (
    <footer className="bg-slate-950 border-t border-slate-800" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {/* Logo and description */}
          <div ref={logoRef} className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Logo size="lg" />
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              Your emotional wellness companion. Track your joy, build
              intentional habits, and nurture your mental health with AI-powered
              insights.
            </p>
            <div className="flex space-x-4">
              {["twitter", "instagram", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-slate-400"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-6 h-6 bg-slate-600 rounded"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div ref={productLinksRef}>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div ref={companyLinksRef}>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div
          ref={bottomSectionRef}
          className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p ref={copyrightRef} className="text-slate-400 text-sm mb-4 md:mb-0">
            © 2024 Offly. All rights reserved.
          </p>
          <div ref={legalLinksRef} className="flex space-x-6">
            {legalLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="text-slate-400 text-sm"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
});

FooterSection.displayName = "FooterSection";

export default FooterSection;
