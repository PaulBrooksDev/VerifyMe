const mongoose = require("mongoose");

const db = process.env.mongoURI;

// Connect to mongo
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo DB Connected"))
  .catch((e) => console.log(e));
