#!/bin/bash

stty -echoctl # hide ^C

Help() 
{
    echo "Bash script to help with develpoment of Guess"
    echo
    echo "options:"
    echo "h   Print this help."
    echo "f   Starts the development server for the front-end."
    echo "s   Starts the development server for the back-end."
    echo "p   Starts the production server for both front and back."
    echo "b   Builds front-end and back-end."
    echo
    echo "If no arguments are provided, the development server of both starts."
    echo
}

CLIENT_PID=0
SERVER_PID=0

ClientDev()
{
    echo "Starting front-dev server..."
    npm start --prefix client &
    CLIENT_PID=$!
    echo "Client PID: $CLIENT_PID"
}

Prod()
{
    # This doesn't need the client, because on prod, the server runs both
    echo "Starting production server..."
    npm start --prefix server &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
}

ServerDev()
{
    echo "Starting backend-dev server..."
    npm run dev --prefix server &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
}

Build()
{
    echo "Building server and client"
    echo

    echo "Attempting to build server..."
    npm run build --prefix server &
    SERVER_BUILD=$!
    wait $SERVER_BUILD
    
    echo "Attempting to build client..."
    npm run build --prefix client &
    CLIENT_BUILD=$!
    wait $CLIENT_BUILD

    echo "Build complete"
}

KillProc()
{
    if [ $1 -ne 0 ]; then
        kill $1
        echo "Killed PID $1"
    fi
}

if [ $# -gt 0 ]; then
    while getopts ":hfsbp" option; do
        case $option in
            h)
                Help
                exit
                ;;
            f)
                ClientDev
                break
                ;;
            s)
                ServerDev
                break
                ;;
            p)
                Prod
                break
                ;;
            b)
                Build
                break
                ;;
            \?)
                echo "Error: Invalid option"
                exit 1
                ;;
        esac
    done
else
    ClientDev
    ServerDev
fi

Cancel() 
{
    echo "Killing servers..."
    KillProc $CLIENT_PID
    KillProc $SERVER_PID
    echo "Exiting..."
    exit
}

trap 'Cancel' SIGINT;
wait

# echo "Starting..."
# (trap 'kill 0' SIGINT;
# npm start --prefix server &
# npm start --prefix client & wait)


