'use strict';

import { validArray, validString } from './validation';
import { Import } from './models/import';

/** used for Array.sort */
const FIRST_AFTER_SECOND = 1;
/** used for Array.sort */
const FIRST_BEFORE_SECOND = -1;
/** used for Array.sort */
const FIRST_EQUALS_SECOND = 0;
/** this has the same value as FIRST_EQUALS_SECOND, but it brings more semantic when reading the algorithm */
const INVALID_OR_ERROR = 0;

const FOLDER_PATH = '../';
const FOLDER_PATH_REGEX = new RegExp(FOLDER_PATH, 'g');

// the regex is matching '/'
const PATH_SEPARATOR_REGEX = /\//g;

export function sort(imports: Import[]): Import[] {
  if (!validArray(imports)) {
    return [];
  }

  return imports.sort((i1, i2) => {
    const first = i1.from;
    const second = i2.from;

    if (isLibrary(first) || isLibrary(second)) {
      return handleLibraries(first, second);
    }

    return handleLocals(first, second);
  });
}

function handleLibraries(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  if (isLibrary(first) && !isLibrary(second)) {
    return FIRST_BEFORE_SECOND;
  }

  if (!isLibrary(first) && isLibrary(second)) {
    return FIRST_AFTER_SECOND;
  }

  // if 'first' and/or 'second' start with '@', sort them before the rest
  if (startsWithAT(first) || startsWithAT(second)) {
    if (startsWithAT(first) && startsWithAT(second)) {
      return sortAT(first, second);
    }

    if (startsWithAT(first)) {
      return FIRST_BEFORE_SECOND;
    }

    if (startsWithAT(second)) {
      return FIRST_AFTER_SECOND;
    }

    // fallback, we should never get here.
    return FIRST_EQUALS_SECOND;
  }

  // at this point we know that 'first' and 'second' are libraries that DON'T start with '@'
  return sortLibraries(first, second);
}

function sortAT(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  if (first.charAt(1) < second.charAt(1)) {
    return FIRST_BEFORE_SECOND;
  }

  if (first.charAt(1) > second.charAt(1)) {
    return FIRST_AFTER_SECOND;
  }

  return FIRST_EQUALS_SECOND;
}

function startsWithAT(statement: string): boolean {
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

function isLibrary(statement: string): boolean {
  if (!validString(statement)) {
    return false;
  }

  return startsWithAT(statement) || !isRelativePath(statement);
}

function sortLibraries(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  if (first.length > second.length) {
    return FIRST_AFTER_SECOND;
  }

  if (second.length < first.length) {
    return FIRST_BEFORE_SECOND;
  }

  return FIRST_EQUALS_SECOND;
}

function handleLocals(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  first = normalizePath(first);
  second = normalizePath(second);

  if (isBackwardsPath(first)) {
    if (isUpwardsPath(second)) {
      return FIRST_BEFORE_SECOND;
    }
    if (isCurrentPath(second)) {
      return FIRST_AFTER_SECOND;
    }
    if (isBackwardsPath(second)) {
      return handleBothBackwardsPaths(first, second);
    }
  }

  if (isCurrentPath(first)) {
    if (isBackwardsPath(second)) {
      return FIRST_AFTER_SECOND;
    }
    if (isUpwardsPath(second)) {
      return FIRST_BEFORE_SECOND;
    }
    if (isCurrentPath(second)) {
      return handleBothCurrentPaths(first, second);
    }
  }

  if (isUpwardsPath(first)) {
    if (isBackwardsPath(second) || isCurrentPath(second)) {
      return FIRST_AFTER_SECOND;
    }
    if (isUpwardsPath(second)) {
      return handleBothUpwardsPaths(first, second);
    }
  }

  // TODO: this should never happen
  return INVALID_OR_ERROR;
}

function normalizePath(statement: string): string {
  if (!validString(statement)) {
    return statement;
  }

  if (isFirstCharacter(statement, '.') && statement.charAt(1) === '/') {
    return statement.slice(2);
  }
  return statement;
}

function isBackwardsPath(statement: string): boolean {
  if (!validString(statement)) {
    return false;
  }

  return statement.startsWith(FOLDER_PATH);
}

function isUpwardsPath(statement: string): boolean {
  if (!validString) {
    return false;
  }

  return !isBackwardsPath(statement) && !isCurrentPath(statement);
}

function isCurrentPath(statement: string): boolean {
  if (!validString(statement)) {
    return false;
  }

  return determineUpwardsHierarchyLevel(statement) === 0;
}

// TODO convert first to lowercase, so that we have a case-insensitive sorting?
function sortAlphabetically(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  if (first < second) {
    // ascending
    return FIRST_BEFORE_SECOND;
  }

  if (first > second) {
    // descending
    return FIRST_AFTER_SECOND;
  }

  return FIRST_EQUALS_SECOND;
}

function handleBothBackwardsPaths(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  const levelFirst = determineBackwardsHierarchyLevel(first);
  const levelSecond = determineBackwardsHierarchyLevel(second);

  if (levelFirst === levelSecond) {
    return sortAlphabetically(first, second);
  }

  if (levelFirst < levelSecond) {
    return FIRST_BEFORE_SECOND;
  }

  return FIRST_AFTER_SECOND;
}

function determineBackwardsHierarchyLevel(statement: string): number {
  if (!validString(statement)) {
    return INVALID_OR_ERROR;
  }

  const regexResult = statement.match(FOLDER_PATH_REGEX);
  if (regexResult) {
    return regexResult.length;
  }

  return 0;
}

function handleBothCurrentPaths(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  return sortAlphabetically(first, second);
}

function handleBothUpwardsPaths(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  const levelFirst = determineUpwardsHierarchyLevel(first);
  const levelSecond = determineUpwardsHierarchyLevel(second);

  if (levelFirst === levelSecond) {
    return sortAlphabetically(first, second);
  }

  if (levelFirst < levelSecond) {
    return FIRST_BEFORE_SECOND;
  }

  return FIRST_AFTER_SECOND;
}

function determineUpwardsHierarchyLevel(statement: string): number {
  if (!validString(statement)) {
    return -1;
  }

  const match = statement.match(PATH_SEPARATOR_REGEX);
  if (match) {
    return match.length;
  }

  return 0;
}
