import type { SmsTrackingCategory } from '../../types';

/**
 * Modular merchant -> category mapping.
 * Add new merchants under the matching category. This module can later be
 * swapped for an ML/AI classifier without touching the rest of the pipeline.
 */

const FOOD = ['swiggy', 'zomato', 'domino', 'dominos', 'pizza hut', 'pizzahut', 'starbucks', 'kfc', 'mcdonald', 'mcdonalds', 'burger king', 'restaurant', 'dining', 'cafe', 'food', 'eat', 'dhaba', 'hotel', 'biryani', 'faasos', 'box8', 'mcd', 'chaayos', 'barbeque', 'barbecue', 'taco', 'subway', 'deliveroo'];
const SHOPPING = ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'shopping', 'mall', 'store', 'retail', 'lifestyle', 'trends', 'max fashion', 'max ', 'pantaloons', 'zara', 'h&m', 'walmart', 'bigbasket', 'dmart', 'd mart', 'tatacliq', 'croma', 'reliance digital', 'snapdeal', 'ebay'];
const TRANSPORT = ['uber', 'ola', 'rapido', 'auto', 'taxi', 'cab', 'metro', 'irctc', 'redbus', 'red bus', 'shuttl', 'city bus', 'bmc', 'bus fare', 'parking', 'toll', 'fastag', 'fast tag', 'fuel', 'petrol', 'diesel', 'indian oil', 'bharat petroleum', 'hp petrol', 'hpc', 'iocl', 'gas station', 'cng'];
const TRAVEL = ['makemytrip', 'goibibo', 'mmt', 'yatra', 'cleartrip', 'flight', 'airlines', 'air india', 'indigo', 'spicejet', 'vistara', 'railway', 'train', 'hotel booking', 'oyo', 'booking.com', 'airbnb', 'travel'];
const BILLS = ['electricity', 'bill', 'water', 'gas', 'broadband', 'jio', 'airtel', 'vi ', 'vodafone', 'idea', 'bsnl', 'tata sky', 'tatasky', 'dish tv', 'rent', 'maintenance', 'society', 'property tax', 'insurance', 'lic ', 'mutualfund', 'dth', 'recharge'];
const ENTERTAINMENT = ['netflix', 'prime video', 'amazon prime', 'hotstar', 'disney', 'zee5', 'sony liv', 'sonyliv', 'spotify', 'youtube', 'gaana', 'pvr', 'cinema', 'movie', 'theatre', 'game', 'gaming', 'bookmyshow', 'playstation', 'xbox', 'steam', 'valorant', 'pubg'];
const EDUCATION = ['byju', 'vedantu', 'unacademy', 'coursera', 'udemy', 'skillshare', 'khan', 'school', 'college', 'tuition', 'course', 'class', 'exam', 'books', 'bookstore', 'library', 'jee', 'neet', 'coaching', 'edtech'];
const HEALTHCARE = ['apollo', 'medplus', 'pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'dentist', 'medicine', 'health', 'wellness', 'diagnostic', 'pathology', 'ayurveda', 'netmeds', '1mg', 'practo', 'lab', 'blood', 'physio', 'therapist'];
const INVESTMENT = ['zerodha', 'groww', 'upstox', 'coin', 'angel one', 'mutual fund', 'sip', 'stock', 'share', 'equity', 'nps', 'ppf', 'fd ', 'fixed deposit', 'bonds', 'crypto', 'etf', 'gold', 'sgb'];

const CATEGORY_KEYWORDS: Record<SmsTrackingCategory, string[]> = {
  Food: FOOD,
  Shopping: SHOPPING,
  Transport: TRANSPORT,
  Travel: TRAVEL,
  Bills: BILLS,
  Entertainment: ENTERTAINMENT,
  Education: EDUCATION,
  Healthcare: HEALTHCARE,
  Investment: INVESTMENT,
  Others: [],
};

export function categorizeMerchant(merchant: string): SmsTrackingCategory {
  const lower = merchant.toLowerCase();

  if (lower.includes('salary')) return 'Others';
  if (lower.includes('rent') || lower.includes('maintenance')) return 'Bills';

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [SmsTrackingCategory, string[]][]) {
    if (category === 'Others') continue;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return category;
    }
  }

  return 'Others';
}