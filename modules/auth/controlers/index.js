let fire = require("../../../firebase").fire;

module.exports.createUser = async (req, res) => {
  var createAuthUser = fire.auth().createUser({
    email: req.body.email,
    emailVerified: false,
    password: req.body.password,
    displayName: req.body.displayName,
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false,
  });
  // creacion del documento en firestore
  createAuthUser.then(function (userRecord) {
    createFireUser = fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .set({
        email: req.body.email,
        emailVerified: false,
        password: req.body.password,
        displayName: req.body.displayName,
        photoURL: "http://www.example.com/12345678/photo.png",
        idCourses: [{}],
        idStudyRooms: [{}],
        idForum: [{}],
        role: "User",
        disabled: false,
      })
      .then(function (userRecord1) {
        res.status(200).json({
          ...userRecord,
        });
      })
      .catch(function (error) {
        console.log("Error creating new user doc:", error);
        res.status(200).json({
          status: "Error creating new user doc:" + error,
        });
      });
  });
  createAuthUser.catch(function (error) {
    console.log("Error creating new user:", error);
    res.status(200).json({
      status: "Error creating new user:" + error,
    });
  });
};

//consultas del usuario por su uid
module.exports.getUserByUid = async (req, res) => {
  var getUserId = fire.auth().getUser(req.body.uid);
  // reclama credenciales en auth para pedir doc en firestore
  getUserId.then(function (userRecord) {
    getFireUserID = fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .onSnapshot((snapshot) => {
        snap = snapshot.data();
        // con el ...userRecord da informacion del token verificado
        res.status(200).json({
          ...snap,
        });
      })
      .catch(function (error) {
        console.log("Error getting user doc:", error);
        res.status(200).json({
          status: "Error getting user doc:" + error,
        });
      });
  });
  getUserId.catch(function (error) {
    console.log("Error getting user:", error);
    res.status(200).json({
      status: "Error getting user:" + error,
    });
  });
};

//consultas del usuario por su email
module.exports.getUserByEmail = async (req, res) => {
  var getUserEmail = fire.auth().getUserByEmail(req.body.email);
  // reclama credenciales en auth para pedir doc en firestore
  getUserEmail.then(function (userRecord) {
    getFireUserEmail = fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .onSnapshot((snapshot) => {
        snap = snapshot.data();
        res.status(200).json({
          ...snap,
        });
      })
      .catch(function (error) {
        console.log("Error getting user doc:", error);
        res.status(200).json({
          status: "Error getting user doc:" + error,
        });
      });
  });
  getUserEmail.catch(function (error) {
    console.log("Error getting user:", error);
    res.status(200).json({
      status: "Error getting user:" + error,
    });
  });
};

// actualizacion de los datos del usuario
// aqui se puede modificar basicamente todos los datos tanto en el modulo auth, como en firestore en su respectivo documento
module.exports.updateUser = async (req, res) => {
  // Creo la promesa para actualizar un usuario en el auth
  var updateAuthUser = fire.auth().updateUser(req.body.uid, {
    email: req.body.email,
    emailVerified: req.body.emailVerified,
    password: req.body.password,
    displayName: req.body.displayName,
    disabled: false,
  });
  // Cuando se cumpla la promesa, creo el documento en firestore
  updateAuthUser.then(function (userRecord) {
    fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .update({
        email: req.body.email,
        emailVerified: req.body.emailVerified,
        password: req.body.password,
        displayName: req.body.displayName,
        role: req.body.role,
        disabled: false,
        idCourses: req.body.idCourses,
        idStudyRooms: req.body.idStudyRooms,
        idForum: req.body.idForum,
      })
      .then(function (userRecord1) {
        res.status(200).json({
          ...userRecord,
        });
      })
      .catch(function (error) {
        console.log("Error updating user doc:", error);
        res.status(200).json({
          status: "Error updating user doc:" + error,
        });
      });
  });
  updateAuthUser.catch(function (error) {
    console.log("Error updating user:", error);
    res.status(200).json({
      status: "Error updating user:" + error,
    });
  });
};

// deshabilita que un usuario se pueda autenticar, mas no elimina su documento en firestore
module.exports.putDownUser = async (req, res) => {
  var putAuthDown = fire.auth().updateUser(req.body.uid, {
    disabled: true,
  });
  putAuthDown.then(function (userRecord) {
    fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .update({disabled: true})
      .then(function (userRecord1) {
        res.status(200).json({
          ...userRecord,
        });
      })
      .catch(function (error) {
        console.log("Error updating disable user doc:", error);
        res.status(200).json({
          status: "Error updating disable user doc:" + error,
        });
      });
  });
  putAuthDown.catch(function (error) {
    console.log("Error putting user down:", error);
    res.status(200).json({
      status: "Error putting user down:" + error,
    });
  });
};

// habilita que un usuario se pueda autenticar, esto sin modificar o eliminar su documento en firestore
module.exports.putUpUser = async (req, res) => {
  var putAuthUp = fire.auth().updateUser(req.body.uid, {
    disabled: false,
  })
  putAuthUp.then(function (userRecord) {
    fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .update({disabled: true})
      .then(function (userRecord1) {
        res.status(200).json({
          ...userRecord,
        });
      })
      .catch(function (error) {
        console.log("Error updating disable user doc:", error);
        res.status(200).json({
          status: "Error updating disable user doc:" + error,
        });
      });
  });
  putAuthUp.catch(function (error) {
    console.log("Error putting user up:", error);
    res.status(200).json({
      status: "Error putting user up:" + error,
    });
  });
};

// elimina sus credenciales de autenticacion, dejare comentado el de eliminar el documento
// puesto que no se hasta que punto sea eso conveniente
module.exports.deleteUser = async (req, res) => {
  const uid = req.body.uid;
  var deleteAuthUser = fire.auth().deleteUser(uid);
  deleteAuthUser.then(function (userRecord) {
    fire
      .firestore()
      .collection("user")
      .doc(uid)
      .delete()
      .then(function (userRecord1) {
        res.status(200).json({
          ...userRecord1,
        });
      })
      .catch(function (error) {
        console.log("Error deleting user doc:", error);
        res.status(200).json({
          status: "Error deleting disable user doc:" + error,
        });
      });
  })
  deleteAuthUser.catch(function (error) {
      console.log("Error deleting user:", error);
      res.status(200).json({
        status: "Error deleting user:" + error,
      });
    });
};
