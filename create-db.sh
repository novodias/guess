#!/bin/bash

# not tested
echo "Creating database if not exists."
echo "SELECT 'CREATE DATABASE guess' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mydb')\gexec" | psql -U novodias
psql -U novodias -d guess -a -f ./guessing.sql
echo "Done"