var express = require("express");
var router = express.Router(); //used for exporting the routes
var Place = require("../models/place");
var User = require("../models/user");
var mongoose = require('mongoose');
var middleware = require("../middleware"); //automatically require the content of index js
var db = mongoose.connection;
//index campground
router.get("/",function(req,res)
{
    //get all campgrounds from db
    //req.user gives current user
    
    Place.find({},function(err,allPlaces)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("places/index",{data: allPlaces,currentUser: req.user});
        }
    });
    // res.render("campgrounds",{data: campgrounds});
});

router.get("/user",function(req,res)
{
    //get all campgrounds from db
    //req.user gives current user
    
    Place.find({},function(err,allPlaces)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("userDashboard/userdash",{data: allPlaces,currentUser: req.user});
        }
    });
    // res.render("campgrounds",{data: campgrounds});
});

router.get("/manager",function(req,res)
{
    //get all campgrounds from db
    //req.user gives current user
    
    Place.find({},function(err,allPlaces)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("managerDashboard/managerDash",{data: allPlaces,currentUser: req.user});
        }
    });
    // res.render("campgrounds",{data: campgrounds});
});

//making a new campground
router.post("/",middleware.isLoggedIn, function(req,res)
{
   //get data from from and add to campfround array
   var name=req.body.name;
   var image=req.body.image;
   var dsc=req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var val={name: name,image: image,description: dsc,author: author};
   //create a new campground and save to a database 
   Place.create(val,function(err,nval)
   {
       if(err)
       {
           console.log(err);
       }
       else
       {
           //redirect back to campground
           res.redirect("/places"); //default is a get request when redirecting so get method will run 
       }
   });
});

//a form to add new forms 
router.get("/new",middleware.isLoggedIn, function(req, res) 
{
    res.render("places/new");
});

//order is important
//shows more info about that campground
router.get("/:id",function(req, res) 
{
    //find the campground with id
    var id=req.params.id;
    //we use the populate function for this 
    Place.findById(req.params.id).populate("comments").exec(function(err,val)
    {
        if(err || !val)
        {
            console.log(err);
        }
        else
        {
            res.render("places/show",{val: val});
        }
    });
    //show template
});

router.get("/user/:id",function(req, res) 
{
    //find the campground with id
    var id=req.params.id;
    //we use the populate function for this 
    Place.findById(req.params.id).populate("comments").exec(function(err,val)
    {
        if(err || !val)
        {
            console.log(err);
        }
        else
        {
            res.render("userDashboard/addViewComment",{val: val});
        }
    });
    //show template
});

router.get("/manager/:id",function(req, res) 
{
    //find the campground with id
    var id=req.params.id;
    //we use the populate function for this 
    Place.findById(req.params.id).populate("comments").exec(function(err,val)
    {
        if(err || !val)
        {
            console.log(err);
        }
        else
        {
            res.render("managerDashboard/manager_comment",{val: val});
        }
    });
    //show template
});


//EDIT CAMPGROUND
router.get("/:id/edit",middleware.checkOwner,function(req, res) 
{
    Place.findById(req.params.id,function(err, val) 
    {
        if(err || !val)
        {
            res.redirect("back");
        }
        else
        {
            res.render("places/edit",{place: val}); 
        }
    });
});

router.post("/interested/:id",function(req, res) 
{

  console.log("----------------interested clicked------------------");

  Place.findById(req.params.id).exec(function(err,val)
   {
        if(err || !val)
        {
            console.log(err);
        }
        else
        {
          console.log("----------------in places interested----------------");
            var id=req.user._id;
            val.interested.push(id);
           // val.save();

             Place.update({ _id: req.params.id }, 
                                   { $addToSet: { interested:id } }, 
                                      function(err) { /*...*/ }
                          );

            User.findById(req.user._id).exec(function(err,val1)
             {
                  if(err || !val1)
                  {
                      console.log(err);
                  }
                  else
                  {
                    console.log("----------------in places interested----------------");
                      var placeid=req.params.id;
                      val1.interested.push(placeid);
                      //val1.save();
                       User.update({ _id: req.user._id }, 
                                   { $addToSet: { interested: placeid } }, 
                                      function(err) { /*...*/ }
                          );
                      res.redirect("/places/user");
                  }
              });
            
        }
    });
});

router.post("/confirm/:id",function(req, res) 
{

  console.log("----------------interested clicked------------------");

  Place.findById(req.params.id).exec(function(err,val)
   {
        if(err || !val)
        {
            console.log(err);
        }
        else
        {
          console.log("----------------in places interested----------------");
            var id=req.user._id;
            val.confirmed.push(id);
            //val.save();
             Place.update({ _id: req.params.id }, 
                                   { $addToSet: { confirmed:id } }, 
                                      function(err) { /*...*/ }
                          );
             User.findById(req.user._id).exec(function(err,val1)
             {
                  if(err || !val1)
                  {
                      console.log(err);
                  }
                  else
                  {
                    console.log("----------------in places interested----------------");
                      var placeid=req.params.id;
                      val1.confirmed.push(placeid);
                     // val1.save();
                      User.update({ _id: req.user._id }, 
                                   { $addToSet: { confirmed: placeid } }, 
                                      function(err) { /*...*/ }
                          );
                      res.redirect("/places/user");
                  }
              });
           
        }
    });
});

