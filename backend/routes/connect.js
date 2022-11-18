const express = require("express");
const { auth } = require("../middleware/auth");
const router = new express.Router();

const { getUser } = require("../controllers/getUser");
const { connectDiscord, submit } = require("../controllers/discordAuth");
const { twitterUrl, connectTwitter } = require("../controllers/twitterAuth");
const { connectWallet } = require("../controllers/walletAuth");

// access - Public
// endpoint -  /api/connect/user
// decscription - returns a logged in users uuid from stored jwt
router.post("/user", auth, getUser);

// access - Public
// endpoint -  /api/connect/discord
// decscription - connects users discord based on query string in redirect
router.post("/discord", connectDiscord);

// access - Private
// endpoint -  /api/connect/twitter/url
// description - Sends the twitter oAuth redirect to the users browser
router.post("/twitter/url", auth, twitterUrl);

// access - Private
// endpoint -  /api/connect/twitter
// description - Gets the users Twitter ID and username from query params given in redirect
router.post("/twitter", auth, connectTwitter);

// access - Private
// endpoint -  /api/connect/wallet
// description - Gets users wallet address from metamask and saves to database
router.post("/wallet", auth, connectWallet);

// access - Private
// endpoint -  /api/connect/submit
// description - Saves all fields to the database and marks user as has completed signup
router.post("/submit", auth, submit);

module.exports = router;
