# Ritmovu (Guess)
Created with React (Client) and Express (API)

## Setup

Setup should be easy - run `create-db` shell script or manually create the database with the file `guessing.sql`.

Create a .env file in the server directory, and set a `ASSETS_DIRECTORY` to use.

## Build

Install dependencies from client and server.
```
$ npm i --prefix client
$ npm i --prefix server
```

### Development build
Run `./start-dev.sh` to start the development build. The script start both servers with hotloading.

### Production build
Run these commands to build production.
```
$ npm run build --prefix client
$ npm start --prefix server
```