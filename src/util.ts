'use strict';

import { validString } from './validation';

const FOLDER_PATH = '../';
const PATH_SEPARATOR_REGEX = /\//g;

export function isLastIteration<T>(i: number, anArray: Array<T>): boolean {
  return i === anArray.length - 1;
}

export function isLibrary(statement: string): boolean {
  if (!validString(statement)) {
    return false;
  }

  return startsWithAT(statement) || !isRelativePath(statement);
}

export function normalizePath(statement: string): string {
  if (!validString(statement)) {
    return statement;
  }

  if (isFirstCharacter(statement, '.') && statement.charAt(1) === '/') {
    return statement.slice(2);
  }
  return statement;
}

export function isBackwardsPath(statement: string): boolean {
  if (!validString(statement)) {
    return false;
  }

  return statement.startsWith(FOLDER_PATH);
}

export function isCurrentPath(statement: string): boolean {
  if (!validString(statement)) {
    return false;
  }

  return determineForwardHierarchyLevel(statement) === 0;
}

export function determineForwardHierarchyLevel(statement: string): number {
  if (!validString(statement)) {
    return -1;
  }

  const match = statement.match(PATH_SEPARATOR_REGEX);
  if (match) {
    return match.length;
  }

  return 0;
}

export function startsWithAT(statement: string): boolean {
  if (!validString(statement)) {
    return false;
  }

  return isFirstCharacter(statement, '@');
}

function isRelativePath(statement: string): boolean {
  if (!validString(statement)) {
    return false;
  }

  return isFirstCharacter(statement, '.') || isFirstCharacter(statement, '/');
}

function isFirstCharacter(statement: string, char: string): boolean {
  if (!validString(statement) || !validString(char)) {
    return false;
  }

  return statement.charAt(0) === char;
}
