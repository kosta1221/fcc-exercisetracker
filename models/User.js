const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

console.log("connecting to", uri);

mongoose
	.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB", error.message);
	});

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		minLength: 3,
		unique: true,
		required: true,
	},
	exercises: [],
});

userSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		delete returnedObject.__v;
	},
});

module.exports = mongoose.model("User", userSchema);
