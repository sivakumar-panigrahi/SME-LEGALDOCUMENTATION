
export const IS_TESTING = false;
export const ALLOWED_EMAIL = "5221411201@gvpcdpgc.edu.in";
export const SENDER_EMAIL = "onboarding@resend.dev";

export const validateTestingEmail = (email: string): boolean => {
  if (!IS_TESTING) return true;
  return email.toLowerCase() === ALLOWED_EMAIL.toLowerCase();
};

export const getTestingMessage = (): string => {
  return `This is a testing environment. You can only send emails to your verified address: ${ALLOWED_EMAIL}. To send to others, verify a domain at Resend.com.`;
};
