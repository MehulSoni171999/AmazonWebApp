var express = require('express');
var router = express.Router();
var userModel=require("./users");
var productModel=require("./product");
var config=require("../config/config");
const multer=require("multer");
var userimage=multer({storage:config.userimages});
var productimage=multer({storage:config.productimage});
const passport=require("passport");
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', redirectToProfile, function(req, res, next) {
     res.render("registerLoginuser");
});
router.get("/register",function(req,res){
  res.redirect("/");
})
//yaha par register function ho gya hai 
router.post("/register",function(req,res){
    var newUser = new userModel({
        username:req.body.username,
        name:req.body.name,
        isSeller:req.body.isSeller,
        contactnumber:req.body.contactnumber,
        email:req.body.email,
    });
   userModel.register(newUser,req.body.password).then(function(u){
      console.log(u);
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
   });
});

//THIS IS A PROFILE PAGE WHERE VENDOR SEE HOW MANY PRODUCT IT CAN CREATED 
router.get("/profile",isLoggedIn, async function(req,res){
  let user= await userModel.findOne({username:req.session.passport.user})
  .populate("products");
  let ans=user.toJSON();
  let verified =true;
  console.log(ans);
  var ignore=["products","wishlist"];
  for(let val in ans){
    if(ignore.indexOf(val)===-1 && ans[val].length===0){
        verified=false;
    }
  }
  console.log(verified);
  res.render("profile",{userdata:user,verified});
})
//This code is a Mart page route where we are Showing All products 
router.get("/mart",isLoggedIn, async function(req,res){
   let allProducts= await productModel.find().limit(8).populate("sellerid");
   res.render("mart",{allProducts});
})
//This Code for the product page in which only vendor created product is showed
router.get("/product",isLoggedIn, async function(req,res){
  let loginuser= await userModel.findOne({username:req.session.passport.user});
  let allProducts= await productModel.find();
  res.render("vendorProduct",{allProducts,loginuser});
})
//LOGIN KA CODE HAI YE 
router.post("/login",passport.authenticate("local",{
   successRedirect:"/profile",
   failureRedirect:"/"
}),function(res,req,next){})
//LOGOUT KA CODE HAI 
router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
// verify routes
router.get("/verify",isLoggedIn, async function(req,res){
    let user= await userModel.findOne({username:req.session.passport.user});
       res.render("verifyuser",{userdata:user});
})
router.post("/verify",isLoggedIn, async function(req,res,next){
    // let user= await userModel.findOne({username:req.session.passport.user});
    let data={
      username:req.body.username,
      name:req.body.name,
      isSeller:req.body.isSeller,
      email:req.body.email,
      contactnumber:req.body.contactnumber,
      gstin:req.body.gstin,
      address:req.body.address,
    }
   let updateduser=  await userModel.findOneAndUpdate({username:req.session.passport.user},data);
   console.log(updateduser);
   res.redirect("/profile");
})
/*------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*-----------------------------------------NOW WORKING ON SECOND DATABASE PRODUCT DATABASE-------------------------------------------------------------------*/
//SHOW THE CREATE PRODUCT PAGE HERE 
router.post("/create/product",isLoggedIn,productimage.array("images",3),async function(req,res,next){
     let user=  await userModel.findOne({username:req.session.passport.user});
      if(user.isSeller){ 
        const productData={
            sellerid:user._id,
            name:req.body.name,
            pic:req.files.map(fn=>fn.filename),
            desc:req.body.desc,
            price:req.body.price,
        }
        let userproductmodel=await  productModel.create(productData);
        user.products.push(userproductmodel._id);
        await user.save();
        console.log(user);
        res.redirect("back");
      }else{
           res.send("yor don't have a vendor Account");
      } 
});
//delete the product
router.get("/delete/product/:id",isLoggedIn,async function(req,res){
  let product= await productModel.findOne({_id:req.params.id}).populate("user");
  let user= await userModel.findOne({username:req.session.passport.user});

  if(product.sellerid.username=== user.username){
    await productModel.findOneAndDelete({_id:req.params.id})
    user.products.splice(user.products.indexOf(product._id),1);
    user.save();
  }
  res.redirect("/profile");
})
//wishlist 
router.get('/wishlist/product/:id',isLoggedIn,async function(req,res){
  let user= await userModel.findOne({username:req.session.passport.user});
  user.wishlist.push(req.params.id)
  await user.save();
  res.render("wishlist")
})
//UPLOAD PROFILE PHOTO
router.post('/upload',isLoggedIn,userimage.single("image"),async function(req,res){
  let user= await userModel.findOne({username:req.session.passport.user});
  user.pic = req.file.filename;
  await user.save();
  res.redirect("/profile");
})
// LOGGED FUNCTION
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect("/");
  }
};
/*
 THIS IS THE REDIRECT FUNCTION 
 THIS FUNCTION IS THE MIDDLEWARE FOR THE / PAGE FUNCTION IF THE USER IS LOGGED THEN 
 IT WILL NOT COMEBACK EVERY TIME ON THE LOGIN PAGE UNTIL UNLESS IT WILL LOGOUT  
*/
function redirectToProfile(req,res,next){
   if(req.isAuthenticated()){
      res.redirect("/profile");
   }else{
      return next();
   }
}

module.exports = router;
