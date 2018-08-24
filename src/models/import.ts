import { Position } from 'vscode';

export interface Import {
  statement: string;
  startPosition: Position;
  endPosition: Position;
}
