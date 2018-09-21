'use strict';

export function isLastIteration<T>(i: number, anArray: Array<T>): boolean {
  return i === anArray.length - 1;
}

export function isNotLastIteration<T>(i: number, anArray: Array<T>): boolean {
  return !isLastIteration(i, anArray);
}
