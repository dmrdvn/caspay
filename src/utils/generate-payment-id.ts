import { createHash } from 'crypto';


export function generatePaymentId(): number {
  const timestamp = Date.now().toString();
  const random = Math.random().toString();
  const combined = `${timestamp}-${random}`;
  

  const hash = createHash('sha256').update(combined).digest('hex');
  
  const hexSubstring = hash.substring(0, 6);
  const decimal = parseInt(hexSubstring, 16);
  

  return 100000 + (decimal % 900000);
}


export function isValidPaymentId(id: string | number): boolean {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return !isNaN(numId) && numId >= 100000 && numId <= 999999;
}
