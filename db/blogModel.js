const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    userId:{
        type:String
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    published_at:{
        type:Date,
    },
    modify_at:{
        type:Date,
    },
    status:{
        type:String,
        enum:['PUBLISH','UN-PUBLISH'],
    },
    category:{
        type:String,
        enum:['EDUCATION','SPORTS','HOUSEHOLD','POLITICS','RELIGIOUS'],
    },
    author:{
        type:String,
        required:true
    },
})

module.exports = mongoose.model("Blogs",blogSchema)