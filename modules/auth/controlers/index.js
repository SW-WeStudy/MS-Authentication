let fire = require("../../../firebase").fire;

module.exports.createUser = async(req, res) => {
  // Creo la promesa para crear un usuario en el auth
  var createAuthUser = fire.auth().createUser({
    email: req.body.email,
    emailVerified: false,
    password: req.body.password,
    displayName: req.body.displayName,
    photoURL: 'http://www.example.com/12345678/photo.png',
    disabled: false
  });
  // Cuando se cumpla la promesa, creo el documento en firestores
  createAuthUser.then(function(userRecord) {
      res.status(200).json({
        status: `Successfully created new user: ${userRecord.uid}`
      });
      createFireUser = fire.firestore().collection("user").doc(userRecord.uid).set({
        email: req.body.email,
        emailVerified: false,
        password: req.body.password,
        displayName: req.body.displayName,
        photoURL: 'http://www.example.com/12345678/photo.png',
        idCourses: [{}],
        disabled: false
      })
      .catch(function(error) {
        console.log('Error creating new user doc:', error);
        res.status(200).json({
          status: 'Error creating new user doc:' + error
        })
      });
    });
  createAuthUser.catch(function(error) {
    console.log('Error creating new user:', error);
    res.status(200).json({
      status: 'Error creating new user:' + error
    })
  });
};


module.exports.getAuthUser = async(req, res) => {
  console.log('Check if request is authorized with Firebase ID token');
  console.log("req body" + req.body.uid);
  try {
    const { authToken } = req
    console.log(authToken)
    const userInfo = await fire.auth().verifyIdToken(authToken);
    req.authId = userInfo.uid
    res.status(200).json({
      status: `Successfully login user: ${req.body.uid}`
    });
  } catch (error) {
    console.log('Error creating new user:', error);
    res.status(200).json({
      status: 'Error creating new user:' + error
    })
  }
  
}
/*
async function addDecodedIdTokenToRequest(idToken, req) {
  try {
    const decodedIdToken
    req.user = decodedIdToken;
    console.log('ID Token correctly decoded', decodedIdToken);
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
  }
}
*/
module.exports.getUserByUid = async(req, res) => {
  fire.auth().getUser(req.body.uid).then(function(userRecord) {
      res.status(200).json({
        status: `Successfully get user by uid: ${userRecord.uid}`
      })
    })
    .catch(function(error) {
      console.log('Error getting user:', error);
      res.status(200).json({
        status: 'Error getting user:' + error
      })
    });
};

module.exports.getUserByEmail = async(req, res) => {
  fire.auth().getUserByEmail(req.body.email).then(function(userRecord) {
      res.status(200).json({
        status: `Successfully get user by email: ${userRecord.uid}`
      })
    })
    .catch(function(error) {
      console.log('Error getting user:', error);
      res.status(200).json({
        status: 'Error getting user:' + error
      })
    });
};

module.exports.updateUser= async(req, res) => {
  // Creo la promesa para actualizar un usuario en el auth
  var updateAuthUser = Promise.fire.auth().updateUser(req.body.uid, {
    email: req.body.email,
    emailVerified: req.body.emailVerified,
    password: req.body.password,
    displayName: req.body.displayName,
    disabled: false
  });
  // Cuando se cumpla la promesa, creo el documento en firestore
  updateAuthUser.then(function(userRecord) {
      res.status(200).json({
        status: `Successfully updated user: ${userRecord.uid}`
      });
      fire.firestore().collection("user").doc(userRecord.uid).update({
        email: req.body.email,
        emailVerified: req.body.emailVerified,
        password: req.body.password,
        displayName: req.body.displayName,
        disabled: false
      })
      .catch(function(error) {
        console.log('Error updating user doc:', error);
        res.status(200).json({
          status: 'Error updating user doc:' + error
        })
      });
    })
    .catch(function(error) {
      console.log('Error updating user:', error);
      res.status(200).json({
        status: 'Error updating user:' + error
      })
    });
};

module.exports.putDownUser= async(req, res) => {
  fire.auth().updateUser(req.body.uid,{
    disabled: true
  }).then(function(userRecord) {
      res.status(200).json({
        status: `Successfully putted user down: ${userRecord.uid}`
      })
    })
    .catch(function(error) {
      console.log('Error putting user down:', error);
      res.status(200).json({
        status: 'Error putting user down:' + error
      })
    });
};

module.exports.putUpUser= async(req, res) => {
  fire.auth().updateUser(req.body.uid,{
    disabled: false
  }).then(function(userRecord) {
      res.status(200).json({
        status: `Successfully putted user up: ${userRecord.uid}`
      })
    })
    .catch(function(error) {
      console.log('Error putting user up:', error);
      res.status(200).json({
        status: 'Error putting user up:' + error
      })
    });
};

module.exports.deleteUser= async(req, res) => {
  fire.auth().deleteUser(req.body.uid).then(function(userRecord) {
      res.status(200).json({
        status: `Successfully deleted user`
      })
    })
    .catch(function(error) {
      console.log('Error deleting user:', error);
      res.status(200).json({
        status: 'Error deleting user:' + error
      })
    });
};