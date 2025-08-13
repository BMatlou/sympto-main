
import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthValidatorProps {
  password: string;
  onValidChange: (isValid: boolean) => void;
}

interface ValidationRule {
  test: (password: string) => boolean;
  message: string;
}

const PasswordStrengthValidator: React.FC<PasswordStrengthValidatorProps> = ({
  password,
  onValidChange,
}) => {
  const rules: ValidationRule[] = [
    {
      test: (pwd) => pwd.length >= 8,
      message: "At least 8 characters long",
    },
    {
      test: (pwd) => /[A-Z]/.test(pwd),
      message: "Contains uppercase letter",
    },
    {
      test: (pwd) => /[a-z]/.test(pwd),
      message: "Contains lowercase letter",
    },
    {
      test: (pwd) => /[0-9]/.test(pwd),
      message: "Contains a number",
    },
    {
      test: (pwd) => /[^a-zA-Z0-9]/.test(pwd),
      message: "Contains a special character",
    },
  ];

  const passedRules = rules.map(rule => rule.test(password));
  const isValid = passedRules.every(passed => passed);

  React.useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

  if (!password) return null;

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
      <div className="space-y-1">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center space-x-2">
            {passedRules[index] ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-xs ${
                passedRules[index] ? "text-green-600" : "text-red-500"
              }`}
            >
              {rule.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthValidator;
