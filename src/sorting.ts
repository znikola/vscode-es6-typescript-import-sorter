import { validArray, validString } from './validation';
import { Import } from './models/import';
import { debug } from './logging';

const FIRST_AFTER_SECOND = 1;
const FIRST_BEFORE_SECOND = -1;
const FIRST_EQUALS_SECOND = 0;

export function sort(imports: Import[]): Import[] {
  if (!validArray(imports)) {
    return [];
  }

  return imports.sort((i1, i2) => {
    const first = i1.from;
    const second = i2.from;
    debug(`info::starting with`, first, second);

    if (isLibrary(first) || isLibrary(second)) {
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

    // at this point, we know we are dealing with relative imports
    debug(`sorting::fallback equal sorting`, first, second);
    return FIRST_EQUALS_SECOND;
  });
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
