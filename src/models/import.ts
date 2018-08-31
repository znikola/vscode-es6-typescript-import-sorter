import { Position } from 'vscode';

export interface Import {
  statement: string;
  from: string;
  startPosition: Position;
  endPosition: Position;
}
