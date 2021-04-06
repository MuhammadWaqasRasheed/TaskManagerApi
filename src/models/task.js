const mongoose = require('mongoose')
const validator = require('validator')
const chalk = require('chalk');

const taskSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true,
        minlength:2
    },
    desc:{
        type:String,
        trim:true,
        required:true,
        minlength:2 
    },
    status:{
        type:Boolean,
        required:true,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})


const Task = mongoose.model('Task',taskSchema)

module.exports = Task