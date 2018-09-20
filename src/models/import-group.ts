'use strict';

import { Import } from './import';
import { Position } from 'vscode';

export interface ImportGroup {
  imports: Import[];
  blankLinePostion: Position;
}
