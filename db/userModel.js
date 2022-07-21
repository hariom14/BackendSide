const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:[true,"Email already exist"]
    },
    password:{
        type:String,
        required:true,
        unique:false
    },
    DOB:{
        type:Date,
        required:true
    },
    role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
    }
})

module.exports = mongoose.model("Users",userSchema)