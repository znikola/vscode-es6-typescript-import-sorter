import { Import } from './models/import';

export function groupImports(imports: Import[]): Import[] {
  let last: string;
  const reg = /([a-zA-Z-@_]+)/;

  for (let i = 0; i < imports.length; i++) {
    const statement = imports[i].statement.split('from');
    const current = reg.exec(statement[statement.length - 1]);

    if (last) {
      if (last !== current[0]) {
        imports[i - 1].statement = imports[i - 1].statement.concat('\n');
      }
    }
    last = current[0];
  }
  return imports;
}
