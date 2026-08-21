export function delay<T>(value: T, ms: number = 400 + Math.random() * 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
