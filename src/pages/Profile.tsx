
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, User, Mail, Phone, Calendar, MapPin, Save, X, Settings, Heart, Activity, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    height_cm: '',
    weight_kg: '',
    emergency_contact: '',
    medical_conditions: [] as string[],
    allergies: [] as string[]
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        address: profile.address || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        emergency_contact: profile.emergency_contact || '',
        medical_conditions: profile.medical_conditions || [],
        allergies: profile.allergies || []
      });
    }
  }, [profile, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        address: formData.address,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        emergency_contact: formData.emergency_contact,
        medical_conditions: formData.medical_conditions,
        allergies: formData.allergies
      };

      await updateProfile.mutateAsync(updateData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        address: profile.address || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        emergency_contact: profile.emergency_contact || '',
        medical_conditions: profile.medical_conditions || [],
        allergies: profile.allergies || []
      });
    }
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2ecac8]/10 via-white to-[#338886]/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ecac8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const calculateBMI = () => {
    if (formData.height_cm && formData.weight_kg) {
      const height = parseFloat(formData.height_cm) / 100;
      const weight = parseFloat(formData.weight_kg);
      return (weight / (height * height)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: string | null) => {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmiValue < 25) return { category: "Normal", color: "text-green-600" };
    if (bmiValue < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2ecac8]/10 via-white to-[#338886]/5">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
            
            <div className="flex space-x-2">
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => navigate('/settings')}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-[#2ecac8]"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    className="bg-[#2ecac8] hover:bg-[#338886] text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-32 space-y-6">
        {/* Profile Header Card */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#2ecac8] to-[#338886] px-6 py-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{formData.full_name || 'Your Profile'}</h2>
                <p className="text-[#2ecac8]/80 text-lg">{formData.email}</p>
                {formData.phone && (
                  <p className="text-[#2ecac8]/60 mt-1">{formData.phone}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Health Stats */}
          {(formData.height_cm || formData.weight_kg) && (
            <div className="bg-gray-50 px-6 py-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                {formData.height_cm && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{formData.height_cm}</div>
                    <div className="text-sm text-gray-600">cm</div>
                  </div>
                )}
                {formData.weight_kg && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{formData.weight_kg}</div>
                    <div className="text-sm text-gray-600">kg</div>
                  </div>
                )}
                {bmi && (
                  <div>
                    <div className={`text-2xl font-bold ${bmiCategory?.color || 'text-gray-900'}`}>{bmi}</div>
                    <div className="text-sm text-gray-600">BMI</div>
                    {bmiCategory && (
                      <div className={`text-xs ${bmiCategory.color} font-medium`}>
                        {bmiCategory.category}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Personal Information */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <User className="w-5 h-5 mr-2 text-[#2ecac8]" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <Input
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.full_name || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      type="email"
                      placeholder="Enter your email"
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.email || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.phone || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <Input
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      type="date"
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Gender</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900 py-2 capitalize">{formData.gender || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Address</Label>
              <div className="mt-2">
                {isEditing ? (
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                    rows={2}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.address || 'Not set'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Health Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Height (cm)</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <Input
                      value={formData.height_cm}
                      onChange={(e) => handleInputChange('height_cm', e.target.value)}
                      type="number"
                      placeholder="Enter height in cm"
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.height_cm ? `${formData.height_cm} cm` : 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Weight (kg)</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <Input
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                      type="number"
                      step="0.1"
                      placeholder="Enter weight in kg"
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.weight_kg ? `${formData.weight_kg} kg` : 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Phone className="w-5 h-5 mr-2 text-orange-500" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-sm font-medium text-gray-700">Emergency Contact Information</Label>
              <div className="mt-2">
                {isEditing ? (
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Enter emergency contact information"
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.emergency_contact || 'Not set'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
