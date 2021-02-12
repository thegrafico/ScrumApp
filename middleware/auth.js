/**
 * Main auth middleware
 */

 module.exports.isUserLogin = (req, res, next) =>{
    if (req.isAuthenticated()){
        next();
    }else{
        res.redirect("/login");
    }
 }