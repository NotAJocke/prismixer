# Prismix
A simple tool combined with [prisma-import](https://github.com/ajmnz/prisma-import) that helps to work with multiple Prisma files.

While prisma-import aims to merge multiple files, it cannot merge multiple models/enums. Prismixer resolves this.

## Installation
It's recommended to use the VSCode extension prisma-import made. You can find it [here](https://marketplace.visualstudio.com/items?itemName=ajmnz.prisma-import).
**Important**: You must disable the original Prisma extension so they don't conflict.

### Prismixer install
`npm i prisma @prisma/client prisma-import git+https://github.com/JockeRider199/prismixer`

This will add prismixer, prisma and prisma-import to your project.

Then, run `npx prisma init` and afterwards `npx prismixer init`.

## Usage
All files must be created in the "models" directory or else they will be ignored.

When you've finished editing your prisma files run

`npx prismixer run --ouput-client`

*The --output-client (-o) flag is optional and will print a code to paste to start using prisma*

## Using pnpm
If you're using pnpm, you must add the following to your `prisma/models/base.prisma` file (you can choose whatever output you want):
```
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}
```
See [issue related](https://github.com/prisma/prisma/issues/6603)