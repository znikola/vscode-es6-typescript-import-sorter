'use strict';

import { Import } from './models/import';
import { ImportGroup } from './models/import-group';
import { isLibrary, isBackwardsPath, normalizePath, isCurrentPath } from './util';

enum Directions {
  LIBRARY,
  BACK,
  CURRENT,
  FORWARD,
}

interface PreviousElement {
  from: string;
  direction: Directions | null;
}

let importGroups: ImportGroup[];
let currentImports: Import[];

export function groupImports(imports: Import[]): ImportGroup[] {
  importGroups = [];
  currentImports = [];
  let lastElement: PreviousElement = { from: '', direction: null };

  imports.forEach((element, index) => {
    let from = element.from;

    if (isLibrary(from)) {
      lastElement = handleLibraries(lastElement, element, from);
    } else {
      from = normalizePath(from);

      if (isBackwardsPath(from)) {
        lastElement = handleRelativeImports(lastElement, element, Directions.BACK, from);
      } else if (isCurrentPath(from)) {
        lastElement = handleRelativeImports(lastElement, element, Directions.CURRENT, from);
      } else {
        lastElement = handleRelativeImports(lastElement, element, Directions.FORWARD, from);
      }
    }

    if (index === imports.length - 1) {
      importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
    }
  });

  return importGroups;
}

function handleLibraries(lastElement: PreviousElement, element: Import, from: string): PreviousElement {
  if (getRootFrom(lastElement.from) === getRootFrom(from) || lastElement.direction === null) {
    currentImports.push(element);
  } else {
    importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
    currentImports = [];
    currentImports.push(element);
  }
  return { from, direction: Directions.LIBRARY };
}

function handleRelativeImports(
  lastElement: PreviousElement,
  element: Import,
  direction: Directions,
  from: string
): PreviousElement {
  if (lastElement.direction !== direction) {
    importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
    currentImports = [];
    currentImports.push(element);
  } else {
    currentImports.push(element);
  }
  return { from, direction };
}

function getRootFrom(from: string): string {
  return from.split('/')[0];
}
