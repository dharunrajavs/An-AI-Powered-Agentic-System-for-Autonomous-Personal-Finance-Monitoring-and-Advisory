import { hashMessage, isBankSms, parseBatchSms, parseSmsText, validateParsed } from '../parser';

describe('SMS transaction parser', () => {
  test('1. Bank debit SMS', () => {
    const parsed = parseSmsText('Your A/c XXXX1234 is debited by Rs.450 at SWIGGY on 20-Aug-26.');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(450);
    expect(parsed.merchant).toBe('SWIGGY');
    expect(parsed.category).toBe('Food');
    expect(parsed.accountLast4).toBe('1234');
    expect(isBankSms('Your A/c XXXX1234 is debited by Rs.450 at SWIGGY on 20-Aug-26.')).toBe(true);
  });

  test('2. Bank credit SMS', () => {
    const parsed = parseSmsText('Rs.25,000 credited to your A/c XX1234 on 05-Aug-26. Ref: ABC123XYZ');
    expect(parsed.type).toBe('credit');
    expect(parsed.amount).toBe(25000);
    expect(isBankSms('Rs.25,000 credited to your A/c XX1234 on 05-Aug-26. Ref: ABC123XYZ')).toBe(true);
  });

  test('3. UPI payment (debit)', () => {
    const parsed = parseSmsText(
      'Rs.200 debited from HDFC Bank A/c XX1234 via UPI at ZOMATO on 20-Aug-26. UPI Ref: 412345678901'
    );
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(200);
    expect(parsed.merchant).toBe('ZOMATO');
    expect(parsed.paymentMethod).toBe('upi');
    expect(parsed.bankName).toContain('Hdfc');
    expect(parsed.referenceId).toBe('412345678901');
  });

  test('4. UPI received money (credit)', () => {
    const parsed = parseSmsText('₹1,000 received from RAHUL via UPI. Ref no 987654321012');
    expect(parsed.type).toBe('credit');
    expect(parsed.amount).toBe(1000);
    expect(parsed.merchant).toBe('RAHUL');
    expect(parsed.paymentMethod).toBe('upi');
    expect(isBankSms('₹1,000 received from RAHUL via UPI. Ref no 987654321012')).toBe(true);
  });

  test('5. ATM withdrawal', () => {
    const parsed = parseSmsText('Rs.5,000 withdrawn from ATM at ICICI Bank A/c XX5678 on 18-Aug-26.');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(5000);
    expect(parsed.paymentMethod).toBe('atm');
    expect(parsed.bankName).toContain('Icici');
  });

  test('6. Card transaction', () => {
    const parsed = parseSmsText(
      '₹1,200 spent on your ICICI Bank Debit Card XX4321 at FLIPKART on 15-Aug-26. Avl bal ₹8,000.'
    );
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(1200);
    expect(parsed.merchant).toBe('FLIPKART');
    expect(parsed.category).toBe('Shopping');
    expect(parsed.paymentMethod).toBe('card');
  });

  test('7. Bank transfer (IMPS)', () => {
    const parsed = parseSmsText(
      'Rs.3,000 transferred from A/c XX1234 to 9999999999@ybl via IMPS. Ref 123456789012.'
    );
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(3000);
    expect(parsed.referenceId).toBe('123456789012');
  });

  test('8. Salary credit', () => {
    const parsed = parseSmsText('Salary of Rs.50,000 credited to your A/c XX1234 on 01-Aug-26.');
    expect(parsed.type).toBe('credit');
    expect(parsed.amount).toBe(50000);
    expect(parsed.merchant).toBe('Salary Credit');
  });

  test('8b. ICICI-style "Credit to A/C" SMS is parsed as credit', () => {
    const parsed = parseSmsText('ICICI Bank: Credit to A/C XX1234 Rs.50,000 on 01-Aug-26. Bal Rs.1,00,000.');
    expect(parsed.type).toBe('credit');
    expect(parsed.amount).toBe(50000);
    expect(parsed.bankName).toContain('Icici');
  });

  test('8c. "credited into your account" SMS is parsed as credit', () => {
    const parsed = parseSmsText('Rs.2,000 has been credited into your account on 05-Aug-26.');
    expect(parsed.type).toBe('credit');
    expect(parsed.amount).toBe(2000);
  });

  test('8d. "Credit Rs" SMS is parsed as credit', () => {
    const parsed = parseSmsText('HDFC Bank: Credit Rs.15,000 to UPI Ref 412345678901');
    expect(parsed.type).toBe('credit');
    expect(parsed.amount).toBe(15000);
  });

  test('8e. "credited in account" SMS is parsed as credit', () => {
    const parsed = parseSmsText('Money received in account no 5678 Rs.7,500 on 10-Aug-26.');
    expect(parsed.type).toBe('credit');
    expect(parsed.amount).toBe(7500);
  });

  test('9. OTP SMS is ignored', () => {
    expect(isBankSms('123456 is your OTP for SBI. Do not share it with anyone.')).toBe(false);
    expect(parseBatchSms([{ body: '123456 is your OTP for SBI. Do not share it with anyone.' }])).toHaveLength(0);
  });

  test('10. Promotional SMS is ignored', () => {
    expect(isBankSms('Exclusive offer! Flat 50% off at Myntra this weekend. Shop now.')).toBe(false);
    expect(parseBatchSms([{ body: 'Exclusive offer! Flat 50% off at Myntra this weekend. Shop now.' }])).toHaveLength(0);
  });

  test('11. Duplicate SMS produces the same message hash', () => {
    const body = 'Rs.450 debited at SWIGGY on 20-Aug-26. Ref: 111222333';
    expect(hashMessage(body)).toBe(hashMessage(body));
    expect(hashMessage(body)).not.toBe(hashMessage('Rs.450 debited at SWIGGY on 20-Aug-26. Ref: 999888777'));

    const first = parseSmsText(body);
    const second = parseSmsText(body);
    expect(first.messageHash).toBe(second.messageHash);
  });

  test('12. Unknown SMS format is ignored', () => {
    expect(isBankSms('Hello, how are you doing today?')).toBe(false);
  });

  test('13. Missing amount is ignored / rejected', () => {
    const text = 'Your account has been debited at SWIGGY.';
    expect(isBankSms(text)).toBe(false);

    const parsed = parseSmsText(text);
    expect(validateParsed(parsed)).toBe(false);
  });

  test('14. Unknown merchant is rejected', () => {
    const parsed = parseSmsText('Rs.500 debited from your account.');
    expect(parsed.merchant).toBe('Unknown Merchant');
    expect(validateParsed(parsed)).toBe(false);
    expect(parseBatchSms([{ body: 'Rs.500 debited from your account.' }])).toHaveLength(0);
  });

  test('Amount format variations are supported', () => {
    for (const prefix of ['Rs.500', 'Rs 500', 'INR 500', '₹500', '₹ 500', 'Rs.500.00']) {
      const parsed = parseSmsText(`${prefix} debited at AMAZON on 20-Aug-26.`);
      expect(parsed.type).toBe('debit');
      expect(parsed.amount).toBe(500);
      expect(parsed.merchant).toBe('AMAZON');
    }
  });

  test('parseBatchSms only returns valid financial transactions', () => {
    const result = parseBatchSms([
      { body: 'Rs.450 debited at SWIGGY on 20-Aug-26. Ref: 111', sender: 'HDFCBK' },
      { body: '567890 is your OTP for ICICI. Never share it.' },
      { body: 'Big sale! 70% off everything at Flipkart!' },
      { body: 'Salary of Rs.80,000 credited to your A/c XX1234.' },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].merchant).toBe('SWIGGY');
    expect(result[1].merchant).toBe('Salary Credit');
  });

  test('Credit category mapping covers new categories', () => {
    expect(parseSmsText('Rs.1,999 debited at NETFLIX on 20-Aug-26.').category).toBe('Entertainment');
    expect(parseSmsText('Rs.500 debited at UBER on 20-Aug-26.').category).toBe('Transport');
    expect(parseSmsText('Rs.2,500 debited at APOLLO PHARMACY on 20-Aug-26.').category).toBe('Healthcare');
    expect(parseSmsText('Rs.10,000 debited at GROWW on 20-Aug-26.').category).toBe('Investment');
    expect(parseSmsText('Rs.1,200 debited at BYJU\'S on 20-Aug-26.').category).toBe('Education');
  });

  test('NEFT transaction', () => {
    const parsed = parseSmsText('Rs.25,000 transferred via NEFT to A/c XX9876 on 20-Aug-26. Ref: NEFT123456');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(25000);
    expect(parsed.paymentMethod).toBe('bank');
    expect(parsed.referenceId).toBe('NEFT123456');
  });

  test('RTGS transaction', () => {
    const parsed = parseSmsText('Rs.2,00,000 transferred via RTGS to A/c XX9876 on 20-Aug-26. UTR: RTGS123456789');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(200000);
    expect(parsed.paymentMethod).toBe('bank');
    expect(parsed.referenceId).toBe('RTGS123456789');
  });

  test('UPI credit (received money)', () => {
    const parsed = parseSmsText('₹5,000 received from JOHN DOE via UPI on 20-Aug-26. Ref: UPI123456789');
    expect(parsed.type).toBe('credit');
    expect(parsed.amount).toBe(5000);
    expect(parsed.paymentMethod).toBe('upi');
  });

  test('SMS with decimal amount', () => {
    const parsed = parseSmsText('Rs.1,250.50 debited at AMAZON on 20-Aug-26.');
    expect(parsed.amount).toBe(1250.5);
  });

  test('SMS with commas in amount', () => {
    const parsed = parseSmsText('Rs.1,23,456 debited at AMAZON on 20-Aug-26.');
    expect(parsed.amount).toBe(123456);
  });

  test('SMS containing masked account number', () => {
    const parsed = parseSmsText('Rs.500 debited from A/c XXXXXX1234 on 20-Aug-26.');
    expect(parsed.accountLast4).toBe('1234');
  });

  test('SMS containing available balance', () => {
    const parsed = parseSmsText('Rs.500 debited at SWIGGY. Avl Bal Rs.10,000.');
    expect(parsed.amount).toBe(500);
  });

  test('SMS without balance', () => {
    const parsed = parseSmsText('Rs.500 debited at SWIGGY on 20-Aug-26.');
    expect(parsed.amount).toBe(500);
  });

  test('Card payment with swipe', () => {
    const parsed = parseSmsText('Rs.2,500 swiped on your HDFC Bank Credit Card XX4567 at SHOPPERS STOP on 20-Aug-26.');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(2500);
    expect(parsed.paymentMethod).toBe('card');
    expect(parsed.bankName).toContain('Hdfc');
  });

  test('ATM withdrawal with balance', () => {
    const parsed = parseSmsText('Rs.3,000 withdrawn from ATM at SBI Bank A/c XX7890. Avl Bal: Rs.15,000.');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(3000);
    expect(parsed.paymentMethod).toBe('atm');
    expect(parsed.bankName).toContain('Sbi');
  });

  test('Recharge transaction', () => {
    const parsed = parseSmsText('Rs.299 paid for Jio Recharge via UPI on 20-Aug-26. Ref: UPI123456');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(299);
    expect(parsed.paymentMethod).toBe('upi');
  });

  test('Bill payment', () => {
    const parsed = parseSmsText('Rs.1,500 paid for Electricity Bill via NEFT on 20-Aug-26. Ref: NEFT789456');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(1500);
    expect(parsed.paymentMethod).toBe('bank');
  });

  test('Cash withdrawal', () => {
    const parsed = parseSmsText('Rs.10,000 withdrawn from A/c XX1234 on 20-Aug-26.');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(10000);
    expect(parsed.paymentMethod).toBe('atm');
  });

  test('Bank transfer (NEFT)', () => {
    const parsed = parseSmsText('Rs.50,000 transferred via NEFT to A/c XX5678 on 20-Aug-26. Ref: NEFT112233');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(50000);
    expect(parsed.paymentMethod).toBe('bank');
  });

  test('Bank transfer (RTGS)', () => {
    const parsed = parseSmsText('Rs.5,00,000 transferred via RTGS to A/c XX5678 on 20-Aug-26. UTR: RTGS445566');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(500000);
    expect(parsed.paymentMethod).toBe('bank');
  });

  test('IMPS transaction', () => {
    const parsed = parseSmsText('Rs.10,000 transferred via IMPS to 9876543210@upi on 20-Aug-26. Ref: IMPS123');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(10000);
    expect(parsed.paymentMethod).toBe('upi');
  });

  test('Credit card payment', () => {
    const parsed = parseSmsText('Rs.15,000 paid on your ICICI Credit Card XX1234 on 20-Aug-26.');
    expect(parsed.type).toBe('debit');
    expect(parsed.amount).toBe(15000);
    expect(parsed.paymentMethod).toBe('card');
  });
});