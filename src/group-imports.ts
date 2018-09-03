import { Import } from './models/import';

export function groupImports(imports: Import[]): Import[] {
  let last: string;

  for (let i = 0; i < imports.length; i++) {
    const statement = imports[i].from;
    const current = statement.split('/');

    if (last) {
      if (last !== current[0]) {
        imports[i - 1].statement = imports[i - 1].statement.concat('\n');
      }
    }
    last = current[0];
  }
  return imports;
}
