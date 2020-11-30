let fire = require("../../../firebase").fire;
const xml2js = require('xml2js');
const { admin } = require("firebase-admin/lib/credential");

// LDAP connection

/*use this to create connection*/
var ldap = require("ldapjs");
var client = ldap.createClient({
  url: "ldap://127.0.0.1:389",
});

module.exports.verifyToken = async (req, res) => {
  // idToken comes from the client app
  var dataRequest = req.body.idToken;
  console.log(dataRequest);
  var verifyToken = fire.auth().verifyIdToken(dataRequest);
  verifyToken
    .then(function (decodedToken) {
      let uid = decodedToken.uid;
      console.log("Succes:  ", uid);
      res.status(200).json({ verified: true });
    })
    .catch(function (err) {
      console.log("Error token:", err);
      res.status(200).json({ verified: false });
    });
};

// create user in LDAP, maybe we may need homeDirectory
module.exports.createUserLDAP = async (req, res) => {
  var username = "cn=admin,dc=arqsoft,dc=unal,dc=edu,dc=co";
  var password = "admin";
  var dataRequest = await req.body;
  var newDN =
    "cn=" + dataRequest.email + ",ou=sa,dc=arqsoft,dc=unal,dc=edu,dc=co";
  var newUser = {
    cn: dataRequest.email,
    sn: dataRequest.surName,
    uid: dataRequest.email,
    mail: dataRequest.email,
    objectClass: "inetOrgPerson",
    userPassword: dataRequest.password,
  };
  async function createDN(username, password, newDN, newUser) {
    client.bind(username, password, function (err) {
      if (err) {
        console.log("Error in new connetion " + err);
        res.status(500).json({
          status: "Error binding admin in LDAP server:" + err,
        });
      } else {
        console.log("Success");
        console.log("new user: " + JSON.stringify(newUser));
        console.log("new DN: " + newDN);
        client.add(newDN, newUser, function (err) {
          if (err) {
            res.status(200).json({
              status: false,
            });
          } else {
            // res.status(200).json(true);
            res.status(200).json({
              status: true,
            });
          }
        });
      }
    });
  }
  await createDN(username, password, newDN, newUser);
};

// auth user in LDAP, maybe we may need homeDirectory
module.exports.authUserLDAP = async (req, res) => {
  var dataRequest = await req.body;
  var username =
    "cn=" + dataRequest.email + ",ou=sa,dc=arqsoft,dc=unal,dc=edu,dc=co";
  var password = dataRequest.password;
  async function authenticateDN(username, password) {
    client.bind(username, password, function (err) {
      if (err) {
        console.log("Error in new connetion " + err);
        res.status(200).json({
          status: false,
        });
      } else {
        // res.status(200).json(true);
        res.status(200).json({
          status: true,
        });
      }
    });
  }
  await authenticateDN(username, password);
};

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
  createAuthUser
    .then(function (userRecord) {
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
        .then(
          res.status(200).json({
            ...userRecord,
          })
        )
        .catch(function (error) {
          console.log(error);
          res.status(500).json({
            status: "Error creating new user doc:" + error,
          });
        });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json({
        status: "Error creating new user doc:" + err,
      });
    });
};