router.get("/getConfirmCount/:name",function(req, res) 
{
  var id= req.params.name; 
   console.log("here" + id);

/*  db.collection("places").aggregate({$match:{_id:req.params.id}},{$project:{count:{$size:"$interested"}}}, function(err, res) {
      if (err) throw err;
   //  console.log("1 document inserted " + query);
      console.log(res + " here");
      //db.close();
     // return 1;
  });*/


  Place.aggregate([
    { $match : { name : id } },
    { $project : { count : { $size : "$confirmed" } } }
    ]).exec(function(err, result) {
      if(err)
        throw err;
      console.log("count" + result);
      return res.json(result);
});
});


router.get("/getInterestedCount/:name",function(req, res) 
{
  var id= req.params.name; 
   console.log("here" + id);

/*  db.collection("places").aggregate({$match:{_id:req.params.id}},{$project:{count:{$size:"$interested"}}}, function(err, res) {
      if (err) throw err;
   //  console.log("1 document inserted " + query);
      console.log(res + " here");
      //db.close();
     // return 1;
  });*/


  Place.aggregate([
    { $match : { name : id } },
    { $project : { count : { $size : "$interested" } } }
    ]).exec(function(err, result) {
      if(err)
        throw err;
      console.log("count" + result);
      return res.json(result);
});
});


router.get("/isInterested/:name",function(req, res) 
{
  var id= req.params.name; 
  console.log("in isInterested" + req.user._id);
  var userid=req.user._id;
  // console.log("here" + req.user._id);


Place.find({$and:[{name:id},{"interested": {"$in":[userid] }}]}).exec(function (err, data){
        if(err){
            return console.log("error");
        } else {
          console.log("found" + data);
           return res.json(data);
        }
    });

 /* Place.find({name:id},{interested:req.user._id}).exec(function(err, result) {
      if(err)
        throw err;
      console.log("count" + result);
      return res.json(result);
});*/
});


router.get("/isConfirmed/:name",function(req, res) 
{
  var id= req.params.name; 
  console.log("here" + req.user._id);
  var userid=req.user._id;


Place.find({$and:[{name:id},{"confirmed": {"$in": [userid] }}]}).exec(function (err, data){
        if(err){
            return console.log("error");
        } else {
          console.log("found" + data);
           return res.json(data);
        }
    });

 /* Place.find({name:id},{interested:req.user._id}).exec(function(err, result) {
      if(err)
        throw err;
      console.log("count" + result);
      return res.json(result);
});*/
});

router.post("/showInterested",function(req,res){

       var id=req.user._id;
      console.log("in showInterested" +id);
     // res.render("userDashboard/showInterested");
        
        User.findById(id).populate("interested").exec(function(err,val)
        {
            if(err || !val)
            {
                console.log("~~~~~~~err~~~~~~~");
            }
            else
            {
                 console.log("~~~~~~~ no err~~~~~~~");
                res.render("userDashboard/showInterestedPlaces",{val: val});
            }
        });

});


router.post("/showConfirmed",function(req,res){

       var id=req.user._id;
      console.log("in showConfirmed" +id);
     // res.render("userDashboard/showInterested");
        
        User.findById(id).populate("confirmed").exec(function(err,val)
        {
            if(err || !val)
            {
                console.log("~~~~~~~err~~~~~~~");
            }
            else
            {
                 console.log("~~~~~~~ no err~~~~~~~");
                res.render("userDashboard/showConfirmedPlaces",{val: val});
            }
        });

});
router.post("/showInterestedUsers/:id",function(req,res){

       var id=req.params.id;
      console.log("in showInterestedUsers" +id);
     // res.render("userDashboard/showInterested");
        
        Place.findById(id).populate("interested").exec(function(err,val)
        {
            if(err || !val)
            {
                console.log("~~~~~~~err~~~~~~~");
            }
            else
            {
                 console.log("~~~~~~~ no err~~~~~~~");
                res.render("userDashboard/showInterestedUsers",{val: val});
            }
        });

});

router.post("/showConfirmedUsers/:id",function(req,res){

       var id=req.params.id;
      console.log("in showConfirmedUsers" +id);
     // res.render("userDashboard/showInterested");
        
        Place.findById(id).populate("confirmed").exec(function(err,val)
        {
            if(err || !val)
            {
                console.log("~~~~~~~err~~~~~~~");
            }
            else
            {
                 console.log("~~~~~~~ no err~~~~~~~");
                res.render("userDashboard/showConfirmedUsers",{val: val});
            }
        });

});

    
//UPDATE CAMPGROUND
router.put("/:id",middleware.checkOwner,function(req,res)
{
    
    Place.findByIdAndUpdate(req.params.id,req.body.camp,function(err,val)
    {
        if(err)
        {
            res.redirect("/places");
        }
        else
        {
            res.redirect("/places/"+req.params.id);
        }
    });
});
//DELETE CAMPGROUND
router.delete("/:id",middleware.checkOwner,function(req,res)
{
    Place.findByIdAndRemove(req.params.id,function(err)
    {
       if(err)
       {
           res.redirect("/places");
       }
       else
       {
           res.redirect("/places");
       }
    });
});

//middleware




module.exports = router;