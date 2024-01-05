import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document{
	name: string;
	email: string;
	password: string;
	avatar:{
		public_id: string;
		url: string;
	},
	role: string;
	isVerified: boolean;
	courses: Array<{courseId: string}>;
	comparePassword: (password:string) => Promise<boolean>;
};

const userSchema: Schema<IUser> = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please enter your name"],
	},
	email: {
		type: String,
		required: [true, "Please enter your email"],
		validate: function (value:string){
			return emailRegexPattern.test(value);
		},
		message: "please enter a valid email",
	},
	password: {
		type: String,
		required: [true, "please enter your password"],
		minlength: [6, "password must be atleast 6 charecters"],
		select: false,
	},
	avatar: {
		public_id: String,
		url: String,
	},
	role: {
		type: String,
		defualt: "user",
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	courses: [
		{
			courseId: String,
	}
],
},{timestamps:true});

// Hash Passwords

userSchema.pre<IUser>('save', async function (next){
	if(!this.isModified('password')){
		next();
	}
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Compare Passwords

userSchema.methods.comparePassword = async function(enteredPassword: string) {
	return await bcrypt.compare(enteredPassword, this.password)
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;