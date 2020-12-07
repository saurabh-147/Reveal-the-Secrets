
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set('view engine','ejs');



mongoose.connect("mongodb://localhost:27017/secretsDB", {useNewUrlParser: true, useUnifiedTopology: true});


const userSchema = new mongoose.Schema({
  email : String,
  password : String
});

userSchema.plugin(encrypt, { secret : process.env.SECRET_KEY, encryptedFields: ['password'] });


const User = mongoose.model('User',userSchema);

//Home Page
app.get("/",function(req,res){
  res.render("home");
});


//Login Page Get and And Post Route
app.get("/login",function(req,res){
  res.render("login");
});

app.post("/login",function(req,res){
  const useremail = req.body.email;
  const userPassword = req.body.password;
  User.findOne({email : useremail},function(err,foundUser){
      if(!err){
          if(foundUser){
            bcrypt.compare(userPassword, foundUser.password, function(err, result) {
                if(result === true){
                  res.render("compose");
                }else{
                  res.redirect("/login");
                }
          });
        }
      }
  });
});



//Register Page Get and Post Route
app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  const useremail = req.body.email;
  const userPassword = req.body.password;
  bcrypt.hash(userPassword, saltRounds, function(err, hash) {
      if(!err){
        const newUser = new User({
          email : useremail,
          password: hash
        });
          newUser.save(function(err){
            if(!err){
              res.render("compose");
            }else{
              console.log(err);
            }
          });
      }
  });
});


//Compose Route post

app.post("/compose",function(req,res){
  //if user is authenticated
  const secret = req.body.secret;
  res.redirect("/");
});


app.listen(3000,function(req,res){
  console.log("Server started at Port 3000");
});
