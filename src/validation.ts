export function validArray(array: Array<any>): boolean {
  return Array.isArray(array) && array.length !== 0;
}

export function validString(str: string): boolean {
  return Boolean(str);
}
