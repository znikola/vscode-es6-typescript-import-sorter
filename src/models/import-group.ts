'use strict';

import { Position } from 'vscode';

import { Import } from './import';

export interface ImportGroup {
  imports: Import[];
  blankLinePostion: Position;
}
