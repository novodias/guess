# Ritmovu (Guess)
- Created with React (Client) and Express (API)

## Setup database

Setup should be easy - run `create-db` or manually create the database with the file `guessing.sql`.

## Build

Install dependencies from client and server.
```
$ npm i --prefix client
$ npm i --prefix server
```

### Development build
Run `./start-dev.sh` to start the development build.

### Production build
Run these commands to build production.
```
$ npm run build --prefix client
$ npm start --prefix server
```