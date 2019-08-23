# sloth_authenticator

[![Build Status](https://travis-ci.org/PootisPenserHere/sloth_authenticator.svg?branch=master)](https://travis-ci.org/PootisPenserHere/sloth_authenticator) [![codecov](https://codecov.io/gh/PootisPenserHere/sloth_authenticator/branch/master/graph/badge.svg)](https://codecov.io/gh/PootisPenserHere/sloth_authenticator) [![Maintainability](https://api.codeclimate.com/v1/badges/1d34f86a9d070a81675a/maintainability)](https://codeclimate.com/github/PootisPenserHere/sloth_authenticator/maintainability)

A nodejs and express api to sign and validate json web tokens in a microservice environment

## Table of content

1. [Initial configuration](#initial-configuration)
   1. [Environment](#environment)
      1. [Master user](#master-user)
      2. [RSA keys](#rsa-keys)
   2. [Docker and docker compose](#docker-and-docker-compose)
      1. [Installing docker](#installing-docker)
         1. [Ubuntu 16](#ubuntu-16)
         2. [Ubuntu 18](#ubuntu-18)
         3. [Installing docker compose](#installing-docker-compose)
2. [Working in development mode](#working-in-development-mode)
   1. [Without docker](#without-docker)
   2. [With docker](#with-docker)
3. [Endpoints](#endpoints)
   1. [Signing new token](#signing-new-token)
      1. [Parameters](#sign-parameters)
      2. [Sync](#sync-sign)
      3. [Async](#async-sign)
      4. [Example response](#example-response-from-signing)
   2. [Verify token](#verify-token)
      1. [Parameters](#verify-parameters)
      2. [Sync](#sync-verify)
      3. [Async](#async-verify)
      4. [Example response](#example-response-from-verify)
   3. [Revoke token](#revoke-token)
      1. [Revoke paramters](#revoke-paramters)
      2. [Endpoint](#revoke-endpoint)
      3. [Example response](#example-response-from-revoking)

## Initial configuration

### Environment

As a first step a `.env`file must be created, this my be crated based on a template called `.sample.env` but don't forget to change the values as the defaults aren't meant to be used in production!

```bash
cp .sample.env .env
```

#### Master user

The `MASTER_USER` and `MASTER_PASSWORD`are used when the app is first launched to create the first user which will act as an admin, if one of this environments is missing or none is passed the user will be created randomly, on either case the credentials can be taken from the console output.

#### RSA keys

A set of RSA keys will be needed to sign the aysnc tokens of the client applications, this is an optional step if async tokens won't be used.

To create the key pair the following script can be used

```javascript
const { generateKeyPair } = require('crypto');
generateKeyPair('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'changeThisPassword'
  }
}, (err, publicKey, privateKey) => {
    console.log(publicKey)
    console.log(privateKey)
});

```

Where the `passphrase`must be changed in order to use a more secure password for keys.

The resulting keys should be saved in the `./keys` directory, while the name given to them doesn't matter their name has to be added to your `.env`file in the fields `JWT_SECONDARY_RSA_PRIVATE_KEY` and `JWT_SECONDARY_RSA_PUBLIC_KEY` as well as adding your passphrase to the field `JWR_SECONDARY_RSA_KEY_PASSWORD`.

## Docker and docker compose

This are an encouraged but alternative step as the project may be run without docker aswell

#### Installing docker

For more information check the [install guide](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

##### Ubuntu 16

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

sudo apt-get update

apt-cache policy docker-ce

sudo apt-get install -y docker-ce
```

##### Ubuntu 18

```bash
sudo apt-get install -y docker.io

# To verify that docker is correctly installed
sudo systemctl status docker

# Installing docker compose 
# the version should be taken from [here](https://github.com/docker/compose/releases)
sudo curl -L https://github.com/docker/compose/releases/download/1.19.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

# The version should be taken from [here](https://github.com/docker/compose/releases)
sudo docker-compose --version
```

#### Installing docker compose

Official install documentation [here](https://docs.docker.com/compose/install/)

```bash
# Downloading the binary
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Giving the binary execution rights
sudo chmod +x /usr/local/bin/docker-compose

# Checking the install
docker-compose --version
```

## Working in development mode

### Without docker

Installing the dependencies including dev

```bash
yarn install
```

It's recommended that the project is run with nodemon for it's reloading capabilities and since it's already added in the dev dependencies that were installed with the previous step.

To run the app with nodemon

```bash
yarn dev
```

Alternatively the app can be run with nodesj  with the following command

```bash
yarn start
```

Documentation for the project can be generated with

```bash
yarn docs
```

The test suit can be run with

```bash
yarn test
```

### With docker

This command will build a new image where the code will be added in a volume to allow its easy editing, a postgres and redid database will be created to alongside it.

```bash
docker-compose up --build -d
```

Every time this command is run a new image will be created from scratch, to reuse the previous built images run withtout the --buid flag

### Stopping the current running containers

```bash
docker-compose down -v
```

## Endpoints

Data is always sent as json on the body using the header `Content-Type: application/json` unless otherwise stated.

### Signing new token

#### Sign parameters

| Key            | Type   | Required | Description                                                  |
| -------------- | ------ | -------- | ------------------------------------------------------------ |
| payload        | Object | No       | Contains any data that will be added to the token's payload  |
| expirationTime | Int    | No       | Defines the expiration time of the token, if not sent the token won't have an expiration |

#### Sync sign

```text
POST /api/sync/sign
```

#### Async sign

```text
POST /api/async/sign
```

#### Example response from signing

```json
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoiYWxnbyIsImludCI6MTExLCJpYXQiOjE1NjY0ODg2NTcsImV4cCI6MTU2NjQ4ODk1NywiaXNzIjoic3VwZXJTZWNyZXRJc3N1ZXIiLCJqdGkiOiJiMjc1NjQ4ZGNjZTA3MjhkMWQwMjUwY2RhMzQzNGZkMSJ9.TOGUq8mqiUWdW0QobFD0qWBL8J_cUhVtHLXTHwUiY34-A64AkofruEMg9cRWM0PELLAkzVE0jwfrz8HFkbfQAQ",
  "status": "success",
  "message": "Token created successfully."
}
```

### Verify token

#### Verify parameters

| Key   | Type   | Required | Description             |
| ----- | ------ | -------- | ----------------------- |
| token | String | Yes      | The jwt to be validated |

#### Sync verify

```text
POST /api/sync/decode
```

#### Async verify

```text
POST /api/async/decode
```

#### Example response from verify

```json
{
  "payload": {
    "sampleField": "something",
    "iat": 1566586349,
    "exp": 1566586649,
    "iss": "superSecretIssuer",
    "jti": "d4f8be8252126fabe45011ce7defb4b8"
  },
  "status": "success",
  "message": "The token is valid."
}
```

### Revoke token

This is a unified method that can revoke both sync and async tokens

#### Revoke paramters

| Key   | Type   | Required | Description             |
| ----- | ------ | -------- | ----------------------- |
| token | String | Yes      | The jwt to be validated |

#### Revoke endpoint

```text
POST /api/revoke
```

#### Example response from revoking

```json
{
  "status": "success",
  "message": "The token has been added to the blacklist."
}
```
