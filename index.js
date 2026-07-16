const express = require("express");
const jwt=require("jsonwebtoken");
const JWT_SECRET="sana123"
const {UserModel , TodoModel}=require ("./db")
const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://sana602perween_db_user:sana12345@cluster0.z8crdti.mongodb.net/todosana-22");

mongoose.connection.once("open", () => {
    console.log("Connected to:", mongoose.connection.name);
});
const app=express();
app.use(express.json());
//signup
app.post("/signup",async function(req,res)
{
const email=req.body.email;
const password=req.body.password;
const name=req.body.name;
await UserModel.create({
    email:email,
    password:password,
    name:name
})
res.json({
    msg:"you are logged in"
})
})
//signin
app.post("/signin",async function(req,res){
     const email=req.body.email;
     const password=req.body.password;
     const user=await UserModel.findOne({
        email: email,
        password: password
     })
     console.log(user);
     if(user)
     {
        const token=jwt.sign(
            {
                id:user._id.toString()
            },JWT_SECRET);
        
        res.json({
            token:token
        });
    }
        else{
            res.status(403).json({
                msg:"invalid credentials"
            })
        }
     
})
app.post("/todo",auth, function(req,res)
{
const userId=req.userId;
const title=req.body.title;
TodoModel.create({
    title,
    userId
})
res.json({
    userId:userId
})
});
app.get("/todos",auth ,function(req,res)
{
  const userId=req.userId;
  const todos= TodoModel.find({
    userId:userId
  })
  res.json({
    todos:todos
  })
});
function auth(req,res,next)
{
    const token=req.headers.token;
    const decodeddata=jwt.verify(token,JWT_SECRET);
    if(decodeddata)
    {
        req.userId=decodeddata.id;
        next();
    }
    else{
        res.status(403).json({
            msg:"incorrect credentials"
        })
    }
}


app.listen(3000);