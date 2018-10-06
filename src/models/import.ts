'use strict';

import { Position } from 'vscode';

export interface Import {
  statement: string;
  from: string;
  type: Type;
  startPosition: Position;
  endPosition: Position;
}

export enum Type {
  LIBRARY,
  BACKWARDS,
  CURRENT,
  FORWARD,
}
