# VerifyMe

VerifyMe is a Web3 MERN stack application for preemptive user verification. It allows users to connect their Discord, Twitter, & Ethereum addresses before they are able to join a discord server. Upon joining the server the user is given a verified role. 

## Prerequisites

NodeJS

Twitter developer portal credentials - https://developer.twitter.com

Discord developer portal Oauth credentials - https://discord.com/developers/

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

Vercel production server

0 - Create a vercel account

1 - Fork this repo  

2 - Connect github to vercel

3 - import this repo on vercel

4 - Edit environment variables

5 - Deploy