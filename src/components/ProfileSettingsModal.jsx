import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  X,
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Trash2,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Upload,
  Key,
  UserCircle,
  Settings,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "../supabase";
import { updateUserProfile } from "../services/database";
import { getUserAvatarUrl, uploadAvatar, deleteAvatar, updateUserAvatar } from "../services/avatars";

export function ProfileSettingsModal({ user, userProfile, isOpen, onClose, onSave }) {
  const { theme, toggleTheme } = useTheme();

  // Modal animation refs
  const modalRef = useRef(null);
  const tabsRef = useRef(null);

  // Form states
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Profile form data
  const [profileData, setProfileData] = useState({
    username: userProfile?.username || "",
    full_name: userProfile?.full_name || user?.user_metadata?.full_name || "",
    email: user?.email || "",
    bio: userProfile?.bio || "",
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show/hide password
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Theme colors
  const themeColors = {
    background: theme === "dark"
      ? "bg-slate-950/95 backdrop-blur-xl"
      : "bg-white/95 backdrop-blur-xl",
    modal: theme === "dark"
      ? "bg-slate-900/95 border-slate-800/50 backdrop-blur-xl"
      : "bg-white/98 border-slate-200/60 backdrop-blur-xl shadow-2xl",
    text: {
      primary: theme === "dark" ? "text-white" : "text-slate-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-slate-700",
      muted: theme === "dark" ? "text-slate-400" : "text-slate-600",
    },
    card: theme === "dark"
      ? "bg-slate-800/50 border-slate-700/30 backdrop-blur-sm"
      : "bg-white/80 border-slate-200/50 backdrop-blur-sm shadow-lg",
    input: theme === "dark"
      ? "bg-slate-800/50 border-slate-700/50 focus:border-violet-400"
      : "bg-white/80 border-slate-300/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
    button: {
      primary: theme === "dark"
        ? "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
      secondary: theme === "dark"
        ? "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300",
      danger: "bg-red-500 hover:bg-red-600 text-white",
    },
  };

  // Animation effects
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );

      gsap.fromTo(
        ".settings-section",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      );
    }
  }, [isOpen, activeTab]);

  // Get profile image
  const getProfileImage = () => {
    // Show preview if uploading new avatar
    if (avatarPreview) {
      return avatarPreview;
    }
    // Use avatar service to get the appropriate avatar
    return getUserAvatarUrl(user, userProfile);
  };

  // Handle avatar file selection
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    setErrors({});

    try {
      // Upload the file
      const uploadResult = await uploadAvatar(avatarFile, user.id);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Update user's avatar URL in database
      const updateResult = await updateUserAvatar(user.id, uploadResult.url);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      setSuccessMessage("Avatar updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Clear upload states
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Notify parent to refresh user data
      onSave?.();
      
    } catch (error) {
      setErrors({ avatar: error.message || "Failed to upload avatar" });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Handle avatar removal
  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    setErrors({});

    try {
      // Delete from storage if it's a custom upload
      if (userProfile?.avatar_url && userProfile.avatar_url.includes('supabase')) {
        await deleteAvatar(userProfile.avatar_url);
      }

      // Assign a new random avatar and save it to database
      const { getRandomAvatar } = await import('../services/avatars');
      const newRandomAvatar = getRandomAvatar();
      const updateResult = await updateUserAvatar(user.id, newRandomAvatar);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      setSuccessMessage("Custom avatar removed! Returned to your random avatar.");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Clear upload states
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Notify parent to refresh user data
      onSave?.();
      
    } catch (error) {
      setErrors({ avatar: error.message || "Failed to remove avatar" });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Cancel avatar upload
  const handleAvatarCancel = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await updateUserProfile(user.id, {
        username: profileData.username,
        full_name: profileData.full_name,
        bio: profileData.bio,
      });

      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        onSave?.(profileData);
      } else {
        setErrors({ general: result.error || "Failed to update profile" });
      }
    } catch (error) {
      setErrors({ general: "An error occurred while updating your profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      setSuccessMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setErrors({ password: error.message || "Failed to send reset email" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle account deletion
  const handleAccountDeletion = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // In a real app, you'd call a backend endpoint to handle account deletion
        alert("Account deletion would be handled by backend service");
      } catch (error) {
        setErrors({ general: "Failed to delete account" });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${themeColors.background}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden ${themeColors.modal} shadow-2xl rounded-2xl border`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 ${themeColors.card} border-b px-8 py-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${themeColors.text.primary}`}>
                  Account Settings
                </h2>
                <p className={`${themeColors.text.secondary} mt-1`}>
                  Manage your profile and account preferences
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`${themeColors.text.muted} hover:${themeColors.text.primary} rounded-full p-2`}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {errors.general}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="danger" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="settings-section">
                  <Card className={`${themeColors.card} p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text.primary} mb-6 flex items-center`}>
                      <User className="w-5 h-5 mr-3" />
                      Profile Information
                    </h3>

                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6 mb-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={getProfileImage()} />
                          <AvatarFallback>
                            {(profileData.full_name || profileData.username || "U").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {avatarUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${themeColors.text.primary} mb-2`}>Profile Picture</h4>
                        <p className={`text-sm ${themeColors.text.muted} mb-4`}>
                          Upload a custom avatar or keep your randomly assigned one
                        </p>
                        
                        {!avatarFile ? (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={avatarUploading}
                            >
                              <Upload className="w-4 h-4" />
                              Upload New
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-500 hover:text-red-400"
                              onClick={handleAvatarRemove}
                              disabled={avatarUploading}
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={handleAvatarUpload}
                              disabled={avatarUploading}
                              className="flex items-center gap-2"
                            >
                              {avatarUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Save Avatar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleAvatarCancel}
                              disabled={avatarUploading}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        
                        {errors.avatar && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {errors.avatar}
                          </p>
                        )}
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="username" className={themeColors.text.secondary}>Username</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                          className={`mt-2 ${themeColors.input}`}
                          placeholder="Enter username"
                        />
                      </div>

                      <div>
                        <Label htmlFor="full_name" className={themeColors.text.secondary}>Full Name</Label>
                        <Input
                          id="full_name"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                          className={`mt-2 ${themeColors.input}`}
                          placeholder="Enter full name"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="email" className={themeColors.text.secondary}>Email Address</Label>
                        <Input
                          id="email"
                          value={profileData.email}
                          disabled
                          className={`mt-2 ${themeColors.input} opacity-60`}
                        />
                        <p className={`text-xs ${themeColors.text.muted} mt-1`}>
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="bio" className={themeColors.text.secondary}>Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          className={`mt-2 ${themeColors.input}`}
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={isSubmitting}
                        className={`${themeColors.button.primary} text-white`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <div className="settings-section">
                  <Card className={`${themeColors.card} p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text.primary} mb-6 flex items-center`}>
                      <Key className="w-5 h-5 mr-3" />
                      Password & Security
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className={`font-medium ${themeColors.text.primary} mb-3`}>Reset Password</h4>
                        <p className={`text-sm ${themeColors.text.muted} mb-4`}>
                          Send a password reset link to your email address.
                        </p>
                        <Button
                          onClick={handlePasswordReset}
                          disabled={isSubmitting}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                          Send Reset Email
                        </Button>
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <h4 className={`font-medium ${themeColors.text.primary} mb-3`}>Two-Factor Authentication</h4>
                        <p className={`text-sm ${themeColors.text.muted} mb-4`}>
                          Add an extra layer of security to your account.
                        </p>
                        <Badge variant="outline" className="mb-4">
                          Not Enabled
                        </Badge>
                        <div>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Enable 2FA
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <div className="settings-section">
                  <Card className={`${themeColors.card} p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text.primary} mb-6 flex items-center`}>
                      <Palette className="w-5 h-5 mr-3" />
                      App Preferences
                    </h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${themeColors.text.primary}`}>Dark Mode</h4>
                          <p className={`text-sm ${themeColors.text.muted}`}>
                            Switch between light and dark themes
                          </p>
                        </div>
                        <Button
                          onClick={toggleTheme}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {theme === "dark" ? (
                            <>
                              <Sun className="w-4 h-4" />
                              Light Mode
                            </>
                          ) : (
                            <>
                              <Moon className="w-4 h-4" />
                              Dark Mode
                            </>
                          )}
                        </Button>
                      </div>

                      <Separator />

                      <div>
                        <h4 className={`font-medium ${themeColors.text.primary} mb-3`}>Notifications</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${themeColors.text.secondary}`}>Email notifications</span>
                            <Button size="sm" variant="outline">Enabled</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${themeColors.text.secondary}`}>Daily reminders</span>
                            <Button size="sm" variant="outline">Disabled</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Danger Zone Tab */}
              <TabsContent value="danger" className="space-y-6">
                <div className="settings-section">
                  <Card className="border-red-500/20 bg-red-500/5 p-6">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-6 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-3" />
                      Danger Zone
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button
                          onClick={handleAccountDeletion}
                          className={themeColors.button.danger}
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 