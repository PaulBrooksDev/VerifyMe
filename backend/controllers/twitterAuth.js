const User = require("../models/User");
const sanitize = require("mongo-sanitize");
const OAuth = require("oauth"),
  qs = require("querystring");
const { TwitterApi } = require("twitter-api-v2");
const Auth = OAuth.OAuth;
const twitterConsumerKey = process.env.CONSUMER_KEY;
const twitterConsumerSecret = process.env.CONSUMER_SECRET;

const requestUrl = "https://twitter.com/oauth/request_token";
const accessUrl = "https://twitter.com/oauth/access_token";
const authorizeUrl = "https://twitter.com/oauth/authorize";

const oa = new Auth(
  requestUrl,
  accessUrl,
  twitterConsumerKey,
  twitterConsumerSecret,
  "1.0",
  null,
  "HMAC-SHA1"
);

// access - Private
// endpoint -  /api/connect/twitter/url
// description - Sends the twitter oAuth redirect to the users browser
exports.twitterUrl = async (req, res) => {
  try {
    let user = await User.findOne({ uuid: sanitize(req.user.id) });

    if (!user) {
      return res
        .status(404)
        .send({ error: "Twitter not connected. Please try again." });
    }

    if (!user.discordId || !user.discordUsername) {
      return res
        .status(404)
        .send({ error: "You must first confirm your discord account. " });
    }

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

    if (!user.discordId || !user.discordUsername || user.currentStep !== 1) {
      return res
        .status(404)
        .send({ error: "You must first confirm your discord account. " });
    }

    const { oauthToken, verifier } = sanitize(req.body.data);

    if (!oauthToken || !verifier) {
      return res
        .status(400)
        .send({ error: "Invalid login attempt. Please try again." });
    }

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

        // Check if the provided twitter account has already been registered
        const userExist = await User.findOne({
          twitterId: getCurrentUser.data.id,
        });

        if (userExist) {
          return res
            .status(404)
            .send({ error: "A user with that twitter account already exist." });
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
