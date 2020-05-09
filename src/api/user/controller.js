import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './model';

const ObjectId = mongoose.Types.ObjectId;

export const signup = (req, res, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error = new Error('Validation failed.');
                error.statusCode = 422;
                error.data = errors.array();
                throw error;
            }

            const hashedPw = await bcrypt.hash(req.body.password, 12);

            const user = new User({
                role: req.body.role,
                email: req.body.email,
                password: hashedPw,
                fullName: req.body.fullName,
                phone: req.body.phone,
                address: req.body.address
            });
            user.save();
            resolve(
                res.status(201).json({
                    status: 'Success',
                    data: user
                })
            )

        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    })
}

export const login = (req, res, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error = new Error('Validation failed.');
                error.statusCode = 422;
                error.data = errors.array();
                throw error;
            }

            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                const error = new Error('A user with this email is not found.');
                error.statusCode = 404;
                throw error;
            }
            const isEqual = await bcrypt.compare(req.body.password, user.password)
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }

            if (user.role === 'editor') {
                resolve(
                    res.status(200).json({
                        status: 'Success',
                        data: user
                    })
                )
            } else {
                const users = await User.find()
                resolve(
                    res.status(200).json({
                        status: 'Success',
                        data: users
                    })
                )
            }

        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    })
}

export const getUserById = (req, res, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userId = req.params.id
            const user = await User.findOne({ _id: ObjectId(userId) })
            if (!user) {
                const error = new Error('User not found.');
                error.statusCode = 401;
                throw error;
            } else {
                resolve(
                    res.status(200).json({
                        status: 'Success',
                        data: user
                    })
                )
            }
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }

    })
}