import { validateArray } from './validation';
import { Import } from './models/import';

export function sort(imports: Import[]): Import[] {
  if (!validateArray(imports)) {
    return [];
  }

  return imports.sort((i1, i2) => {
    const first = i1.from;
    const second = i2.from;

    if (startsWithAT(first) && startsWithAT(second)) {
      return sortAT(first, second);
    }

    return 0;
  });
}

function startsWithAT(statement: string): boolean {
  if (statement) {
    return statement.charAt(0) === '@';
  }
  return false;
}

function sortAT(first: string, second: string): number {
  if (first.charAt(1) < second.charAt(1)) {
    return -1;
  } else if (first.charAt(1) > second.charAt(1)) {
    return 1;
  } else {
    return 0;
  }
}
