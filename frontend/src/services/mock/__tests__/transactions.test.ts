import AsyncStorage from '@react-native-async-storage/async-storage';
import { addTransaction, deleteTransaction, getTransactionById, getTransactions, updateTransaction } from '../transactions';

jest.mock('../../config', () => ({
  USE_MOCK: true,
}));

const STORAGE_KEY = 'finance-advisor-transactions';

beforeEach(async () => {
  jest.useFakeTimers();
  await AsyncStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

async function settle() {
  await jest.advanceTimersByTimeAsync(2000);
}

it('reads and writes from the same localStorage-backed store', async () => {
  const read = getTransactions();
  await settle();
  const seeded = await read;
  expect(seeded.length).toBeGreaterThan(0);

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  expect(raw).not.toBeNull();
  const byId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);
  expect((JSON.parse(raw as string) as { id: string }[]).sort(byId)).toEqual([...seeded].sort(byId));
});

it('add transaction is visible to every subsequent read', async () => {
  const before = await (async () => {
    const p = getTransactions();
    await settle();
    return p;
  })();

  const added = await (async () => {
    const p = addTransaction({
      date: '2026-08-20',
      amount: -150,
      category: 'Food & Drink',
      merchant: 'Test Cafe',
      account: 'Cash',
      paymentMethod: 'cash',
    });
    await settle();
    return p;
  })();

  const list = await (async () => {
    const p = getTransactions();
    await settle();
    return p;
  })();

  expect(list).toHaveLength(before.length + 1);
  expect(list.find((t) => t.id === added.id)).toMatchObject({ merchant: 'Test Cafe', amount: -150 });

  const byId = await (async () => {
    const p = getTransactionById(added.id);
    await settle();
    return p;
  })();
  expect(byId?.merchant).toBe('Test Cafe');
});

it('update and delete are reflected in the shared store', async () => {
  const seeded = await (async () => {
    const p = getTransactions();
    await settle();
    return p;
  })();
  const target = seeded[0];

  const upd = updateTransaction(target.id, { amount: -999, merchant: 'Renamed' });
  await settle();
  await upd;

  const afterUpdate = await (async () => {
    const p = getTransactions();
    await settle();
    return p;
  })();
  expect(afterUpdate.find((t) => t.id === target.id)).toMatchObject({ amount: -999, merchant: 'Renamed' });

  const del = deleteTransaction(target.id);
  await settle();
  await del;

  const afterDelete = await (async () => {
    const p = getTransactions();
    await settle();
    return p;
  })();
  expect(afterDelete.find((t) => t.id === target.id)).toBeUndefined();
  expect(afterDelete).toHaveLength(seeded.length - 1);
});
