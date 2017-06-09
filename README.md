# coverbadge
Create a coverage badge without any service provider.

## See it in action

![coverage](badge.svg)

> 💯  Coverage increased (+1.81%) to 100%.

## Installation

```sh
yarn add -D coverbadge
# OR
npm install --save-dev coverbadge
```

## Usage

```sh
cat coverage/lcov.info | coverbadge [-o <outputPath>]
```

### `-o`, `--out-file`

Specify output path to save the badge image. Defaults to `coverage/badge.svg`.

> If you want it to calculate the difference between current and last coverage, you should not delete the old svg path for every build. If you put it in `coverage` folder and your script remove the folder for every test, you will have to copy the image before removing it, and paste it back to folder immediately after tests and before running this program.

`-o badge.svg` will output the image under your project root.

## Author

Kai Hao

## License

MIT
