
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set('view engine','ejs');



app.use(session({
  secret : process.env.SECRET_KEY,
  resave : false,
  saveUninitialized : true
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/secretsDB", {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set('useCreateIndex', true);


const userSchema = new mongoose.Schema({
  username : String,
  password : String,
  secret : String,
  googleId : String
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User',userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//Home Page
app.get("/",function(req,res){
  User.find({ secret : {$ne : null}},function(err, foundUsers){
    if(err){
      console.log(err);
    }else{
      if(foundUsers){
        console.log(foundUsers);
        res.render("home",{userWithSecret : foundUsers});
      }
    }
  })
});


//Login Page Get and And Post Route
app.get("/login",function(req,res){
  res.render("login");
});

app.post("/login",function(req,res){
  const user = new User({
    username : req.body.username,
    password : req.body.password
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
      res.redirect("/login");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/userSecret");
      });
    }
  });
});



//Register Page Get and Post Route
app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  User.register({username : req.body.username}, req.body.password,function(err,user){
    if(!err){
      passport.authenticate('local')(req,res,function(err){
            console.log("User Registered");
                res.redirect('/userSecret');
          });
    }else{
      console.log(err);
      res.redirect("/register");
    }
  });
});


//Secret get and post Route

app.get("/userSecret",function(req,res){
  if(req.isAuthenticated()){
    //console.log(req.user.secret);
    res.render("compose",{ userSecret : req.user.secret});
  }else{
    res.render("login");
  }
});

app.post("/userSecret",function(req,res){
  const submittedSecret = req.body.secret;
  //console.log(req.user);
  User.findById(req.user.id, function(err,foundUser){
    if(!err){
      if(foundUser){
        foundUser.secret = submittedSecret;
        foundUser.save(function(err){
          if(!err){
            console.log("secrets Saved");
            res.redirect("/");
          }
        });
      }
    }
  });
});




app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});


app.listen(3000,function(req,res){
  console.log("Server started at Port 3000");
});
