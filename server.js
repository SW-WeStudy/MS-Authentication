const express=require('express')
const app = express()
const cors = require('cors')

// init
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const auth_routes = require('./modules/auth/routes');
app.use("/auth", auth_routes);

const port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Server listenting to port: " + port)
});

// createDN("cn=admin,dc=arqsoft,dc=unal,dc=edu,dc=co", "admin")
// authenticateDN("cn=user2ldap@gmail.com,ou=sa,dc=arqsoft,dc=unal,dc=edu,dc=co", "123456");