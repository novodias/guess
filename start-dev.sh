#!/bin/bash

echo "Starting..."
(trap 'kill 0' SIGINT;
npm start --prefix server &
npm start --prefix client & wait)


