import { AppNotification } from '../../types';
import { delay } from './delay';

let notifications: AppNotification[] = [
  { id: 'notif_001', type: 'unusual_transaction', title: 'Unusual charge detected', message: 'A ₹340 charge at Amazon is much larger than your typical purchase.', createdAt: '2026-07-05T09:05:00Z', read: false },
  { id: 'notif_002', type: 'overspend', title: 'Shopping budget exceeded', message: "You've spent ₹340.50 of your ₹300 Shopping budget this month.", createdAt: '2026-06-29T16:40:00Z', read: false },
  { id: 'notif_003', type: 'bill_due', title: 'Rent due in 3 days', message: 'Your ₹2,400 rent payment to Parkview Rentals LLC is due Jul 1.', createdAt: '2026-06-28T08:00:00Z', read: false },
  { id: 'notif_004', type: 'goal_milestone', title: 'Almost there!', message: 'New Car Down Payment is 97.5% funded — just ₹200 to go.', createdAt: '2026-06-27T10:15:00Z', read: true },
  { id: 'notif_005', type: 'weekly_digest', title: 'Your weekly digest is ready', message: 'You spent ₹1,842 across 18 transactions, 6% less than last week.', createdAt: '2026-07-01T08:00:00Z', read: true },
  { id: 'notif_006', type: 'unusual_transaction', title: 'Spending pace outlier', message: '4 Starbucks charges this week — about 2x your usual pace.', createdAt: '2026-06-21T18:30:00Z', read: true },
  { id: 'notif_007', type: 'bill_due', title: 'Verizon Wireless bill due tomorrow', message: 'Your ₹85.00 Verizon Wireless bill is due Jun 23.', createdAt: '2026-06-22T09:00:00Z', read: true },
  { id: 'notif_008', type: 'goal_milestone', title: 'Emergency Fund milestone', message: "You've crossed 60% of your Emergency Fund goal.", createdAt: '2026-06-10T12:00:00Z', read: true },
];

export function getNotifications(): Promise<AppNotification[]> {
  return delay([...notifications].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
}

export function markNotificationRead(id: string): Promise<{ success: true }> {
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx >= 0) notifications[idx] = { ...notifications[idx], read: true };
  return delay({ success: true }, 150);
}

export function markAllNotificationsRead(): Promise<{ success: true }> {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  return delay({ success: true }, 150);
}

export function clearAllNotifications(): Promise<{ success: true }> {
  notifications = [];
  return delay({ success: true }, 150);
}