//consultas del usuario por su uid
module.exports.getUserByUid = async (req, res) => {
  var getUserId = fire.auth().getUser(req.body.uid);
  // reclama credenciales en auth para pedir doc en firestore
  getUserId
    .then(function (userRecord) {
      getFireUserID = fire
        .firestore()
        .collection("user")
        .doc(userRecord.uid)
        .get()
        .then((snapshot) => {
          const snap = snapshot.data();
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
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json({
        status: "Error getting user auth and doc:" + err,
      });
    });
};

//consultas del usuario por su email
module.exports.getUserByEmail = async (req, res) => {
  console.log(req.body["soap:envelope"]["soap:body"][0]["undefined:userfunction"][0]["email"][0])
//   const parser = new xml2js.Parser({ attrkey: "ATTR" });
//   parser.parseString(req.body ,function(error, result) {
//     if(error === null) {
//         console.log(result);
//     }
//     else {
//         console.log(error);
//     }
// });
  var getUserEmail = fire.auth().getUserByEmail(req.body["soap:envelope"]["soap:body"][0]["undefined:userfunction"][0]["email"][0]);
  // reclama credenciales en auth para pedir doc en firestore
  getUserEmail
    .then(function (userRecord) {
      getFireUserEmail = fire
        .firestore()
        .collection("user")
        .doc(userRecord.uid)
        .get()
        .then((snapshot) => {
          const snap = snapshot.data();
          delete snap.password
          res.status(200).json({
            ...snap,
          });
        })
        .catch(function (error) {
          console.log(error);
          res.status(500).json({
            status: "Error getting user doc:" + error,
          });
        });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json({
        status: "Error getting user auth and doc:" + err,
      });
    });
};

// actualizacion de los datos del usuario
// aqui se puede modificar basicamente todos los datos tanto en el modulo auth, como en firestore en su respectivo documento
module.exports.updateUser = async (req, res) => {
  var updateAuthUser = fire.auth().updateUser(req.body.uid, {
    email: req.body.email,
    emailVerified: req.body.emailVerified,
    password: req.body.password,
    displayName: req.body.displayName,
    disabled: false,
  });
  // Cuando se cumpla la promesa, creo el documento en firestore
  const dataDoc = {
    email: req.body.email,
    emailVerified: req.body.emailVerified,
    password: req.body.password,
    displayName: req.body.displayName,
    role: req.body.role,
    disabled: false,
    idCourses: req.body.idCourses,
    idStudyRooms: req.body.idStudyRooms,
    idForum: req.body.idForum,
  };
  updateAuthUser
    .then(function (userRecord) {
      updateFireUser = fire
        .firestore()
        .collection("user")
        .doc(userRecord.uid)
        .update(dataDoc)
        .then(
          res.status(200).json({
            dataDoc,
          })
        )
        .catch(function (error) {
          console.log(error);
          res.status(500).json({
            status: "Error updating user doc:" + error,
          });
        });
    })
    .catch(function (err) {
      console.log("Error updating user auth and doc:", err);
      res.status(500).send(err);
    });
  /*
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
    const dataDoc = {
      email: req.body.email,
      emailVerified: req.body.emailVerified,
      password: req.body.password,
      displayName: req.body.displayName,
      role: req.body.role,
      disabled: false,
      idCourses: req.body.idCourses,
      idStudyRooms: req.body.idStudyRooms,
      idForum: req.body.idForum,
    };
    fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .update(dataDoc)
      .then(function (userRecord1) {
        res.status(200).json({
          ...dataDoc,
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
    return res.status(200).json({
      status: "Error updating user:" + error,
    });
  });
  */
};

// deshabilita que un usuario se pueda autenticar, mas no elimina su documento en firestore
module.exports.putDownUser = async (req, res) => {
  var putAuthDown = fire.auth().updateUser(req.body.uid, {
    disabled: true,
  });
  putAuthDown
    .then(function (userRecord) {
      putFireDown = fire
        .firestore()
        .collection("user")
        .doc(userRecord.uid)
        .update({ disabled: true })
        .then(
          res.status(200).json({
            ...userRecord,
          })
        )
        .catch(function (error) {
          console.log(error);
          res.status(500).json({
            status: "Error putting down user doc:" + error,
          });
        });
    })
    .catch(function (err) {
      console.log("Error updating user auth and doc:", err);
      res.status(500).send(err);
    });

  /*
  var putAuthDown = fire.auth().updateUser(req.body.uid, {
    disabled: true,
  });
  putAuthDown.then(function (userRecord) {
    fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .update({ disabled: true })
      .then(function (userRecord1) {
        res.status(200).json({
          ...userRecord1,
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
  */
};

// habilita que un usuario se pueda autenticar, esto sin modificar o eliminar su documento en firestore
module.exports.putUpUser = async (req, res) => {
  var putAuthUp = fire.auth().updateUser(req.body.uid, {
    disabled: false,
  });
  putAuthUp
    .then(function (userRecord) {
      putFireUp = fire
        .firestore()
        .collection("user")
        .doc(userRecord.uid)
        .update({ disabled: false })
        .then(
          res.status(200).json({
            ...userRecord,
          })
        )
        .catch(function (error) {
          console.log(error);
          res.status(500).json({
            status: "Error putting up user doc:" + error,
          });
        });
    })
    .catch(function (err) {
      console.log("Error updating user auth and doc:", err);
      res.status(500).send(err);
    });
  /*
  var putAuthUp = fire.auth().updateUser(req.body.uid, {
    disabled: false,
  });
  putAuthUp.then(function (userRecord) {
    fire
      .firestore()
      .collection("user")
      .doc(userRecord.uid)
      .update({ disabled: true })
      .then(function (userRecord1) {
        return res.status(200).json({
          ...userRecord1,
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
  */
};

// elimina sus credenciales de autenticacion, dejare comentado el de eliminar el documento
// puesto que no se hasta que punto sea eso conveniente
module.exports.deleteUser = async (req, res) => {
  var uid = req.body.uid;
  var deleteAuthUser = fire.auth().deleteUser(uid);
  deleteAuthUser
    .then(function (userRecord) {
      deleteFireUser = fire
        .firestore()
        .collection("user")
        .doc(uid)
        .delete()
        .then(
          res.status(200).json({
            // return deleted uid user
            ...userRecord,
          })
        )
        .catch(function (error) {
          console.log(error);
          res.status(500).json({
            status: "Error deleting user doc:" + error,
          });
        });
    })
    .catch(function (err) {
      console.log("Error deleting user auth and doc:", err);
      res.status(500).send(err);
    });

  /*
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
  });
  deleteAuthUser.catch(function (error) {
    console.log("Error deleting user:", error);
    res.status(200).json({
      status: "Error deleting user:" + error,
    });
  });
  */
};
