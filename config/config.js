const multer=require("multer");
const path=require("path");
const crypto=require("crypto");

const userimages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/userimages/')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(14,function(err,buff){
            var fn=buff.toString("hex")+path.extname(file.originalname); 
            cb(null,fn);
        })
    }
  });
  const productimage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/productimages/')
      },
      filename: function (req, file, cb) {
          crypto.randomBytes(14,function(err,buff){
              var fn=buff.toString("hex")+path.extname(file.originalname);
              cb(null,fn);
          })
      }
  });
  
//   const upload = multer({ storage: storage })
module.exports={userimages,productimage}