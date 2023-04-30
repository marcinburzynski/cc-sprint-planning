#! /bin/bash
set -e

mkdir ssl
mkcert -key-file ./ssl/privkey.pem -cert-file ./ssl/fullchain.pem localhost
cp -r ./ssl ./server/ssl
cp -r ./ssl ./frontend/ssl
rm -rf ./ssl
