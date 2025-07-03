const jwt=require('jsonwebtoken');
const jwtAuthMiddleware=(req,res,next)=>{
    const authorization = req.headers.authorization;
    // console.log("=======>token",authorization)
    if(!authorization) return res.status(401).json({error: 'Token Not Found'});

    const token = req.headers.authorization.split(' ')[1];
    // console.log("token here",token);
    if(!token) return res.status(401).json({error:'Unauthorize'});

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Invalid token'});
    }
}

//generate jwt token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET);
};


module.exports={jwtAuthMiddleware,generateToken};