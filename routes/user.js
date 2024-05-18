const express = require('express');
const zod = require("zod")
const { user, Account } = require("../db")
const { JWT_SECRET  } = require('../config') 
const jwt = require("jsonwebtoken")
const { authMiddleware } = require('../middleware');
const router = express.Router();

const signupSchema = zod.object({
    username:zod.string().email(),
    firstName:zod.string(),
    lastName:zod.string(),
    password:zod.string()
})


router.post("/signup" ,  async (req,res) => {

    try{

        const {success , data , error} = signupSchema.safeParse(req.body)
        if(!success){
            return res.json({
                message:"Incorrect inputs"
            })
        }
        
        const existingUser = await user.findOne({
            username:data.username
        })
        
        if(existingUser){
            return res.json({
                message:"Email/username already taken" 
            })
        }
        
        const dbUser= await user.create({
            username:req.body.username,
            password:req.body.password,
            firstName:req.body.firstName,
            lastName:req.body.lastName,
        });
        
        const userId = dbUser._id;
        
        await Account.create({
            userId,
            balance:1+Math.random()*10000
        })
        console.log("JWT_SECRET:",JWT_SECRET);
        const token = jwt.sign({
            userId
            
        },JWT_SECRET)
        res.json({
            message:"user created successfully",
            token:token
        })
    }
    catch(error){
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Incorrect inputs"
        });
    }
        
});
    
const signinBody = zod.object({
    username:zod.string(),
    password:zod.string()

})



router.post("/signin" , async (req,res) => {
    const {success} = signinBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            message:"Email already taken / invalid inputs"
        })
    }

    const dbUser = user.findOne({
        username:req.body.username,
        password:req.body.password
    })
    // const userId = dbUser._id;
    // await Account.findOne({
    //     userId
    // })

    if(dbUser){
        const token = jwt.sign({
            userId:dbUser._id
        },JWT_SECRET)

        res.json({
            token:token
        })
        return;

    }else{
        res.status(411).json({
            message:"Error while logging in"
        })
    }

    
})


const updateBody = zod.object({
    password:zod.string().optional(),
    firstName:zod.string().optional(),
    lastName:zod.string().optional()
})

router.post('/' , authMiddleware , async ( req,res)=>{
    const {success} = updateBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            message: "Error while updating information"
        })
    }
    
    await user.updateOne({_id:req.userId} , req.body);

    res.json({
        message:"updated successfully"
    })
})



router.get("/bulk" , async ( req,res)=>{
        const filter =  req.query.filter || "";

        const users = await user.find({
            $or:[{
                firstName:{
                    "$regex": filter
                }
            }, {
                 lastName:{
                    "$regex": filter

                }
            
            }]
        })


    res.json({
        user:users.map(user =>({
            username:user.username,
            firstName:user.firstName,
            lastName:user.lastName,
            _id:user._id
        }))
    })
})




module.exports = router;