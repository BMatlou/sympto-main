import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdateProfile } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface IdValidationResult {
  valid: boolean;
  error?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  citizenship?: string;
}

const NewUserOnboarding = () => {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    id_number: '',
    passport_number: '',
    document_type: 'id' as 'id' | 'passport',
    address: '',
    phone: '',
    emergency_contact: '',
    height: "",
    weight: "",
    bloodPressure: "",
    waistCircumference: "",
    
    // Medical History
    chronicConditions: [] as string[],
    pastIllnesses: "",
    allergies: "",
    currentMedications: "",
    
    // Family History
    familyConditions: [] as string[],
    hereditaryDisorders: "",
    
    // Surgical History
    surgeries: "",
    surgeryDates: "",
    complications: "",
    
    // Lifestyle
    smoking: "",
    alcohol: "",
    dietType: "",
    exerciseRoutine: "",
    sleepSchedule: "",
    stressLevel: "",
    
    // Privacy & Settings
    dataConsent: false,
    shareWithProviders: false,
    biometricEnabled: false,
    fitnessAppsEnabled: false,
    healthSharingEnabled: false,
  });

  const [idData, setIdData] = useState<IdValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const chronicConditionOptions = [
    "Diabetes", "Asthma", "Hypertension", "Heart Disease", 
    "Arthritis", "Depression", "Anxiety", "Other"
  ];

  const familyConditionOptions = [
    "Heart Disease", "Cancer", "Diabetes", "Stroke",
    "Alzheimer's", "Mental Health", "Autoimmune", "Other"
  ];

  const decodeIdNumber = async (idNumber: string) => {
    if (idNumber.length !== 13) {
      setIdData(null);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('decode_sa_id', { id_number: idNumber });
      
      if (error) {
        console.error('Error decoding ID:', error);
        setIdData({ valid: false, error: 'Failed to decode ID number' });
        return;
      }

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const result = data as unknown as IdValidationResult;
        setIdData(result);
        
        if (result.valid) {
          toast.success('ID number validated successfully!');
        } else {
          toast.error(result.error || 'Invalid ID number');
        }
      } else {
        setIdData({ valid: false, error: 'Invalid response from server' });
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error calling decode function:', error);
      setIdData({ valid: false, error: 'Failed to validate ID number' });
    }
  };

  const handleDocumentNumberChange = (value: string) => {
    if (formData.document_type === 'id') {
      setFormData(prev => ({ ...prev, id_number: value }));
      if (value.length === 13) {
        decodeIdNumber(value);
      } else {
        setIdData(null);
      }
    } else {
      setFormData(prev => ({ ...prev, passport_number: value }));
      setIdData(null);
    }
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightM = parseFloat(formData.height) / 100;
      const weightKg = parseFloat(formData.weight);
      return (weightKg / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const enableBiometricLock = async () => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        console.log('WebAuthn not supported');
        return false;
      }

      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        console.log('Platform authenticator not available');
        return false;
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create credential with better error handling
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: { 
            name: 'Sympto+',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode('user-' + Date.now()),
            name: formData.full_name || 'user',
            displayName: formData.full_name || 'User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'none'
        }
      });

      if (credential) {
        console.log('Biometric credential created successfully');
        return true;
      }
      return false;
    } catch (error: any) {
      console.log('Biometric setup failed:', error);
      // Handle specific error cases
      if (error.name === 'NotAllowedError') {
        console.log('User cancelled biometric setup');
      } else if (error.name === 'NotSupportedError') {
        console.log('Biometric authentication not supported');
      }
      return false;
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        // Step 1: Personal Information - require basic info
        return formData.full_name.trim() !== '' && 
               (formData.document_type === 'id' ? formData.id_number.length === 13 : formData.passport_number.trim() !== '');
      case 2:
        // Step 2: Address - require address
        return formData.address.trim() !== '';
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // Steps 3-7: Optional information, can proceed without filling
        return true;
      case 8:
        // Step 8: Privacy consent required
        return formData.dataConsent;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      if (canProceedToNextStep()) {
        setCurrentStep(currentStep + 1);
      } else {
        // Show specific validation messages
        if (currentStep === 1) {
          if (!formData.full_name.trim()) {
            toast.error('Please enter your full name');
            return;
          }
          if (formData.document_type === 'id' && formData.id_number.length !== 13) {
            toast.error('Please enter a valid 13-digit ID number');
            return;
          }
          if (formData.document_type === 'passport' && !formData.passport_number.trim()) {
            toast.error('Please enter your passport number');
            return;
          }
        } else if (currentStep === 2 && !formData.address.trim()) {
          toast.error('Please enter your address');
          return;
        } else if (currentStep === 8 && !formData.dataConsent) {
          toast.error('Please accept the data consent to continue');
          return;
        }
      }
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isProcessing) return; // Prevent double submit
    setIsProcessing(true);
    console.log('Starting profile setup...');

    try {
      // Verify user is authenticated before proceeding
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Authentication error:', userError);
        toast.error('Authentication session expired. Please log in again.');
        setIsProcessing(false);
        navigate('/auth');
        return;
      }

      console.log('User authenticated:', user.id);

      // Final validation for required fields
      if (!formData.full_name || (!formData.id_number && !formData.passport_number) || !formData.address) {
        toast.error('Please fill in all required fields');
        setIsProcessing(false);
        return;
      }

      if (formData.document_type === 'id' && formData.id_number && (!idData || !idData.valid)) {
        toast.error('Please enter a valid South African ID number');
        setIsProcessing(false);
        return;
      }

      // Handle biometric setup if requested (but don't let it block the process)
      let biometricSuccess = false;
      if (formData.biometricEnabled) {
        console.log('Attempting biometric setup...');
        try {
          biometricSuccess = await enableBiometricLock();
          if (biometricSuccess) {
            toast.success('Biometric lock enabled successfully!');
            localStorage.setItem('biometricLockEnabled', 'true');
          } else {
            console.log('Biometric setup failed, but continuing with profile setup');
            toast.info('Biometric setup was skipped - you can enable it later in settings');
          }
        } catch (error) {
          console.error('Error during biometric setup:', error);
          toast.info('Biometric setup encountered an issue - you can enable it later in settings');
        }
      }

      // Update user profile with improved error handling
      console.log('Updating user profile...');
      const profileData = {
        full_name: formData.full_name,
        id_number: formData.document_type === 'id' ? formData.id_number : null,
        passport_number: formData.document_type === 'passport' ? formData.passport_number : null,
        address: formData.address,
        phone: formData.phone || null,
        emergency_contact: formData.emergency_contact || null,
        gender: idData?.gender || null,
        age: idData?.age || null,
        date_of_birth: idData?.birth_date || null,
        citizenship_status: idData?.citizenship || null,
        height_cm: formData.height ? parseInt(formData.height) : null,
        weight_kg: formData.weight ? parseFloat(formData.weight) : null,
        medical_conditions: formData.chronicConditions.length > 0 ? formData.chronicConditions : null,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : null
      };

      try {
        await updateProfile.mutateAsync(profileData);
        console.log('Profile updated successfully');
      } catch (profileError: any) {
        console.error('Profile update failed:', profileError);
        toast.error(`Failed to update profile: ${profileError.message || 'Unknown error'}`);
        setIsProcessing(false);
        return;
      }

      // Create user settings with improved error handling
      console.log('Creating user settings...');
      try {
        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            biometric_lock_enabled: biometricSuccess,
            fitness_app_sync_enabled: formData.fitnessAppsEnabled,
            health_data_sharing_enabled: formData.healthSharingEnabled,
            anonymous_analytics_enabled: true
          });

        if (settingsError) {
          console.error('Error saving settings:', settingsError);
          // Don't fail the whole process if settings save fails
          toast.info('Settings saved with some issues - you can adjust them later');
        } else {
          console.log('Settings saved successfully');
        }
      } catch (settingsError) {
        console.error('Settings save error:', settingsError);
        // Don't fail the whole process
      }

      // Store health profile data locally
      localStorage.setItem('healthProfile', JSON.stringify(formData));

      // Create connected fitness apps if enabled
      if (formData.fitnessAppsEnabled) {
        console.log('Setting up fitness apps...');
        const fitnessApps = [
          { app_name: 'Google Fit', app_type: 'fitness_tracker' },
          { app_name: 'Fitbit', app_type: 'wearable' }
        ];

        for (const app of fitnessApps) {
          try {
            await supabase
              .from('connected_fitness_apps')
              .insert({
                user_id: user.id,
                ...app,
                is_connected: true,
                last_sync_at: new Date().toISOString()
              });
          } catch (error) {
            console.error('Error setting up fitness app:', app.app_name, error);
            // Don't fail the whole process if fitness app setup fails
          }
        }
      }

      console.log('Profile setup completed successfully');
      toast.success('Profile setup completed successfully!');

      setIsProcessing(false); // Set before navigation
      navigate('/'); // Redirect to home after onboarding
      return;
    } catch (error: any) {
      console.error('Unexpected error during profile setup:', error);
      toast.error(`Failed to setup profile: ${error.message || 'Please try again'}`);
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-6 h-6 text-[#2ecac8]" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            
            <div>
              <Label htmlFor="full_name">Full Names *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full names"
                required
              />
            </div>

            <div>
              <Label>Document Type *</Label>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, document_type: 'id' }))}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.document_type === 'id'
                      ? 'bg-[#2ecac8] text-white border-[#2ecac8]'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  SA ID Number
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, document_type: 'passport' }))}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.document_type === 'passport'
                      ? 'bg-[#2ecac8] text-white border-[#2ecac8]'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Passport
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="document_number">
                {formData.document_type === 'id' ? 'South African ID Number *' : 'Passport Number *'}
              </Label>
              <Input
                id="document_number"
                value={formData.document_type === 'id' ? formData.id_number : formData.passport_number}
                onChange={(e) => handleDocumentNumberChange(e.target.value)}
                placeholder={formData.document_type === 'id' ? 'Enter your 13-digit ID number' : 'Enter your passport number'}
                maxLength={formData.document_type === 'id' ? 13 : undefined}
                required
              />
              {idData && idData.valid && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Verified:</strong> {idData.gender}, Age {idData.age}, {idData.citizenship}
                  </p>
                </div>
              )}
              {idData && idData.error && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">{idData.error}</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                placeholder="Emergency contact number"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-6 h-6 text-[#2ecac8]" />
              <h2 className="text-xl font-semibold text-gray-900">Address & Physical Info</h2>
            </div>
            
            <div>
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your full address"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  placeholder="170"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="70"
                />
              </div>
            </div>

            {calculateBMI() && (
              <div className="bg-[#2ecac8]/10 p-3 rounded-lg">
                <p className="text-sm text-[#338886]">Your BMI: {calculateBMI()}</p>
              </div>
            )}

            <div>
              <Label htmlFor="bloodPressure">Blood Pressure (optional)</Label>
              <Input
                id="bloodPressure"
                value={formData.bloodPressure}
                onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                placeholder="120/80"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Medical History</h2>
            <div>
              <Label>Chronic Conditions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {chronicConditionOptions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => {
                      const updated = formData.chronicConditions.includes(condition)
                        ? formData.chronicConditions.filter(c => c !== condition)
                        : [...formData.chronicConditions, condition];
                      setFormData({...formData, chronicConditions: updated});
                    }}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      formData.chronicConditions.includes(condition)
                        ? 'bg-[#2ecac8] text-white border-[#2ecac8]'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                placeholder="List any medication, food, or environmental allergies..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Family History</h2>
            <div>
              <Label>Family Medical Conditions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {familyConditionOptions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => {
                      const updated = formData.familyConditions.includes(condition)
                        ? formData.familyConditions.filter(c => c !== condition)
                        : [...formData.familyConditions, condition];
                      setFormData({...formData, familyConditions: updated});
                    }}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      formData.familyConditions.includes(condition)
                        ? 'bg-[#2ecac8] text-white border-[#2ecac8]'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="hereditaryDisorders">Hereditary Disorders</Label>
              <Textarea
                id="hereditaryDisorders"
                value={formData.hereditaryDisorders}
                onChange={(e) => setFormData({...formData, hereditaryDisorders: e.target.value})}
                placeholder="Any autoimmune or hereditary disorders in close relatives..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Surgical History</h2>
            <div>
              <Label htmlFor="surgeries">Previous Surgeries</Label>
              <Textarea
                id="surgeries"
                value={formData.surgeries}
                onChange={(e) => setFormData({...formData, surgeries: e.target.value})}
                placeholder="List any surgeries you've had..."
              />
            </div>
            <div>
              <Label htmlFor="complications">Complications or Special Care</Label>
              <Textarea
                id="complications"
                value={formData.complications}
                onChange={(e) => setFormData({...formData, complications: e.target.value})}
                placeholder="Any follow-up complications or special care needs..."
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Lifestyle Factors</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smoking">Smoking Status</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.smoking}
                  onChange={(e) => setFormData({...formData, smoking: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="never">Never</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
              </div>
              <div>
                <Label htmlFor="alcohol">Alcohol Use</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.alcohol}
                  onChange={(e) => setFormData({...formData, alcohol: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="none">None</option>
                  <option value="light">Light (1-2/week)</option>
                  <option value="moderate">Moderate (3-7/week)</option>
                  <option value="heavy">Heavy (8+/week)</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="dietType">Diet Type</Label>
              <Input
                id="dietType"
                value={formData.dietType}
                onChange={(e) => setFormData({...formData, dietType: e.target.value})}
                placeholder="e.g., Vegan, High-protein, Mediterranean..."
              />
            </div>
            <div>
              <Label htmlFor="exerciseRoutine">Exercise Routine</Label>
              <Textarea
                id="exerciseRoutine"
                value={formData.exerciseRoutine}
                onChange={(e) => setFormData({...formData, exerciseRoutine: e.target.value})}
                placeholder="Describe your typical exercise routine..."
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-[#2ecac8]" />
              <h2 className="text-xl font-semibold text-gray-900">Security & Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Biometric Lock</h4>
                  <p className="text-sm text-gray-600">Use fingerprint or face recognition to secure your app</p>
                </div>
                <Switch
                  checked={formData.biometricEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, biometricEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Connect Fitness Apps</h4>
                  <p className="text-sm text-gray-600">Sync data from Google Fit, Fitbit, and other apps</p>
                </div>
                <Switch
                  checked={formData.fitnessAppsEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fitnessAppsEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Health Data Sharing</h4>
                  <p className="text-sm text-gray-600">Share anonymized data to improve health insights</p>
                </div>
                <Switch
                  checked={formData.healthSharingEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, healthSharingEnabled: checked }))}
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Privacy & Consent</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="dataConsent"
                  checked={formData.dataConsent}
                  onChange={(e) => setFormData({...formData, dataConsent: e.target.checked})}
                  className="mt-1"
                />
                <Label htmlFor="dataConsent" className="text-sm">
                  I consent to the processing of my health data for personalized recommendations and health insights.
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="shareWithProviders"
                  checked={formData.shareWithProviders}
                  onChange={(e) => setFormData({...formData, shareWithProviders: e.target.checked})}
                  className="mt-1"
                />
                <Label htmlFor="shareWithProviders" className="text-sm">
                  I allow sharing my health summary with healthcare providers when booking appointments.
                </Label>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Your health data is encrypted and secure. You can modify these preferences anytime in settings.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#2ecac8] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isProcessing}
            className="flex items-center space-x-2"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </Button>
          
          <Button
            onClick={handleNext}
            className="bg-[#2ecac8] hover:bg-[#338886] text-white flex items-center space-x-2"
            disabled={!canProceedToNextStep() || isProcessing}
          >
            <span>
              {currentStep === totalSteps 
                ? (isProcessing ? 'Setting up...' : 'Complete Setup') 
                : 'Next'
              }
            </span>
            {currentStep !== totalSteps && <ChevronRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewUserOnboarding;
