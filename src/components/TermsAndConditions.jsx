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
      title: "Not Medical or Mental Health Advice",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "Offly is designed to support daily reflection, habit-building, and focus—but it is not a medical or mental health tool.",
        "Offly does not provide clinical, therapeutic, or psychological advice.",
        "The content generated within the app (e.g., streak tracking, check-ins, reflections) is for personal development only.",
        "If you're experiencing mental health challenges, depression, anxiety, or any serious emotional distress, we strongly encourage you to consult a licensed medical or mental health professional.",
        "Offly is not a substitute for therapy, counseling, or medical treatment."
      ]
    },
    {
      id: 2,
      title: "User Responsibility",
      icon: <Users className="w-5 h-5" />,
      content: [
        "By using Offly, you agree to:",
        "• Take full responsibility for how you use the app and interpret its content.",
        "• Use the app in a respectful and lawful manner.",
        "• Avoid posting or entering harmful, offensive, or inappropriate content.",
        "We reserve the right to remove posts or content that violate community standards."
      ]
    },
    {
      id: 3,
      title: "Privacy and Data Protection",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Your trust is important to us. Here's how we handle your data:",
        "",
        "What we collect:",
        "• Basic account information (like your email and username)",
        "• Your preferences (e.g., hobbies or goals for personalization)",
        "• Your daily check-ins and streak activity (these are always private unless shared by you)",
        "• Posts you choose to share publicly within the Offly Community",
        "",
        "What we don't collect:",
        "• We do not collect or store sensitive health, financial, or personally identifying details beyond what is needed for functionality.",
        "",
        "How your data is used:",
        "• To personalize your experience (e.g., user suggestions)",
        "• To calculate streaks, achievements, and display community posts",
        "• To improve the product and fix bugs",
        "• For strictly internal analytics to make Offly better",
        "",
        "We do not sell your data. We do not share your personal data with third parties for advertising purposes.",
        "",
        "Where your data is stored:",
        "• Your data is securely stored using trusted cloud providers with industry-standard encryption."
      ]
    },
    {
      id: 4,
      title: "Community Standards",
      icon: <Users className="w-5 h-5" />,
      content: [
        "We strive to make Offly a positive and safe place. To maintain this:",
        "• Only positive emoji reactions are allowed (no comments or negativity).",
        "• Check-in text is moderated using AI to filter out profanity or inappropriate content.",
        "• Users who violate guidelines may have their content removed or accounts suspended."
      ]
    },
    {
      id: 5,
      title: "Sharing on Other Platforms",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "When you share achievements to platforms like LinkedIn or Facebook, Offly only posts content you have explicitly chosen to share. We do not post anything without your consent."
      ]
    },
    {
      id: 6,
      title: "Account Deletion",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "You may request deletion of your account and data at any time. To do so:",
        "• Use the \"Delete Account\" option in the app settings",
        "• Or email us at support@offly.app",
        "",
        "Once deleted, your personal data and check-in history will be permanently removed."
      ]
    },
    {
      id: 7,
      title: "Updates to These Terms",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "We may update this policy occasionally to reflect new features or regulatory requirements. Any updates will be posted here, and your continued use of Offly means you accept those updates."
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
              But first, please read this important information about how we operate and how we protect your data.
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
              <span>support@offly.app</span>
            </div>
            <p className={`${themeColors.text.muted} mt-4`}>
              Thank you for using Offly and being part of a more mindful, positive world.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions; 