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

### Starting up a new container
This command will build a new image where the code will be compiled and run from the resulting jar, a mysql database will be created to alongside

```bash
sudo docker-compose up --build -d
```

Every time this command is run a new image will be created from scratch, to reuse the previous built images run withtout the --buid flag


### Stopping current running containers
```bash
sudo docker-compose down -v
```
