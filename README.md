# ES6 and TypeScript import sorter (BETA)

An opinionated ES6 and TypeScript import sorter.

## Features

Sort import statements:
- by invoking `VSCode`'s [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) and searching for `Sort imports` command.
- on save, by enabling `Es6tssort: Sort On Save` setting
- by using CLI (i.e. on the CI). Type `./node_modules/.bin/import-sorter --help` in terminal to see the list of all available options. Example usage: `./node_modules/.bin/import-sorter --directory path/to/recursevly/sort/imports/in --dry-run`

![Example of sorting imports](images/example.gif)

## Known Issues

No known issues.

## Future plans

* Read configuration from `eslint.json` and `tslint.json` file
* Sort the importing modules as part of the import statement itself
* CLI documentation

For a full list of planned features, see the [library repo](https://github.com/znikola/es6-typescript-import-sorter)

## Release Notes

See [CHANGELOG.md](https://github.com/znikola/vscode-es6-typescript-import-sorter/blob/master/CHANGELOG.md)

## Contributing

See [CONTRIBUTING.md](https://github.com/znikola/vscode-es6-typescript-import-sorter/blob/master/CONTRIBUTING.md)