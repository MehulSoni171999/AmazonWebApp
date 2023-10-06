var mongoose=require("mongoose");
var productSchema=mongoose.Schema({
    sellerid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    name:String,
    pic:{
        type:Array,
        default:[]
    },
    desc:String,
    price:Number,
    discount:{
        type:Number,
        default:0
    }
});
module.exports=mongoose.model("product",productSchema);