export function validateArray(array: Array<any>): boolean {
  return Array.isArray(array) && array.length !== 0;
}

export function validateString(str: string): boolean {
  return Boolean(str);
}
