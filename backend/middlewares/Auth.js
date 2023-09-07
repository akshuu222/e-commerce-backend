const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");

const isAuth = async (req,res,next)=>{
   try {
     const {token} = req.cookies;
     if(!token) return next(new ErrorHandler("Please Login To Excess The Resource" , 401))
     const decodedid = jwt.verify(token,process.env.JWT_PASSWORD) 
     req.user = await User.findById(decodedid.id);
     next()
   } catch (error) {
      next(error)
   } 
}

const authoriseRoles =  (...roles)=>{
   try {
      return (req,res,next)=>{
           if(!roles.includes(req.user.role))
           {
            return next(new ErrorHandler(`Role ${req.user.role} is Not Allowed To Access This Resource ` , 403))
           }
           next()
      }
   } catch (error) {
       next(error)
   } 
}

module.exports = {isAuth , authoriseRoles}