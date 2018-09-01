import { validArray, validString } from './validation';
import { Import } from './models/import';
import { debug } from './logging';

const FIRST_AFTER_SECOND = 1;
const FIRST_BEFORE_SECOND = -1;
const FIRST_EQUALS_SECOND = 0;

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
    debug(`info::starting with`, first, second);

    if (isLibrary(first) || isLibrary(second)) {
      return handleLibraries(first, second);
    }

    return handleLocal(first, second);
  });
}

function handleLibraries(first: string, second: string): number {
  // TODO validate arguments?

  debug(`determined::first and/or second are libraries`, first, second);

  if (isLibrary(first) && !isLibrary(second)) {
    debug(`sorting::first is a library, second is NOT`, first, second);
    return FIRST_BEFORE_SECOND;
  }
  if (!isLibrary(first) && isLibrary(second)) {
    debug(`sorting::first is NOT a library, second is`, first, second);
    return FIRST_AFTER_SECOND;
  }
  debug(`determined::first AND second are libraries`, first, second);

  // if 'first' or 'second' start with '@', sort those before the rest
  if (startsWithAT(first) || startsWithAT(second)) {
    debug(`determined::first and/or second are libraries that begin with '@'`, first, second);
    if (startsWithAT(first) && startsWithAT(second)) {
      debug(`sorting::both first and second begin with '@'`, first, second);
      return sortAT(first, second);
    }
    if (startsWithAT(first)) {
      debug(`sorting::only first starts with '@', the second doesn't`, first, second);
      return FIRST_BEFORE_SECOND;
    }
    if (startsWithAT(second)) {
      debug(`sorting::only second starts with '@', the second doesn't`, first, second);
      return FIRST_AFTER_SECOND;
    }
    // fallback, we should never get here.
    debug(`sorting::this is a fallback, we should never be here!`, first, second);
    return FIRST_EQUALS_SECOND;
  }

  // at this point we know that 'first' and 'second' are libraries that DON'T start with '@'
  // TODO calling 'sortLibraries' twice here
  debug(`sorting::'${first}' and '${second}' by`, sortLibraries(first, second));
  return sortLibraries(first, second);
}

function sortAT(first: string, second: string): number {
  // TODO validate arguments?

  if (first.charAt(1) < second.charAt(1)) {
    return FIRST_BEFORE_SECOND;
  } else if (first.charAt(1) > second.charAt(1)) {
    return FIRST_AFTER_SECOND;
  } else {
    return FIRST_EQUALS_SECOND;
  }
}

function startsWithAT(statement: string): boolean {
  if (validString(statement)) {
    return statement.charAt(0) === '@';
  }
  return false;
}

function isRelativePath(statement: string): boolean {
  if (validString(statement)) {
    // TODO do we even have to check for '/'? Maybe '.' is enough?
    // TODO, if we get rid of the second check, we can merge this function with 'startsWithAT' and make it generic
    return statement.charAt(0) === '.' || statement.charAt(0) === '/';
  }

  return false;
}

function isLibrary(statement: string): boolean {
  if (validString(statement)) {
    return startsWithAT(statement) || !isRelativePath(statement);
  }

  return false;
}

function sortLibraries(first: string, second: string): number {
  // TODO validate arguments?

  if (first.length > second.length) {
    return FIRST_AFTER_SECOND;
  }
  if (second.length < first.length) {
    return FIRST_BEFORE_SECOND;
  }
  return FIRST_EQUALS_SECOND;
}

function handleLocal(first: string, second: string): number {
  // TODO validate arguments?

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
  return FIRST_EQUALS_SECOND;

  // 1. if both backwards:
  // 2. if both on the same bakwards hierarchy level
  // 2.1 sort alphabetically
  // 2.2 else, sort the shorter one first

  // the algo is the same for the current and upwards hierarchy level
}

function normalizePath(statement: string): string {
  // TODO validate argument?
  if (statement.charAt(0) === '.' && statement.charAt(1) === '/') {
    return statement.slice(2);
  }
  return statement;
}

function isBackwardsPath(statement: string): boolean {
  if (validString(statement)) {
    return statement.startsWith(FOLDER_PATH);
  }

  return false;
}

function isUpwardsPath(statement: string): boolean {
  return validString(statement) && !isBackwardsPath(statement) && !isCurrentPath(statement);
}

function isCurrentPath(statement: string): boolean {
  if (validString(statement)) {
    return determineUpwardsHierarchyLevel(statement) === 0;
  }

  return false;
}

// TODO convert first to lowercase, so that we have a case-insensitive sorting?
function sortAlphabetically(first: string, second: string): number {
  // TODO validate arguments?
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
  // TODO validate arguments?

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
  // TODO in all previous functions we aren't negating the 'validString' check, but is different
  if (!validString(statement)) {
    // TODO what to do in this case?
    return -1;
  }

  const regexResult = statement.match(FOLDER_PATH_REGEX);
  if (regexResult) {
    return regexResult.length;
  }

  return 0;
}

function handleBothCurrentPaths(first: string, second: string): number {
  // TODO validate arguments?
  return sortAlphabetically(first, second);
}

function handleBothUpwardsPaths(first: string, second: string): number {
  // TODO validate arguments?

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
  // TODO validate arguments?

  const match = statement.match(PATH_SEPARATOR_REGEX);
  if (match) {
    return match.length;
  }

  return 0;
}
