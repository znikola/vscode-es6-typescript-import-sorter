'use strict';

import { validString } from './validation';
import { Type } from './models/import';

export const FOLDER_PATH = '../';

const PATH_SEPARATOR_REGEX = /\//g;

export function isLastIteration<T>(i: number, anArray: Array<T>): boolean {
  return i === anArray.length - 1;
}

export function isLibrary(from: string): boolean {
  if (!validString(from)) {
    return false;
  }

  return startsWithAT(from) || !isRelativePath(from);
}

// TODO: maybe there's no need for some functions to be here?

// TODO: is it 'statement' or 'from'?
export function normalizePath(statement: string): string {
  if (!validString(statement)) {
    return statement;
  }

  if (isFirstCharacter(statement, '.') && statement.charAt(1) === '/') {
    return statement.slice(2);
  }
  return statement;
}

export function isBackwardsPath(from: string): boolean {
  if (!validString(from)) {
    return false;
  }

  return from.startsWith(FOLDER_PATH);
}

export function isForwardPath(statement: string): boolean {
  if (!validString) {
    return false;
  }

  return !isBackwardsPath(statement) && !isCurrentPath(statement);
}

export function isCurrentPath(from: string): boolean {
  if (!validString(from)) {
    return false;
  }

  return determineForwardHierarchyLevel(from) === 0;
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

export function startsWithAT(from: string): boolean {
  if (!validString(from)) {
    return false;
  }

  return isFirstCharacter(from, '@');
}

export function determineType(_from: string): Type {
  let from = _from;
  if (isLibrary(from)) {
    return Type.LIBRARY;
  }

  from = normalizePath(from);

  if (isCurrentPath(from)) {
    return Type.CURRENT;
  }
  if (isForwardPath(from)) {
    return Type.FORWARD;
  }
  if (isBackwardsPath(from)) {
    return Type.BACKWARDS;
  }

  // TODO: error handling
  throw new Error(`From not recognized: ${from}`);
}

function isRelativePath(from: string): boolean {
  if (!validString(from)) {
    return false;
  }

  return isFirstCharacter(from, '.') || isFirstCharacter(from, '/');
}

function isFirstCharacter(str: string, char: string): boolean {
  if (!validString(str) || !validString(char)) {
    return false;
  }

  return str.charAt(0) === char;
}
