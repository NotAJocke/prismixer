# Prismix
A simple tool combined with [prisma-import](https://github.com/ajmnz/prisma-import) that helps working with multiple prisma files.

## Installation
`npm i git+https://github.com/JockeRider199/prismixer`

This will install prismixer, prisma and prisma-import to your project.

Then, run `npx prisma init` and afterwards `npx prismixer init`.

## Usage
All files must be created in the "models" directory or else they will be ignored.

When you've finish editing your prisma files run

`npx prismixer run`