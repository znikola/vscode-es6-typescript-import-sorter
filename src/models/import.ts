'use strict';

import { Position } from 'vscode';

export interface Import {
  statement: string;
  from: string;
  type: Type | null;
  startPosition: Position;
  endPosition: Position;
}

export enum Type {
  LIBRARY = 1,
  BACKWARDS,
  CURRENT,
  FORWARD,
}
