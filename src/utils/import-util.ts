'use strict';

import { Type } from '../models/import';

import { validString } from './validation';

export const FOLDER_PATH = '../';

const PATH_SEPARATOR_REGEX = /\//g;

export function isLibrary(from: string): boolean {
  if (!validString(from)) {
    return false;
  }

  return startsWithAT(from) || !isRelativePath(from);
}

export function normalizePath(from: string): string {
  if (!validString(from)) {
    return from;
  }

  if (isFirstCharacter(from, '.') && from.charAt(1) === '/') {
    return from.slice(2);
  }
  return from;
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
