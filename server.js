const express=require('express');
const app=express();
const router=express.Router();
const path=require("path");
const logger=require('morgan');
const multer =require('multer');
const upload=multer({dest:"./public/uploads"});

//application-level middleware
const loggerMiddleware=(req, res, next)=>{
    console.log(`${new Date()} --- [${req.method}] --- [${req.url}]`);
    next();
}
app.use(loggerMiddleware);

//built-in middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/static",express.static(path.join(__dirname, "public")))

//error-handling middleware
const errorHandler=(err, req, res, next)=>{
    const statusCode=res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    switch (statusCode){
        case 401:
            res.json({
                title:"Unauthorized",
                message:err.message
            });
        case 404:
            res.json({
                title:'Not Found',
                message:err.message
            });
        case 500:
            res.json({
                title:'Server error',
                message:err.message
            })
        }
}

//router - level middleware
app.use('/api/users',router);

app.use(logger('combined'));
const fakeAuth=(req,res,next)=>{
    const auth=true;
    if(auth){
        console.log(`user authentication is ${auth}`);
        next();
    }
    else{
        res.status(401);
        throw new Error('User authentication failed');
    }
}

router.use(fakeAuth);


const getUsers=(req, res)=>{
    res.json({message:'Get all users'});
    console.log(path.join(__dirname, "public"));
    
}

const createUsers=(req, res)=>{
    res.json({message:`create users  ${req.body.name}--${req.body.profession}`});
}


router.route('/').get(getUsers).post(createUsers);

//third-party middleware
app.post('/upload', upload.single('image'),
(req,res,next)=>{
    console.log(req.file, req.body);
    res.send(req.file);
},
(err, req, res,next)=>{
    res.status(400).send({err:err.message});
}
)

app.all('*', (req, res)=>{
    res.status(404)
    throw new Error('Route not Found')

})

app.use(errorHandler);

app.listen(5001, ()=>console.log('server is started on 5001...'));