# nodejs_authenticator_api

## Table of content

1. [Installing docker in linux](#installing-docker-in-linux)
   1. [Ubuntu 16](#in-ubuntu-16)
   2. [Ubuntu 18](#in-ubuntu-18)
   3. [Docker compose](#docker-compose)
2. [Running the project](#running-the-project)
   1. [Preparing the working environment](#preparing-the-working-environment)
   2. [Starting up a new container](#starting-up-a-new-container)
   3. [Stopping the current running containers](#stopping-the-current-running-containers)

## Installing docker in linux

Eor more information check the [install guide](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

### In ubuntu 16

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

sudo apt-get update

apt-cache policy docker-ce

sudo apt-get install -y docker-ce
```

### In ubuntu 18

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

### Docker compose

Official install documentation [here](https://docs.docker.com/compose/install/)

```bash
# Downloading the binary
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Giving the binary execution rights
sudo chmod +x /usr/local/bin/docker-compose

# Checking the install
docker-compose --version
```

## Running the project

### Preparing the working environment

First a `.env`file must be created, this my be crated based on a template called `.sample.env` but don't forget to change the values as the defaults aren't meant to be used in production!

```bash
cp .sample.env .env
```

Next a set of RSA keys will be needed for async signing, they can be created with the following script

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

Where the `passphrase`must be changed in order to use a more secure password for your private key.

The resulting keys should be saved in the `./keys` directory, while the name given to them doesn't matter their name has to be added to your `.env`file in the fields `JWT_SECONDARY_RSA_PRIVATE_KEY` and `JWT_SECONDARY_RSA_PUBLIC_KEY` as well as adding your passphrase to the field `JWR_SECONDARY_RSA_KEY_PASSWORD`

### Starting up a new container

This command will build a new image where the code will be compiled and run from the resulting jar, a mysql database will be created to alongside

```bash
sudo docker-compose up --build -d
```

Every time this command is run a new image will be created from scratch, to reuse the previous built images run withtout the --buid flag

### Stopping the current running containers

```bash
sudo docker-compose down -v
```

## Endpoints

Date is always sent on the body using the header `Content-Type: application/json` unless otherwise state.

### Signing sync token

```text
POST http://localhost:9099/api/sync/sign
```

Parameters

```markdown
| Key            | Type   | Required |  Description                                                                             |
|----------------|--------|----------|------------------------------------------------------------------------------------------|
| payload        | Object | No       | Contains any data that will be added to the token's payload                              |
| expirationTime | Int    | No       | Defines the expiration time of the token, if not sent the token won't have an expiration |
```
