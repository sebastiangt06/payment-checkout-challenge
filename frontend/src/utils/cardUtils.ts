export const detectCardBrand = (number: string): 'VISA' | 'MASTERCARD' | 'UNKNOWN' => {
  const clean = number.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
  return 'UNKNOWN';
};

export const validateLuhn = (number: string): boolean => {
  const digits = number.replace(/\D/g, '').split('').map(Number);
  if (digits.length < 13) return false;
  
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};