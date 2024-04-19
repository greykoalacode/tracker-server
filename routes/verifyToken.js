const jwt = require('jsonwebtoken');

module.exports = function (req, res, next){
    // Get Auth Header value
    // const bearerHeader = req.header('authorization');
    const cookieSet = req.cookies;
    // console.log(cookieSet)
    // check if header is undefined
    if(typeof cookieSet !== 'undefined'){
        const token = cookieSet.token;
        try {
            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
            req.user = verified;
            next();
        } catch(err){
            if(err instanceof jwt.TokenExpiredError){
                return res.status(401).send('Token Expired')
            }
            else if (err instanceof jwt.JsonWebTokenError){
                return res.status(403).send('Web Token Error')
            }
            return res.status(400).send('Invalid token');
        }
    } else {
        res.sendStatus(403);
        // res.redirect()
    }

    // if(!token) return res.status(401).send('Access Denied');

    
}