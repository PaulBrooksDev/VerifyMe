const sanitize = require("mongo-sanitize");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const DiscordOauth2 = require("discord-oauth2");
const discordOauth = new DiscordOauth2();
const axios = require("axios");

const { TwitterApi } = require("twitter-api-v2");

// Twitter oAuth
const OAuth = require("oauth"),
  qs = require("querystring");

const Auth = OAuth.OAuth;
const twitterConsumerKey = process.env.CONSUMER_KEY;
const twitterConsumerSecret = process.env.CONSUMER_SECRET;

const requestUrl = "https://twitter.com/oauth/request_token";
const accessUrl = "https://twitter.com/oauth/access_token";
const authorizeUrl = "https://twitter.com/oauth/authorize";

// Twitter api auth
const oa = new Auth(
  requestUrl,
  accessUrl,
  twitterConsumerKey,
  twitterConsumerSecret,
  "1.0",
  null,
  "HMAC-SHA1"
);

const { Client, Intents, Partials, GatewayIntentBits } = require("discord.js");
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);

// access - Public
// endpoint -  /api/connect/user
// decscription - returns a logged in users uuid from stored jwt
exports.getUser = async (req, res) => {
  try {
    let user = await User.findOne({ uuid: req.user.id });

    if (!user) {
      return res.status(400).send({ error: "JWT expired" });
    }

    user = {
      discordId: user.discordId,
      discordUsername: user.discordUsername,
      twitterId: user.twitterId,
      twitterUsername: user.twitterUsername,
      walletAddress: user.walletAddress,
      currentStep: user.currentStep,
    };

    return res.status(200).send({ message: user });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ error: e.message });
  }
};

// access - Public
// endpoint -  /api/connect/discord
// decscription - connects users discord based on query string in redirect
exports.connectDiscord = async (req, res) => {
  try {
    // Query string sent from discord redirect
    const code = sanitize(req.body.code);

    console.log(code, process.env.DISCORD_REDIRECT_URI);

    // Verify token sent from browser
    const isAuth = await discordOauth.tokenRequest({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      code,
      scope: "identify",
      grantType: "authorization_code",
      redirectUri: process.env.DISCORD_REDIRECT_URI,
    });

    if (!isAuth) {
      return res
        .status(400)
        .send({ error: "Discord not connected. Please try again." });
    }

    // Get discord username and id
    const { id, username } = await discordOauth.getUser(isAuth.access_token);

    if (!id || !username) {
      return res
        .status(400)
        .send({ error: "Discord not connected. Please try again." });
    }

    let user = await User.findOne({ discordId: id });

    if (!user) {
      // Save as new user in the database if the user hasn't already began the signup process.
      user = new User({
        discordId: id,
        discordUsername: username,
        twitterId: "",
        twitterUsername: "",
        walletAddress: "",
        currentStep: 1,
        isSignUpComplete: false,
        createdAt: Date.now(),
        uuid: uuidv4(),
      });

      await user.save();
    }

    // Sign and send cookie to save state of the user on the browser
    jwt.sign(
      { id: user.uuid },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
      (err, token) => {
        if (err) {
          return res.status(400).send({ error: "InvalidCredentials" });
        }

        res.cookie(process.env.TOKEN_PSUEDO_NAME, token, {
          secure: process.env.NODE_ENV !== "development",
        });

        // Returns publicly safe user data to the browser
        user = {
          discordId: user.discordId,
          discordUsername: user.discordUsername,
          twitterId: user.twitterId,
          twitterUsername: user.twitterUsername,
          walletAddress: user.walletAddress,
          currentStep: user.currentStep,
          isSignUpComplete: user.isSignUpComplete,
        };

        return res.status(200).send({ message: user });
      }
    );
  } catch (e) {
    console.log(e);
    return res.status(400).send({ error: e.message });
  }
};

// access - Private
// endpoint -  /api/connect/twitter/url
// description - Sends the twitter oAuth redirect to the users browser
exports.sendTwitterAuthUrl = async (req, res) => {
  try {
    oa.getOAuthRequestToken((e, requestToken) => {
      if (e) return res.status(400).send({ error: e.message });

      const authUrl =
        authorizeUrl + "?" + qs.stringify({ oauth_token: requestToken });

      return res.status(200).send({ message: authUrl });
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ error: e.message });
  }
};

