<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A Simple REST-API developed with the NEST.JS Framework</p>
  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
  
## Description

This simple REST-API implements the backend of a Article repository. 

Features:

- User signup;
- Authentication (JWT with refresh token);
- Role based authorization (user / Admin);
- TypeORM - ORM (using PostgreSQL);
- Article CRUD including upload of images;
- Unit tests and e2e tests

## 🔧 Runing the project

- Clone the repo on your local machine
- Navigate on your command line interface to the root folder of the project

### Before runing the project: Create the environment variables file:

- Create a .env.development file in the root folder of the project with the following variables:

- API Host Url
API_HOST_URL=http://localhost:3000

#### Database
- POSTGRES_HOST=db
- POSTGRES_PORT=5432
- POSTGRES_USER=postgres
- POSTGRES_PASSWORD=postgres
- POSTGRES_DATABASE=postgres
- SYNCHRONIZE=true

#### JWT
- JWT_ACCESS_TOKEN_SECRET=secret
- JWT_ACCESS_TOKEN_EXPIRATION=50m
- JWT_REFRESH_TOKEN_SECRET=secret2
- JWT_REFRESH_TOKEN_EXPIRATION=7d

#### Email
- EMAIL_HOST=smtp.yourserver.com
- EMAIL_ID=credential@yourserver.com
- EMAIL_PASSWORD=yourpassword
- EMAIL_FROM=credential@yourserver.com

#### Reset Password 
- JWT_RESET_PASSWORD_SECRET=resetpass
- JWT_RESET_PASSWORD_TOKEN_EXPIRATION=1d

#### uploads folders
- UPLOAD_USER_AVATAR_FOLDER=./src/uploads/avatars
- UPLOAD_ARTICLE_IMAGE_FOLDER=./src/uploads/article_images

### Using Docker to run the project:

- Make sure you have Docker installed on your local machine
- Navigate on your command line interface to the root folder of the project
- Enter the command: docker-compose up -d
- Wait until all the containers are running
- Open a browser and access the project on http://localhost:3000
- To stop the project enter the command: docker-compose down



