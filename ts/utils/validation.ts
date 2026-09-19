export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateClientName(name: string): ValidationResult {
  if (name.trim().length < 3) {
    return {
      valid: false,
      message: "Please enter your full name (at least 3 letters).",
    };
  }
  return { valid: true };
}

export function validateServiceSelected(serviceId: string): ValidationResult {
  if (!serviceId) {
    return { valid: false, message: "Please select a service." };
  }
  return { valid: true };
}

export function validateDateSelected(date: string): ValidationResult {
  if (!date) {
    return { valid: false, message: "Please select a date." };
  }
  return { valid: true };
}

export function validateTimeSelected(time: string | null): ValidationResult {
  if (!time) {
    return { valid: false, message: "Please choose a time slot." };
  }
  return { valid: true };
}
