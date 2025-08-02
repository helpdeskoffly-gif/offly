import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/badge';
import { ArrowLeft, Mail, Shield, Users, FileText, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Premium theme colors matching Auth page
  const premiumGradients = {
    primary: theme === "dark"
      ? "from-violet-500 via-purple-500 to-fuchsia-500"
      : "from-violet-600 via-purple-600 to-fuchsia-600",
    secondary: theme === "dark"
      ? "from-blue-500 via-indigo-500 to-purple-500"
      : "from-blue-600 via-indigo-600 to-purple-600",
    accent: theme === "dark"
      ? "from-emerald-400 via-teal-400 to-cyan-400"
      : "from-emerald-500 via-teal-500 to-cyan-500",
    background: theme === "dark"
      ? "from-slate-950 via-gray-950 to-slate-950"
      : "from-slate-50 via-white to-slate-100",
  };

  const themeColors = {
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-gray-700",
      muted: theme === "dark" ? "text-slate-400" : "text-gray-500",
    },
    card: theme === "dark"
      ? "bg-slate-900/80 border-slate-800/50 backdrop-blur-xl"
      : "bg-white/90 border-slate-200/50 backdrop-blur-xl",
  };

  const sections = [
    {
      id: 1,
      title: "Acceptance of Terms",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "By accessing or using Offly (\"the Service\"), you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our service.",
        "",
        "Eligibility: You must be at least 13 years old to use Offly. If you are under 18, you must have parental consent."
      ]
    },
    {
      id: 2,
      title: "Service Description",
      icon: <Users className="w-5 h-5" />,
      content: [
        "Offly is a habit-tracking and personal development application that helps users:",
        "• Track daily habits and build streaks",
        "• Engage in daily reflection and check-ins",
        "• Connect with a supportive community",
        "• Set and achieve personal goals"
      ]
    },
    {
      id: 3,
      title: "Not Medical or Mental Health Advice",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "IMPORTANT DISCLAIMER: Offly is designed to support daily reflection, habit-building, and focus—but it is not a medical or mental health tool.",
        "",
        "• Offly does not provide clinical, therapeutic, or psychological advice",
        "• The content generated within the app (e.g., streak tracking, check-ins, reflections) is for personal development only",
        "• If you're experiencing mental health challenges, depression, anxiety, or any serious emotional distress, we strongly encourage you to consult a licensed medical or mental health professional",
        "• Offly is not a substitute for therapy, counseling, or medical treatment",
        "• We make no warranties about the effectiveness of habit-tracking for your specific circumstances"
      ]
    },
    {
      id: 4,
      title: "User Accounts and Responsibilities",
      icon: <Users className="w-5 h-5" />,
      content: [
        "By using Offly, you agree to:",
        "• Provide accurate and complete information when creating your account",
        "• Maintain the security of your account credentials",
        "• Take full responsibility for how you use the app and interpret its content",
        "• Use the app in a respectful and lawful manner",
        "• Avoid posting or entering harmful, offensive, inappropriate, or illegal content",
        "• Not use the service for any commercial purposes without our written consent",
        "• Not attempt to hack, reverse-engineer, or compromise our systems",
        "",
        "We reserve the right to suspend or terminate accounts that violate these terms."
      ]
    },
    {
      id: 5,
      title: "Intellectual Property",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "• Offly and its content, features, and functionality are owned by us and protected by copyright, trademark, and other intellectual property laws",
        "• You retain ownership of content you create, but grant us a license to use it as necessary to provide the service",
        "• You may not copy, modify, distribute, or create derivative works based on our service without permission"
      ]
    },
    {
      id: 6,
      title: "Privacy and Data Protection",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Your trust is important to us. Here's how we handle your data:",
        "",
        "What we collect:",
        "• Account Information: Email address, username, and basic profile data",
        "• Usage Data: Your daily check-ins, streak activity, preferences, and app usage patterns",
        "• Community Content: Posts you choose to share publicly within the Offly Community",
        "• Technical Data: Device information, IP address, and analytics data to improve our service",
        "",
        "What we don't collect:",
        "• We do not collect sensitive health, financial, or personally identifying details beyond what is needed for functionality",
        "• We do not access your device's other apps or personal files",
        "",
        "How your data is used:",
        "• To provide and personalize your experience",
        "• To calculate streaks, achievements, and display community posts",
        "• To improve the product, fix bugs, and develop new features",
        "• For internal analytics to make Offly better",
        "• To communicate with you about your account and our service",
        "",
        "Data sharing:",
        "• We do not sell your personal data",
        "• We do not share your personal data with third parties for advertising purposes",
        "• We may share aggregated, anonymized data for research or business purposes",
        "• We may disclose data if required by law or to protect our rights",
        "",
        "Data security:",
        "• Your data is securely stored using trusted cloud providers with industry-standard encryption",
        "• We implement appropriate technical and organizational measures to protect your information",
        "• However, no method of transmission over the internet is 100% secure",
        "",
        "International transfers:",
        "• Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers."
      ]
    },
    {
      id: 7,
      title: "Community Standards",
      icon: <Users className="w-5 h-5" />,
      content: [
        "We strive to make Offly a positive and safe place:",
        "• Only positive emoji reactions are allowed (no comments or negativity)",
        "• Check-in text is moderated using AI to filter out profanity or inappropriate content",
        "• Users who violate guidelines may have their content removed or accounts suspended",
        "• We reserve the right to remove any content at our discretion",
        "• Repeated violations may result in permanent account termination"
      ]
    },
    {
      id: 8,
      title: "Third-Party Integrations and Sharing",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "When you share achievements to platforms like LinkedIn or Facebook:",
        "• Offly only posts content you have explicitly chosen to share",
        "• We do not post anything without your consent",
        "• You are responsible for your activity on third-party platforms",
        "• We are not liable for issues arising from third-party platform usage"
      ]
    },
    {
      id: 9,
      title: "Service Availability and Modifications",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "• We strive to keep Offly available 24/7, but cannot guarantee uninterrupted service",
        "• We may modify, suspend, or discontinue features at any time with reasonable notice",
        "• We are not liable for any downtime or service interruptions"
      ]
    },
    {
      id: 10,
      title: "Limitation of Liability",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW:",
        "• Offly is provided \"as is\" without warranties of any kind",
        "• We are not liable for any indirect, incidental, special, or consequential damages",
        "• Our total liability to you shall not exceed the amount you paid us in the past 12 months",
        "• Some jurisdictions do not allow these limitations, so they may not apply to you"
      ]
    },
    {
      id: 11,
      title: "Account Deletion and Data Retention",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "You may request deletion of your account and data at any time:",
        "• Use the \"Delete Account\" option in the app settings",
        "• Or email us at helpdesk.offly@gmail.com",
        "",
        "Once deleted, your personal data and check-in history will be permanently removed within 30 days",
        "Some data may be retained for legal or business purposes as required by law",
        "Community posts may remain visible unless specifically requested for removal"
      ]
    },
    {
      id: 12,
      title: "Termination",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "We may terminate or suspend your account immediately if you:",
        "• Violate these terms",
        "• Engage in harmful or illegal activity",
        "• Fail to pay any applicable fees",
        "",
        "Upon termination, your right to use the service ceases immediately"
      ]
    },
    {
      id: 13,
      title: "Governing Law and Disputes",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "• These terms are governed by [INSERT YOUR JURISDICTION] law",
        "• Any disputes will be resolved through binding arbitration in [INSERT LOCATION]",
        "• You waive your right to participate in class-action lawsuits against us"
      ]
    },
    {
      id: 14,
      title: "Changes to These Terms",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "We may update these terms occasionally to reflect new features, legal requirements, or operational changes:",
        "• We will notify you of material changes via email or in-app notification",
        "• Your continued use of Offly after changes means you accept the updated terms",
        "• If you don't agree to changes, you may delete your account"
      ]
    },
    {
      id: 15,
      title: "Contact Information",
      icon: <Mail className="w-5 h-5" />,
      content: [
        "If you have questions about these terms or our service:",
        "• Email: helpdesk.offly@gmail.com",
        "• Response time: We aim to respond within 48 hours"
      ]
    },
    {
      id: 16,
      title: "Severability",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect."
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${premiumGradients.background} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/auth')}
            variant="ghost"
            className="mb-6 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auth
          </Button>
          
          <div className="text-center mb-8">
            <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${premiumGradients.primary} bg-clip-text text-transparent mb-4`}>
              Terms & Conditions
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                Privacy Policy
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Last updated: 28th July, 2025
              </Badge>
            </div>
            <p className={`text-lg ${themeColors.text.secondary} max-w-3xl mx-auto`}>
              Welcome to Offly! We're excited to help you build better habits and take control of your day. 
              By using our service, you agree to these terms, so please read them carefully.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <Card 
              key={section.id}
              className={`${themeColors.card} border shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <CardHeader className="pb-4">
                <CardTitle className={`flex items-center gap-3 text-xl ${themeColors.text.primary}`}>
                  <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg">
                    {section.icon}
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.content.map((paragraph, index) => (
                  <p key={index} className={`${themeColors.text.secondary} leading-relaxed`}>
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className={`mt-12 ${themeColors.card} border-emerald-500/20`}>
          <CardContent className="text-center py-8">
            <h3 className={`text-2xl font-semibold ${themeColors.text.primary} mb-4`}>
              Questions? Contact Us
            </h3>
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Mail className="w-5 h-5" />
              <span>helpdesk.offly@gmail.com</span>
            </div>
            <p className={`${themeColors.text.muted} mt-4`}>
              Thank you for using Offly and being part of a more mindful, positive world.
              These terms are effective as of the date listed above and supersede all prior versions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions; 