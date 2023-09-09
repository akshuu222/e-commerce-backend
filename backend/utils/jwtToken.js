const sendToken = async (user, res, statusCode, message , next) => {
   try {
    const token = user.getToken();
    const options = {
      httpOnly: true,
      sameSite: "none", 
      secure:true,
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
    };
   
    res
      .status(statusCode)
      .cookie("token", token, options)
      .json({ success: true, message, user });
   } catch (error) {
      return next(err)
   }
};
module.exports = sendToken;
