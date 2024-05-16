const mongoose = require("mongoose")
const { number, string } = require("zod")

mongoose.connect('mongodb+srv://pavan29903:KDh4bQVNIY2f1u2M@cluster0.v4h0ffo.mongodb.net/Paytm')

const userSchema = new mongoose.Schema({
      username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLength:20
      },
      password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
})

const user = mongoose.model('user',userSchema)


const accountSchema = new mongoose.Schema({
      userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:user,
        required:true
      },
      balance:{
        type:Number,
        required:true
      }
})

const Account = mongoose.model('Account' , accountSchema)


module.exports={
  user,
  Account
} 