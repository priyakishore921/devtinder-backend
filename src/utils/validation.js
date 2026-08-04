const validator = require("validator");

const validateSignupData = (req) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName) { 
        throw new Error("Name is not valid");
    }
    if (validator.isEmail(email) === false) {
        throw new Error("Email is not valid");
    }
    if (validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }) === false) {
        throw new Error("Password is not strong enough");
    }
}

const validateProfileEditData = (req) => {
    const allowedEditFields = ['firstName', 'lastName', 'photoUrl', 'gender', 'age', 'about', 'about', 'skills'];

    return Object.keys(req.body).every(field => allowedEditFields.includes(field))
}

module.exports = {
    validateProfileEditData,
    validateSignupData
};
