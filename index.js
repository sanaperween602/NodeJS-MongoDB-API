const express = require("express");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const JWT_SECRET="sana123"
const {UserModel , TodoModel}=require ("./db")
const mongoose=require("mongoose");
const {z}=require("zod");
mongoose.connect("mongodb+srv://sana602perween_db_user:daniyal602@cluster0.z8crdti.mongodb.net/todosana-22");

mongoose.connection.once("open", () => {
    console.log("Connected to:", mongoose.connection.name);
});
const app=express();
app.use(express.json());
//signup
app.post("/signup",async function(req,res)
{
    const requiredbody=z.object({
        email:z.string(),
        name:z.string(),
        password:z.string()
    })
    const parsedDataWithSuccess=requiredbody.safeParse(req.body);
    if(!parsedDataWithSuccess.success){
        res.json({
            msg:"incorrect format"
        })
        return 
    }
const email=req.body.email;
const password=req.body.password;
const name=req.body.name;
let errorThrown=false;
try{
const hashedpassword=await bcrypt.hash(password,5);
console.log(hashedpassword);
await UserModel.create({
    email:email,
    password:hashedpassword,
    name:name
});
// throw new error("user already exists")
} catch (e) {
    

    res.json({
        msg: "user already exist"
    });

    errorThrown = true;
}
if(!errorThrown){
    res.json({
        msg:"you are signed up"
    })
}

})
//signin
app.post("/signin",async function(req,res){
     const email=req.body.email;
     const password=req.body.password;
     const response =await UserModel.findOne({
        email: email
        
     })
     console.log(response);
     if(!response){
        res.status(403).json({
            msg:"user does not exist in our DataBase"
        })
        return
     }

     const passwordmatch=await bcrypt.compare(password,response.password);
     if(passwordmatch){
     
        const token=jwt.sign(
            {
                id:response._id.toString()
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
  const todos=  TodoModel.find({
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