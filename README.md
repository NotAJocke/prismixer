# Prismix
A simple tool combined with [prisma-import](https://github.com/ajmnz/prisma-import) that helps working with multiple prisma files.

## Installation
`npm i prisma @prisma/client prisma-import git+https://github.com/JockeRider199/prismixer`

**OR**

`pnpm i prisma @prisma/client prisma-import git+https://github.com/JockeRider199/prismixer`

This will install prismixer, prisma and prisma-import to your project.

Then, run `npx prisma init` and afterwards `npx prismixer init`.

**OR**

Then, run `pnpm exec prisma init` and afterwards `pnpm exec prismixer init`.

## Usage
All files must be created in the "models" directory or else they will be ignored.

When you've finish editing your prisma files run

`npx prismixer run`
**OR**
`pnpm exec prismixer run`


## Using pnpm
```
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}
```
See [issue related](https://github.com/prisma/prisma/issues/6603)