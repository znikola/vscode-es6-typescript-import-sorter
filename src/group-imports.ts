'use strict';

import { Import } from './models/import';
import { ImportGroup } from './models/import-group';
import { isLibrary, isBackwardsPath, normalizePath, isCurrentPath, isLastIteration } from './util';

enum Type {
  LIBRARY,
  BACKWARDS,
  CURRENT,
  FORWARD,
}

interface PreviousElement {
  from: string;
  type: Type | null;
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

  let lastElement: PreviousElement = { from: '', type: null };

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
          Type.BACKWARDS,
          from
        ));
      } else if (isCurrentPath(from)) {
        ({ lastElement, importGroups, currentImports } = handleRelativeImports(
          { lastElement, element },
          { importGroups, currentImports },
          Type.CURRENT,
          from
        ));
      } else {
        ({ lastElement, importGroups, currentImports } = handleRelativeImports(
          { lastElement, element },
          { importGroups, currentImports },
          Type.FORWARD,
          from
        ));
      }
    }

    if (isLastIteration(index, imports)) {
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
    previousAndCurrentImport.lastElement.type === null
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
    lastElement: { from, type: Type.LIBRARY },
    importGroups: imports.importGroups,
    currentImports: imports.currentImports,
  };
}

function handleRelativeImports(
  previousAndCurrentImport: PreviousAndCurrentImport,
  imports: ImportGroupAndCurrentImport,
  type: Type,
  from: string
): { lastElement: PreviousElement; importGroups: ImportGroup[]; currentImports: Import[] } {
  if (previousAndCurrentImport.lastElement.type !== type) {
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
    lastElement: { from, type },
    importGroups: imports.importGroups,
    currentImports: imports.currentImports,
  };
}

function getRootFrom(from: string): string {
  return from.split('/')[0];
}
