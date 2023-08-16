#!/bin/bash

# not tested
echo "Creating database if not exists."
psql -U postgres -c "SELECT 'CREATE DATABASE guess' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mydb')\gexec"
psql -U postgres -d guess -a -f ./guessing.sql
echo "Done"