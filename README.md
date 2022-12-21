# VerifyMe

VerifyMe is a Web3 MERN stack application for preemptive user verification. It allows users to connect their Discord, Twitter, & Ethereum addresses before they are able to join a discord server. Upon joining the server the user is given a verified role. 

## Prerequisites

NodeJS

MongoDB:

Cloud hosted - https://www.mongodb.com/home

Local download - https://www.mongodb.com/try/download/community (connects to cloud hosted uri for ability to download data as csv)

Update the example.env file in the backend folder with your corresponding values and rename to .env 


## Installation

Localhost development server

Navigate to the folders root directory

Install dependencies & start the server
```bash
npm run start
```

Install dependencies & start the react app
```bash
npm run dev
```
## 

Heroku production server

navigate to the folders root directory

0 - Build the react app

1 - Login to heroku

2 - Add your Heroku dyno to the local git. 

3 - Add & commit changes (if any)

4 - push to heroku (change master to main if there is a git branch error)

```bash
npm run prod-build

heroku login

heroku git:remote -a your-app-name.

git add .

git commit -m "Commit message"

git push heroku master
```
