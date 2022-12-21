const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const sanitize = require("mongo-sanitize");
const DiscordOauth2 = require("discord-oauth2");
const discordOauth = new DiscordOauth2();
const axios = require("axios");

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

// Activate the discord bot
discordClient
  .login(process.env.DISCORD_BOT_TOKEN)
  .then(() => {
    console.log("Discord bot active.");
  })
  .catch((e) => {
    console.log(e.message);
    console.log("DISCORD_BOT_TOKEN is likely invalid.");
  });

// Give discord user the verified role upon joining the server
discordClient.on("guildMemberAdd", async (member) => {
  try {
    const isUserValid = await User.findOne({ discordId: member.user.id });

    if (!isUserValid) return;

    let role = member.guild.roles.cache.find(
      (r) => r.id === process.env.DISCORD_VERIFIED_ROLE_ID
    );

    member.roles.add(role);
  } catch (e) {
    console.log(e.message);
    console.log("DISCORD_VERIFIED_ROLE_ID is likely invalid.");
  }
});

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
// endpoint -  /api/connect/submit
// description - Saves all fields to the database and marks user as has completed signup
exports.submit = async (req, res) => {
  try {
    let user = await User.findOne({ uuid: sanitize(req.user.id) });

    if (!user) {
      return res
        .status(404)
        .send({ error: "Form not submitted. Please try again." });
    }

    if (!user.walletAddress || user.currentStep < 3) {
      return res.status(404).send({
        error:
          "You must first confirm your twitter, discord, and ETH accounts. ",
      });
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

    // If the user already has an invite code, return it
    if (user.inviteCode) {
      user = {
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        twitterId: user.twitterId,
        twitterUsername: user.twitterUsername,
        walletAddress: user.walletAddress,
        currentStep: user.currentStep,
        isSignUpComplete: user.isSignUpComplete,
        inviteCode: user.inviteCode,
      };

      return res.status(200).send({ message: user.inviteCode, user });
    }

    // Create unique invite code for user
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
