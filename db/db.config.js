require('dotenv').config();
const mongoose = require('mongoose');

async function dbConnect(){
    mongoose.connect(process.env.DBURL,{

    })
    .then(()=>{
        console.log("Database connected successfully");
    })
    .catch((error)=>{
        console.log(error);
    });
}

module.exports= dbConnect;