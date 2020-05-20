import express from 'express';
import { body } from 'express-validator';

import User from './model';

import { signup, login, getUserById, getUserList, tokenValidation } from './controller';

const router = express.Router();

router.post('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-mail address already exists!');
                }
            });
        })
        .normalizeEmail(),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be 8 characters'),
    body('role').trim().not().isEmpty().withMessage('Role is missing.')
],
    signup);

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email.'),
],
    login);

router.get('/single/:id', tokenValidation, getUserById);

router.get('/userList', tokenValidation, getUserList);



export default router;