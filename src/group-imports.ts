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

export function groupImports(imports: Import[]): ImportGroup[] {
  const importGroups: ImportGroup[] = [];
  let currentImports: Import[] = [];
  let lastElement: PreviousElement = { from: '', direction: null };
  let lastStepCount = -1;
  imports.forEach((element, index) => {
    let from = element.from;

    if (isLibrary(from)) {
      if (getRootFrom(lastElement.from) === getRootFrom(from) || lastElement.direction === null) {
        currentImports.push(element);
      } else {
        importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
        currentImports = [];
        currentImports.push(element);
      }
      lastElement = { from: element.from, direction: Directions.LIBRARY };
    } else {
      from = normalizePath(from);

      if (isBackwardsPath(from)) {
        if (lastStepCount === getBackwardsStepCount(from)) {
          currentImports.push(element);
        } else {
          importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
          currentImports = [];
          currentImports.push(element);
        }
        lastStepCount = getBackwardsStepCount(from);
        lastElement = { from, direction: Directions.BACK };
      } else if (isCurrentPath(from)) {
        if (lastElement.direction !== Directions.CURRENT) {
          importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
          currentImports = [];
          currentImports.push(element);
        } else {
          currentImports.push(element);
        }
        lastElement = { from, direction: Directions.CURRENT };
      } else {
        if (lastElement.direction !== Directions.FORWARD) {
          importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
          currentImports = [];
          currentImports.push(element);
        } else {
          currentImports.push(element);
        }
        lastElement = { from, direction: Directions.FORWARD };
      }
    }

    if (index === imports.length - 1) {
      importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
    }
  });

  return importGroups;
}

function getRootFrom(from: string): string {
  return from.split('/')[0];
}

function getBackwardsStepCount(from: string): number {
  return from.split('../').length;
}
