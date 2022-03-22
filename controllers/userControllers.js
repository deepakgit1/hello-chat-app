const asyncHandler = require('express-async-handler');
const generateToken = require('../config/generateToken');
const User = require('../model/userModel');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }
    const userExist = await User.findOne({ email })

    if (userExist) {
        res.status(400)
        throw new Error("User alredy Exist With this email")
    }
    const user = await User.create({
        name,
        email,
        password,
        pic,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        })

    } else {
        res.status(400)
        throw new Error("Faild to create user")
    }
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401)
        throw new Error("Invalid details ")
    }
});

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ]
    } : {};
    // console.log(keyword);

    const users = await User.find(keyword)
    res.send(users)

})

module.exports = { registerUser, authUser, allUsers }