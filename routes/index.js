var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var expressValidator = require('express-validator');
router.use(expressValidator())
//main route
router.get("/",function(req,res)
{
    res.render("landing");
});

//Auth routes
//show register
router.get("/register",function(req, res) 
{
    res.render("register");
});

router.post('/register', function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var contact = req.body.contact;
    //var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    //req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        res.render('register');
    } else {
        // var newUser = new User({
        //  name: name,
        //  email:email,
        //  username: username,
        //  password: password
        // });

        User.register(new User({username: req.body.username,email: email,name: name,contact: contact}), req.body.password, function(err,user)
        {
        if(err)
        {
            console.log(err);
            console.log("registration failed");
            return res.render('register');
        }
         passport.authenticate("local")(req,res,function()
        {
            req.flash("success","Welcome to UNOVOYAGE "+user.username);
            res.redirect("/places/user");
        });

        });

       
        //res.redirect("/login");


    }

});




//show login form
router.get("/login",function(req, res) 
{
    res.render("login");    
});

/*
router.get("/admin",function(req,res){

     Admin.register(new User({username: "admin"}), "admin", function(err,user)
    {
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("/register");
        }
        //if no error then authenticate the user 
        passport.authenticate("local")(req,res,function()
        {
            req.flash("success","Welcome to UNOVOYAGE "+user.username);
            
        });
    });
})
*/
//use middleware
router.post("/login",passport.authenticate("local",
    {
        successRedirect: "/places/user",
        failureRedirect: "/login",
        failureFlash: "Invalid Credentials"
    }),function(req,res)
    {
        
    });
    
router.get('/edit', function(req, res){
    
    
    res.render('editCredentials',{error:false,message: 'valid'});
});

router.put('/edit', function(req, res){
    var email = req.body.email;
    var name = req.body.name;
    var contact = req.body.contact;
    var username = req.body.username;
    // Validation
    
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    //req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    User.findById(req.user._id,function(err,val)
    {
        if(err)
        {
            res.redirect("/");
        }
        else
        {
            val.email = email;
            val.name = name;
            val.contact = contact;
            val.username = username;
            val.save();
            res.redirect("/logout");
        }
    });
    // var errors = req.validationErrors();
    
    //     if(errors){
    //         res.render('editCredentials');
    //     }
    //      else {
    //         var newUser = new User({
    //             name: name,
    //             email:email,
    //             username: uname,
    //             password: password,
    //             contact: contact
    //         });

    //         User.deleteUser(newUser, function(err, user){
    //             if(err) throw err;
    //             console.log(user);

    //         });
    //         User.createUser(newUser, function(err, user){
    //             if(err) throw err;
    //             console.log(user);

    //         });

    //         req.flash('success_msg', 'You are registered and can now login');

    //         res.redirect("/login");
    //     }
       

});





//logout route
router.get("/logout",function(req, res) {
    req.logout();
    req.flash("success","logged you out");
    res.redirect("/adminlogin");
});

function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated()) //checks if user is authenticated or not 
    {
        return next;
    }
    res.redirect("/login");
}

module.exports = router;