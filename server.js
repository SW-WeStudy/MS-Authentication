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
