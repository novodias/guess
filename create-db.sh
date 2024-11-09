#!/bin/bash

# not tested
echo "Creating database if not exists."

createdb guess
psql -d guess -a -f ./guessing.sql

# echo "SELECT 'CREATE DATABASE guess' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mydb')\gexec" | psql
# psql -d guess -a -f ./guessing.sql
echo "Done"