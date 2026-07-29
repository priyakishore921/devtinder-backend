const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 100,
    },
    lastName: {
        type: String,
        minLength: 1,
        maxLength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email format");
                }
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                if (validator.isStrongPassword(value, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
                    return true;
                } else {
                    throw new Error("Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol");
                }
            }
        }
    },
    gender: {
        type: String,
        lowercase: true,
        validate: {
            validator: function(value) {
                const validGenders = ["male", "female", "other"];
                if (!validGenders.includes(value)) {
                    throw new Error("Gender must be either male, female, or other");
                }
            },
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    photoUrl: {
        type: String,
        default: "https://img.magnific.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_test_b&w=740&q=80",
        validate: {
            validator: function(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid Photo URL format");
                }
            }
        }
    },
    about: {
        type: String,
        default: "This is a default about me section. You can update it later.",
    },
    skills: {
        type: [String],
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
