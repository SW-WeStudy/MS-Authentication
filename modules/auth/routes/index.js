let router = require("express").Router();

let controler_user = require("../controlers/index")

router.post("/createuser", controler_user.createUser);
router.get("/getuserbyuid", controler_user.getUserByUid);
router.get("/getuserbyemail", controler_user.getUserByEmail);
router.get("/getauthuser", controler_user.getAuthUser);
router.put("/updateuser", controler_user.updateUser);
router.put("/putdownuser", controler_user.putDownUser);
router.put("/putupuser", controler_user.putUpUser);
router.delete("/deleteuser", controler_user.deleteUser);


module.exports = router;