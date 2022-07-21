const express =  require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const dbConnect = require('./db/db.config');
const User = require('./db/userModel')
const Blog = require('./db/blogModel')
dbConnect();

const app = express();
app.use(express.json());

// Register user
app.post("/register",async(req,res)=>{
    const {firstName,lastName,email,password,DOB,role} = req.body
    const hashedPwd = await bcrypt.hash(password,10)
    if(hashedPwd){
        const user = new User({
            firstName,
            lastName,
            email,
            password:hashedPwd,
            DOB,
            role
        });

        const resp = await user.save();
        if(!resp){
            return res.status(500).send({
                msg:"Internal server error",
                error:true
            });
        }
        else{
            return res.status(201).send({
                msg:"User created successfully",
                resp
            });
        }
    }
})

// Login user
app.post("/login",async(req,res)=>{

    const {email,password}= req.body;

    const emailResp = await User.findOne({email})
    if(!emailResp){
        return res.status(404).send({
            msg:"Email not found",
            err:false
        });
    }
    else{
       const result = await bcrypt.compare(password,emailResp.password)
       if(!result){
            return res.status(400).send({
                msg:"Password does not match",
                error
            })
        }
        else{
            const token = jwt.sign({
                userId:emailResp._id,
                userEmail:emailResp.email,
                userRole:emailResp.role
            },
            "RANDOM-TOKEN-HARIOM",
            {
                expiresIn:"24h"
            }
            );

            res.status(200).send({
                msg:"Login successful",
                email:emailResp.email,
                token
            })
        }
    }

})

// Get Blogs 
app.get("/get-blogs",auth,async(req,res)=>{
    const { userId,userEmail,userRole}=req.user;
    let filter = {};
    if(req.query.author){
        filter.author=req.query.author
    }
    if(req.query.category){
        filter.category=req.query.category
    }
    if(userRole==="ADMIN"){
        const blogs = await Blog.find(filter)
        if(blogs && blogs.length){
            return res.status(200).send({
                msg:"Blogs",
                blogs
            })
        }
        else{
            return res.status(400).send({
                msg:"No blogs found",
                error:false
            })
        }
    }
    else{
        filter.userId=userId;
        const result = await Blog.find(filter);
        if(result && result.length){
            return res.status(200).send({
                msg:"Blogs",
                result
            })
        }
        else{
           return res.status(400).send({
                msg:"No blogs found",
                error:false
            })
        }
    }

})

// Create Blog
app.post("/create-blog",auth,async(req,res)=>{
    const {userId,userEmail,userRole} = req.user;
    const {title,description,publishedDate,modifyDate,status,author}=req.body;

    const blog = new Blog({
        userId,
        title,
        description,
        publishedDate,
        modifyDate,
        status,
        author
    })

    const resp = await blog.save();
    if(resp){
       return res.status(201).send({
            msg:"Blog created successfully",
            result
        });
    }
    else{
        return res.status(500).send({
            msg:"Internal server error",
            error:true
        });
    }
})

// Update Blog
app.put("/update-blog/:blogId",auth,async (req,res)=>{
    const {blogId}=req.params;
    const {userId,userEmail,userRole}=req.user;
    const {title,description,modifyDate,status,author}=req.body;


    const blog = await Blog.findOne({_id:mongoose.Types.ObjectId(blogId)})
    if(!blog){
        return res.status(404).send({
            msg:"Blog not found",
            error:false
        })
    }
    else{
        if(userRole ==="ADMIN"){
            const resp = await Blog.updateOne({_id:mongoose.Types.ObjectId(blogId)},{title,description,modifyDate,status,author})
            if(result.acknowledged){
                return res.status(200).send({
                    msg:"Blog updated successfully",
                    error:false
                }); 
            }
            else{
                return res.status(200).send({
                    msg:"Internal server error",
                    error:true
                }); 
            } 
        }
        else{
            const result = await Blog.updateOne({_id:mongoose.Types.ObjectId(blogId),userId},{title,description,modifyDate,status,author})
            if(result.acknowledged){
                return res.status(200).send({
                    msg:"Blog updated successfully",
                    error:false
                }); 
            }
            else{
                return res.status(500).send({
                    msg:"Internal server error",
                    error:true
                });
            }  
        }
    }
})

// Delete Blog
app.delete("/delete-blog/:blogId",auth,async(req,res)=>{
    const {blogId}=req.params;
    const {userId,userEmail,userRole}=req.user;
    const {title,description,modifyDate,status,author}=req.body;


    const blog = await Blog.findOne({_id:mongoose.Types.ObjectId(blogId)})
    if(!blog){
        return res.status(404).send({
                        msg:"Blog not found",
                        error:false
                    })
    }
    else{
        if(userRole ==="ADMIN"){
            const resp = await Blog.deleteOne({_id:mongoose.Types.ObjectId(blogId)})
            if(resp.acknowledged){
                return res.status(200).send({
                    msg:"Blog deleted successfully",
                    error:false
                });  
            }
            else{
                res.status(500).send({
                    msg:"Internal server error",
                    error:true
                });
            }
        }
        else{
           const response = await Blog.deleteOne({_id:mongoose.Types.ObjectId(blogId),userId})
           if(response.acknowledged){
                return res.status(200).send({
                    msg:"Blog deleted successfully",
                    error:false
                });  
            }
            else{
                res.status(500).send({
                    msg:"Internal server error",
                    error:true
                });
            }
        }
    }
})

app.listen(9000, ()=>{
    console.log("Server started on port 9000");
})