// access - Private
// endpoint -  /api/connect/twitter
// description - Gets the users Twitter ID and username from query params given in redirect
exports.connectTwitter = async (req, res) => {
  try {
    let user = await User.findOne({ uuid: sanitize(req.user.id) });

    if (!user) {
      return res
        .status(404)
        .send({ error: "Twitter not connected. Please try again." });
    }

    const { oauthToken, verifier } = sanitize(req.body.data);

    oa.getOAuthAccessToken(
      oauthToken,
      oauthToken,
      verifier,
      async (e, accessToken, accessTokenSecret) => {
        if (e) return res.status(400).send({ error: e.message });

        // Login using app key and secret and verify using the users access and secret token
        const twitterClient = new TwitterApi({
          appKey: process.env.CONSUMER_KEY,
          appSecret: process.env.CONSUMER_SECRET,
          accessToken: accessToken,
          accessSecret: accessTokenSecret,
        });

        // Returns the users twitter name and ID
        const getCurrentUser = await twitterClient.currentUserV2();

        if (!getCurrentUser) {
          return res
            .status(404)
            .send({ error: "Twitter not connected. Please try again." });
        }

        // Save retrieved user info the database update current step
        user.twitterId = getCurrentUser.data.id;
        user.twitterUsername = getCurrentUser.data.username;
        user.currentStep = 2;
        await user.save();

        // Return user data to the browser
        user = {
          discordId: user.discordId,
          discordUsername: user.discordUsername,
          twitterId: user.twitterId,
          twitterUsername: user.twitterUsername,
          walletAddress: user.walletAddress,
          currentStep: user.currentStep,
          isSignUpComplete: user.isSignUpComplete,
        };

        return res.status(200).send({ message: user });
      }
    );
  } catch (e) {
    console.log(e);
    return res.status(400).send({ error: e.message });
  }
};

// access - Private
// endpoint -  /api/connect/wallet
// description - Gets users wallet address from metamask and saves to database
exports.connectWallet = async (req, res) => {
  try {
    let user = await User.findOne({ uuid: sanitize(req.user.id) });

    if (!user) {
      return res
        .status(404)
        .send({ error: "Wallet not connected. Please try again." });
    }

    const { address } = sanitize(req.body);

    user.walletAddress = address;
    user.currentStep = 3;
    await user.save();

    user = {
      discordId: user.discordId,
      discordUsername: user.discordUsername,
      twitterId: user.twitterId,
      twitterUsername: user.twitterUsername,
      walletAddress: user.walletAddress,
      currentStep: user.currentStep,
      isSignUpComplete: user.isSignUpComplete,
    };

    return res.status(200).send({ message: user });
  } catch (e) {
    console.log(e);

    return res.status(400).send({ error: e.message });
  }
};

// access - Private
// endpoint -  /api/connect/submit
// description - Saves all fields to the database and marks user as has completed signup
exports.connectSubmit = async (req, res) => {
  try {
    let user = await User.findOne({ uuid: sanitize(req.user.id) });

    if (!user) {
      return res
        .status(404)
        .send({ error: "Form not submitted. Please try again." });
    }

    const { captcha } = sanitize(req.body);

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`;

    const isValidCaptcha = await axios
      .post(url, {})
      .then((res) => {
        return res.data.success;
      })
      .catch((e) => {
        console.log(e);
      });

    if (!isValidCaptcha) {
      return res.status(400).send({ error: "Invalid captcha response." });
    }

    if (user.inviteCode) {
      user = {
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        twitterId: user.twitterId,
        twitterUsername: user.twitterUsername,
        walletAddress: user.walletAddress,
        currentStep: user.currentStep,
        isSignUpComplete: user.isSignUpComplete,
      };

      return res.status(200).send({ message: user.inviteCode, user });
    }

    const guild = await discordClient.guilds.fetch(
      process.env.DISCORD_SERVER_ID
    );

    const channel = guild.channels.cache.get(
      process.env.DISCORD_INVITE_CHANNEL_ID
    );

    const invite = await channel.createInvite({
      maxAge: 600000 + Math.round(Math.random() * 5),
      maxUses: 1,
    });

    const inviteLink = `https://discord.gg/${invite.code}`;

    user.isSignUpComplete = true;
    user.currentStep = 4;
    user.inviteCode = inviteLink;
    await user.save();

    user = {
      discordId: user.discordId,
      discordUsername: user.discordUsername,
      twitterId: user.twitterId,
      twitterUsername: user.twitterUsername,
      walletAddress: user.walletAddress,
      currentStep: user.currentStep,
      isSignUpComplete: user.isSignUpComplete,
    };

    return res.status(200).send({ message: inviteLink, user });
  } catch (e) {
    console.log(e);

    return res.status(400).send({ error: e.message });
  }
};
