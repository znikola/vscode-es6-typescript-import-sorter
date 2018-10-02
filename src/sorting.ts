'use strict';

import { validArray, validString } from './validation';
import { Import } from './models/import';
import {
  determineForwardHierarchyLevel,
  normalizePath,
  isBackwardsPath,
  isCurrentPath,
  startsWithAT,
  isLibrary,
} from './util';

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

export function sort(imports: Import[]): Import[] {
  if (!validArray(imports)) {
    return [];
  }

  let { backwardsImports, forwardImports, currentImports, libraries } = filterImports(imports);

  backwardsImports = backwardsImports.sort((i1, i2) => {
    const first = i1.from;
    const second = i2.from;
    return handleBackwardsPath(first, second);
  });

  forwardImports = forwardImports.sort((i1, i2) => {
    const first = i1.from;
    const second = i2.from;
    return handleForwardPath(first, second);
  });

  currentImports = currentImports.sort((i1, i2) => {
    const first = i1.from;
    const second = i2.from;
    return handleCurrentPath(first, second);
  });

  libraries = libraries.sort((i1, i2) => {
    const first = i1.from;
    const second = i2.from;

    return handleLibraries(first, second);
  });

  return [...libraries, ...backwardsImports, ...currentImports, ...forwardImports];
}

function filterImports(
  imports: Import[]
): { backwardsImports: Import[]; forwardImports: Import[]; currentImports: Import[]; libraries: Import[] } {
  let backwardsImports: Import[] = [];
  let forwardImports: Import[] = [];
  let currentImports: Import[] = [];
  let libraries: Import[] = [];

  imports.forEach((anImport: Import) => {
    let from = anImport.from;

    if (!isLibrary(from)) {
      from = normalizePath(from);

      if (isCurrentPath(from)) {
        currentImports.push(anImport);
      } else if (isForwardPath(from)) {
        forwardImports.push(anImport);
      } else if (isBackwardsPath(from)) {
        backwardsImports.push(anImport);
      }
    } else {
      libraries.push(anImport);
    }
  });

  return {
    backwardsImports,
    forwardImports,
    currentImports,
    libraries,
  };
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

function handleBackwardsPath(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  first = normalizePath(first);
  second = normalizePath(second);

  if (isForwardPath(second)) {
    return FIRST_BEFORE_SECOND;
  }
  if (isCurrentPath(second)) {
    return FIRST_AFTER_SECOND;
  }
  if (isBackwardsPath(second)) {
    return handleBothBackwardsPaths(first, second);
  }

  // TODO: this should never happen
  return INVALID_OR_ERROR;
}

function handleCurrentPath(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  first = normalizePath(first);
  second = normalizePath(second);

  if (isBackwardsPath(second)) {
    return FIRST_AFTER_SECOND;
  }
  if (isForwardPath(second)) {
    return FIRST_BEFORE_SECOND;
  }
  if (isCurrentPath(second)) {
    return handleBothCurrentPaths(first, second);
  }

  // TODO: this should never happen
  return INVALID_OR_ERROR;
}

function handleForwardPath(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  first = normalizePath(first);
  second = normalizePath(second);

  if (isBackwardsPath(second) || isCurrentPath(second)) {
    return FIRST_AFTER_SECOND;
  }
  if (isForwardPath(second)) {
    return handleBothForwardPaths(first, second);
  }

  // TODO: this should never happen
  return INVALID_OR_ERROR;
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

function handleBothForwardPaths(first: string, second: string): number {
  if (!validString(first) || !validString(second)) {
    return INVALID_OR_ERROR;
  }

  const levelFirst = determineForwardHierarchyLevel(first);
  const levelSecond = determineForwardHierarchyLevel(second);

  if (levelFirst === levelSecond) {
    return sortAlphabetically(first, second);
  }

  if (levelFirst < levelSecond) {
    return FIRST_BEFORE_SECOND;
  }

  return FIRST_AFTER_SECOND;
}

function isForwardPath(statement: string): boolean {
  if (!validString) {
    return false;
  }

  return !isBackwardsPath(statement) && !isCurrentPath(statement);
}
