import { generate } from 'otp-generator';

export const generateOTP = (): string => {
  return generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};
