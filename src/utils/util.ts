'use strict';

export function isLastIteration<T>(i: number, anArray: Array<T>): boolean {
  return i === anArray.length - 1;
}
