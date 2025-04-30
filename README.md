## Running the application on your PC

Make a clone of this repository and install it in your development environment using the following command in your terminal (choose an appropriate directory):

```shell
git clone https://github.com/aluiziodeveloper/nestjs-app-prisma.git
```

After cloning the repository content, access the directory and run the commands below:

```shell
cd nestjs-app-prisma

chmod +x .docker/entrypoint.sh

docker-compose up --build
```

After running the above command the server will be running at the address `http://localhost:3000`.