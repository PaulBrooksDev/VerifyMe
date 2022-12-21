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

##

Update .env in the client folder:

REACT_APP_SERVER_URL=YOUR_DOMAIN_URL

REACT_APP_RECAPTCHA_SITE_KEY=YOUR_GOOGLE_RECAPTCHA_SITE_KEY

REACT_APP_DISCORD_URI=```https://discord.com/api/oauth2/authorize?client_id=1042194223514013766&redirect_uri=https%3A%2F%2Fverifym3.vercel.app%2Fdiscord%2Fauth&response_type=code&scope=identify```

REACT_APP_TWITTER_URI=```https://twitter.com/i/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URL/twitter/auth&scope=tweet.read%20users.read%20follows.read%20follows.write&state=state&code_challenge=challenge&code_challenge_method=plain```

Get Discord redirect uri from discord developer portal under oauth2

Get Twitter redirect uri by replacing client_id= and redirect_url= with your twitter client id and redirect url.

You MUST rebuild the react app anytime you change the env file in the client folder. You must then commit the changes to github.

```bash
cd client
```

```bash
npm run build
```


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

5 - Under project settings navigate to Root Directory, enter "backend" as root directory 

6 - Deploy

