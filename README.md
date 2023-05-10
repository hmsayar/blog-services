# blogproject-services

Backend application built using a microservices architecture with Express.js, consisting of three main services: `blogposts-service`, `comments-service`, and `users-service`. An API gateway routes requests to the appropriate service. The project also includes a shared folder containing common functions, data structures, and middlewares used across the services.

The blogposts-service handles basic CRUD functionalities for blog posts, with its own MongoDB database, and utilizes Amazon S3 for storing images within blog posts. The comments-service manages basic CRUD functionalities for comments, with its own MongoDB database. The two services communicate using RabbitMQ to ensure data consistency, such as checking for the existence of a blog post when adding a new comment or deleting related comments when a blog post is removed.

The `users-service` manages user authentication, login, refresh token, sign-up, and user verification, and has its own MongoDB database. Redis is used for caching user information and the last 10 blog posts for faster access by the `comments-service` and `blogposts-service`. If the required user information is not found in Redis, the services send an HTTP request to the `users-service`. SendGrid is utilized for sending verification emails, JWT for authentication, and bcrypt for password hashing. User roles are also included in the JWT tokens.

## Motivation

The primary motivation behind this project was to expand my knowledge and gain hands-on experience with a variety of widely-used technologies and techniques in the world of backend development. By implementing a microservices architecture using Express.js, I aimed to develop a deeper understanding of how different services can work together.

In addition, this project offered an opportunity to explore the use of several popular tools and libraries, such as MongoDB, Redis, RabbitMQ, SendGrid, JWT, and bcrypt. By applying these technologies, I was able to gain practical experience in building a robust and secure backend application.

It allowed me to gain insights into building microservices, handling data consistency, and managing user authentication in a real-world scenario. 

## Technologies Used

This microservice-based backend application leverages the following technologies:

1. Express.js
2. MongoDB
3. Mongoose
4. Redis
5. RabbitMQ
6. JWT: JSON Web Tokens for user authentication and authorization.
7. Bcrypt: A robust library for hashing passwords, ensuring the security of user data.
8. SendGrid: A cloud-based email delivery service used to send verification emails during user registration.


## Installation and Setup

1. Clone the repository: https://github.com/hmsayar/blogproject-services.git

2. Install and set up Redis on your machine. [official Redis documentation](https://redis.io/docs/getting-started/)

3. Install and set up RabbitMQ on your machine. [official RabbitMQ documentation](https://www.rabbitmq.com/download.html)

4. Create a `.env` file in the root directory of each service.

    ```
    # blogposts-service
    DATABASE_URI=<your_mongodb_database>
    commentsServiceUrl = http://localhost:3002
    userServiceUrl = http://localhost:3000
    AWS_S3_BUCKET = <your_s3_bucket_name>
    AWS_ACCESS_KEY_ID=<aws_access_key>
    AWS_SECRET_ACCESS_KEY=<aws_secret>
    AWS_REGION=<aws_region>
    RABBITMQ_URL=amqp://localhost
    REDIS_URL=redis://localhost:6379
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```
    ```
    # comments-service
    DATABASE_URI=<your_mongodb_database>
    RABBITMQ_URL=amqp://localhost
    userServiceUrl = http://localhost:3000
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_URL=redis://localhost:6379
    ```
    ```
    # users-service
    DATABASE_URI= <your_mongodb_database>
    userServiceUrl = http://localhost:3000
    SENDGRID_API_KEY = <send_grid_api_key>
    SENDGRID_FROM_EMAIL = <sendgrid_from_email>
    REDIS_PORT = 6379
    REDIS_HOST = localhost
    REDIS_URL=redis://localhost:6379
    ```
    ```
    # api-gateway
    userServiceUrl = http://localhost:3000
    blogpostServiceUrl = http://localhost:3001
    commentServiceUrl = http://localhost:3002
    ```

5. Create `keys` folder in each service's `src` folder.

6. Create private-public key pair and save them as `public-key.pem` and `private-key.pem`

7. Place the `public-key.pem` file in the `keys` folder of each service. Include `private-key.pem` file only in the `keys` folder of the users-service.

8. Remove `@hmsayar/shared": "^1.1.8` dependency from all `package.json` file of each service.

9. Add the following line to the dependencies section in the package.json file of each service:
`"shared": "file:../shared"` 
Update the import statements in all controller files by replacing: 
`const someFunc = require("shared")`

10. Navigate to each service's folder and run `npm install`

11. Navigate to each service's folder and run `npm start`