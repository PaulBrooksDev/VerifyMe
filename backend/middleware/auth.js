const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  try {
    let token = req.cookies;
    token = JSON.stringify(token).split(`"`)[3];

    //  check for token
    if (!token) {
      res.clearCookie(process.env.TOKEN_PSUEDO_NAME);
      return res.status(400).send({ authError: "Access denied" });
    }

    //  Verify token
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    if (req.user) {
      // Send a new Token
      jwt.sign(
        {
          // set the payload as user's uuid
          id: req.user.id,
        },
        process.env.JWT_SECRET,
        //  set expiration to 72 hours
        { expiresIn: "72h" },
        (err, token) => {
          if (err) {
            console.log(err);
            res.clearCookie(process.env.TOKEN_PSUEDO_NAME);
            return res.status(400).send({ error: "Invalid Credentials" });
          }
          // send user data and token to client
          res.cookie(process.env.TOKEN_PSUEDO_NAME, token);
        }
      );
    }

    next();
  } catch (e) {
    console.log(e);
    res.clearCookie(process.env.TOKEN_PSUEDO_NAME);
    return res.status(400).send({ authError: "Access denied" });
  }
};
