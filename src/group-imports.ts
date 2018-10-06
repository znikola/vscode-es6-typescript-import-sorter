'use strict';

import { Import } from './models/import';
import { ImportGroup } from './models/import-group';
import { isLibrary, isBackwardsPath, normalizePath, isCurrentPath } from './util';

enum Directions {
  LIBRARY,
  BACKWARDS,
  CURRENT,
  FORWARD,
}

interface PreviousElement {
  from: string;
  direction: Directions | null;
}

interface PreviousAndCurrentImport {
  lastElement: PreviousElement;
  element: Import;
}

interface ImportGroupAndCurrentImport {
  importGroups: ImportGroup[];
  currentImports: Import[];
}

export function groupImports(imports: Import[]): ImportGroup[] {
  let importGroups: ImportGroup[] = [];
  let currentImports: Import[] = [];

  let lastElement: PreviousElement = { from: '', direction: null };

  imports.forEach((element, index) => {
    let from = element.from;

    if (isLibrary(from)) {
      ({ lastElement, importGroups, currentImports } = handleLibraries(
        { lastElement, element },
        { importGroups, currentImports },
        from
      ));
    } else {
      from = normalizePath(from);

      if (isBackwardsPath(from)) {
        ({ lastElement, importGroups, currentImports } = handleRelativeImports(
          { lastElement, element },
          { importGroups, currentImports },
          Directions.BACKWARDS,
          from
        ));
      } else if (isCurrentPath(from)) {
        ({ lastElement, importGroups, currentImports } = handleRelativeImports(
          { lastElement, element },
          { importGroups, currentImports },
          Directions.CURRENT,
          from
        ));
      } else {
        ({ lastElement, importGroups, currentImports } = handleRelativeImports(
          { lastElement, element },
          { importGroups, currentImports },
          Directions.FORWARD,
          from
        ));
      }
    }

    if (isLastIteration(index, imports.length)) {
      importGroups.push({ imports: currentImports, blankLinePostion: element.endPosition });
    }
  });

  return importGroups;
}

function handleLibraries(
  previousAndCurrentImport: PreviousAndCurrentImport,
  imports: ImportGroupAndCurrentImport,
  from: string
): { lastElement: PreviousElement; importGroups: ImportGroup[]; currentImports: Import[] } {
  if (
    getRootFrom(previousAndCurrentImport.lastElement.from) === getRootFrom(from) ||
    previousAndCurrentImport.lastElement.direction === null
  ) {
    imports.currentImports.push(previousAndCurrentImport.element);
  } else {
    imports.importGroups.push({
      imports: imports.currentImports,
      blankLinePostion: previousAndCurrentImport.element.endPosition,
    });
    imports.currentImports = [];
    imports.currentImports.push(previousAndCurrentImport.element);
  }
  return {
    lastElement: { from, direction: Directions.LIBRARY },
    importGroups: imports.importGroups,
    currentImports: imports.currentImports,
  };
}

function handleRelativeImports(
  previousAndCurrentImport: PreviousAndCurrentImport,
  imports: ImportGroupAndCurrentImport,
  direction: Directions,
  from: string
): { lastElement: PreviousElement; importGroups: ImportGroup[]; currentImports: Import[] } {
  if (previousAndCurrentImport.lastElement.direction !== direction) {
    imports.importGroups.push({
      imports: imports.currentImports,
      blankLinePostion: previousAndCurrentImport.element.endPosition,
    });
    imports.currentImports = [];
    imports.currentImports.push(previousAndCurrentImport.element);
  } else {
    imports.currentImports.push(previousAndCurrentImport.element);
  }
  return {
    lastElement: { from, direction },
    importGroups: imports.importGroups,
    currentImports: imports.currentImports,
  };
}

function getRootFrom(from: string): string {
  return from.split('/')[0];
}

function isLastIteration(index: number, length: number): boolean {
  return index === length - 1;
}
