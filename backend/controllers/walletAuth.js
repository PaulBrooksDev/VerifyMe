const User = require("../models/User");
const sanitize = require("mongo-sanitize");

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

    if (!user.twitterId || !user.twitterUsername || user.currentStep !== 2) {
      return res.status(404).send({
        error: "You must first confirm your twitter and discord account. ",
      });
    }

    const { address } = sanitize(req.body);

    if (!address) {
      return res
        .status(404)
        .send({ error: "No address provided. Please try again." });
    }

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
