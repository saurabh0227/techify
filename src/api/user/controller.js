import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
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

            const token = await jwt.sign({
                email: user.email,
                userId: user._id.toString(),
                role: user.role
            }, 'somesupersecretsecret',
                { expiresIn: '1h' }
            );

            resolve(
                res.status(200).json({
                    token: token
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

export const getUserList = (req, res, next) => {
    return new Promise(async (resolve, reject) => {
        try {
            const role = req.role
            const user = role === 'admin'
                ? await User.find()
                : await User.findOne({ _id: ObjectId(req.userId) })
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

export const tokenValidation = (req, res, next) => {
    const authHeader = req.get('Authorization')
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretsecret');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        err.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    req.role = decodedToken.role;
    next();
}