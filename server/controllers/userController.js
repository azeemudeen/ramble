const User = require('../models/userModel');
const bcrypt = require('bcrypt');

module.exports.register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck) {
            return res.json({ msg: "Username already exist", status: false });
        }

        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.json({ msg: "Email already exist", status: false });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            username,
            password: hashPassword
        });

        delete user.password;
        return res.json({ status: true, user });
    } catch (ex) {
        next(ex);
    }
}

module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ msg: "Incorrect username or Password!", status: false });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ msg: "Incorrect username or Password!", status: false });
        }
        delete user.password;
        return res.json({ status: true, user });
    } catch (ex) {
        next(ex);
    }
};

module.exports.setAvatar = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(
            userId,
            {
                isAvatarImageSet: true,
                avatarImage,
            },
            { new: true }
        );

        return res.json({
            isSet: userData.isAvatarImageSet,
            image: avatarImage
        });
    } catch (error) {
        next(error);
    }
};

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.params.id } }).select([
            "email",
            "username",
            "avatarImage",
            "__id",
        ]);
        return res.json(users);
    } catch (err) {
        next(err)
    }
};