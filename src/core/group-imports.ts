'use strict';

import { Import, Type } from '../models/import';
import { ImportGroup } from '../models/import-group';
import { isLastIteration } from '../utils/util';

interface PreviousAndCurrentImport {
  previous: Import;
  current: Import;
}

interface ImportGroupAndCurrentImports {
  importGroups: ImportGroup[];
  currentImports: Import[];
}

export function groupImports(imports: Import[]): ImportGroup[] {
  let importGroups: ImportGroup[] = [];
  let currentImports: Import[] = [];

  let previous: Import = <Import>{ from: '' };

  imports.forEach((current: Import, index: number) => {
    const type = current.type;
    if (type === Type.LIBRARY) {
      ({ previous, importGroups, currentImports } = handleLibraries(
        { previous, current },
        { importGroups, currentImports }
      ));
    } else {
      ({ previous, importGroups, currentImports } = handleRelativeImports(
        { previous, current },
        { importGroups, currentImports },
        type
      ));
    }

    if (isLastIteration(index, imports)) {
      importGroups.push({ imports: currentImports, blankLinePostion: current.endPosition });
    }
  });

  return importGroups;
}

function handleLibraries(
  previousAndCurrentImport: PreviousAndCurrentImport,
  imports: ImportGroupAndCurrentImports
): { previous: Import; importGroups: ImportGroup[]; currentImports: Import[] } {
  const from = previousAndCurrentImport.current.from;

  if (
    getRootFrom(previousAndCurrentImport.previous.from) === getRootFrom(from) ||
    previousAndCurrentImport.previous.type === null
  ) {
    imports.currentImports.push(previousAndCurrentImport.current);
  } else {
    imports.importGroups.push({
      imports: imports.currentImports,
      blankLinePostion: previousAndCurrentImport.current.endPosition,
    });
    imports.currentImports = [];
    imports.currentImports.push(previousAndCurrentImport.current);
  }
  return {
    previous: <Import>{ from, type: Type.LIBRARY },
    importGroups: imports.importGroups,
    currentImports: imports.currentImports,
  };
}

function handleRelativeImports(
  previousAndCurrentImport: PreviousAndCurrentImport,
  imports: ImportGroupAndCurrentImports,
  type: Type
): { previous: Import; importGroups: ImportGroup[]; currentImports: Import[] } {
  if (previousAndCurrentImport.previous.type !== type) {
    imports.importGroups.push({
      imports: imports.currentImports,
      blankLinePostion: previousAndCurrentImport.current.endPosition,
    });
    imports.currentImports = [];
    imports.currentImports.push(previousAndCurrentImport.current);
  } else {
    imports.currentImports.push(previousAndCurrentImport.current);
  }
  return {
    previous: <Import>{ from: previousAndCurrentImport.current.from, type },
    importGroups: imports.importGroups,
    currentImports: imports.currentImports,
  };
}

function getRootFrom(from: string): string {
  return from.split('/')[0];
}
