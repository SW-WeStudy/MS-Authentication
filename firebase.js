var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

module.exports.fire = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://westudy-3c433.firebaseio.com"
});
