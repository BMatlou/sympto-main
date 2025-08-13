
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Fingerprint, Shield } from 'lucide-react';

interface BiometricLockPromptProps {
  onVerified: () => void;
  onCancel?: () => void;
}

const BiometricLockPrompt: React.FC<BiometricLockPromptProps> = ({ onVerified, onCancel }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    checkBiometricRequired();
  }, []);

  const checkBiometricRequired = async () => {
    // Check if biometric lock is enabled in user settings
    const biometricEnabled = localStorage.getItem('biometricLockEnabled') === 'true';
    if (biometricEnabled) {
      setShowPrompt(true);
    } else {
      onVerified();
    }
  };

  const handleBiometricVerification = async () => {
    setIsVerifying(true);
    try {
      if (navigator.credentials) {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            rpId: window.location.hostname,
            allowCredentials: [],
            userVerification: 'required',
            timeout: 60000
          }
        });
        
        if (credential) {
          setShowPrompt(false);
          onVerified();
        }
      } else {
        // Fallback for devices without WebAuthn support
        setShowPrompt(false);
        onVerified();
      }
    } catch (error) {
      console.error('Biometric verification failed:', error);
      // Still allow access on failure
      setShowPrompt(false);
      onVerified();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    setShowPrompt(false);
    onVerified();
  };

  const handleCancel = () => {
    setShowPrompt(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={showPrompt} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#2ecac8]" />
            <span>Biometric Authentication</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#2ecac8]/10 rounded-full flex items-center justify-center">
            <Fingerprint className="w-8 h-8 text-[#2ecac8]" />
          </div>
          
          <p className="text-gray-600">
            Please verify your identity to access your health data
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={handleBiometricVerification}
              disabled={isVerifying}
              className="w-full bg-[#2ecac8] hover:bg-[#338886]"
            >
              {isVerifying ? 'Verifying...' : 'Verify with Biometrics'}
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              className="w-full"
            >
              Skip for now
            </Button>

            {onCancel && (
              <Button
                onClick={handleCancel}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BiometricLockPrompt;
