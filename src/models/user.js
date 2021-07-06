const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is Invalid")
            }
        }
    },
    password : {
        type : String,
        required : true,
        minlength : 7,
        trim : true,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error('Password Not Acceptable')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value) {
            if(value < 0){
                throw new Error("Age must be a Positive Number")
            }
        }
    },awatar : {
        type : Buffer
    },
    tokens : [{
        token : {
            type : String,
            require : true
        }
    }]
},{
    timestamps : true
})

userSchema.virtual('anyName',{
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON = function() {
    const userObject = this.toObject()
    
    delete userObject.password
    delete userObject.tokens

    return userObject
}

// Generate JWT
userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ _id : this._id.toString()},process.env.JWT_SECRET)

    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
}


userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email : email})
    if(!user){
        throw new Error('Unable to Login')
    }

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return user
}

userSchema.pre('save',async function (next){

    if(this.isModified('password')){
        this.password  = await bcrypt.hash(this.password,8)
    }

    next()
})

// Delete user tasks when user is removed.
userSchema.pre('remove',async function(next) {
    await Task.deleteMany({owner : this._id})    
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User


