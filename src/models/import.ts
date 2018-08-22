export interface Import {
  statement: string;
  lineRange: LineRange;
}

export interface LineRange {
  startLine: number;
  endLine: number;
}
