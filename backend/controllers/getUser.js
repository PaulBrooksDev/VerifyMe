const User = require("../models/User");
const sanitize = require("mongo-sanitize");

// access - Public
// endpoint -  /api/connect/user
// decscription - returns a logged in users uuid from stored jwt
exports.getUser = async (req, res) => {
  try {
    let user = await User.findOne({ uuid: sanitize(req.user.id) });

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
      inviteCode: user.inviteCode,
    };

    return res.status(200).send({ message: user });
  } catch (e) {
    console.log(e);
    return res.status(404).send({ error: e.message });
  }
};
