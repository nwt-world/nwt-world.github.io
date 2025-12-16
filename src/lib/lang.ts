export function getLangFromId(id: string): string {
  const name = id.split('/').pop()!;
  const parts = name.split('_');
  return parts[1] ?? 'en';
}
