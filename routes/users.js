 const mongoose=require("mongoose");
 var plm=require("passport-local-mongoose");
 mongoose.connect("mongodb://localhost:27017")
.then(function(){
    console.log("connected to db");
})
var userSchema= mongoose.Schema({
  username:String,
  name:String,
  gstin:String,
  isSeller:{
    type:Boolean,
    default:false
  },
  pic:String,
  address:String,
  contactnumber:String,
  email:String,
  password:String,
  products:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"product"
  }],
  wishlist:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"product"
  }],
})
userSchema.plugin(plm);
module.exports=mongoose.model("user",userSchema);