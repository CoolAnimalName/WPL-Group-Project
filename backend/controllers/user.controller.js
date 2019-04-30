const User = require('../models/user.model');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

exports.user_create = function (req, res, next){
    User.find({
        email: req.body.email
    }).exec().then(user => {
        if (user.length >= 1){
            return res.status(409).json({
                message: "Mail id already exists"
            });
        }else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error : err
                    });
                }else {
                    const user = new User({
                        _id : new mongoose.Types.ObjectId(),
                        username : req.body.username,
                        user_type: req.body.user_type,
                        email : req.body.email,
                        password : hash
                    });
                    user.save().then(result => {
                        console.log(result);
                        res.status(201).json({
                            message : "User Created Successfully "
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    });
   
};

exports.user_login = function (req, res, next){
    User.find({email: req.body.email}).exec().then(user => {
        if(user.length< 1){
            return res.status(401).json({
                message : "Authorization failed"
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result)=> {
            if (err){
                return res.status(401).json({
                    message : "Authorization failed"
                }); 
            }
            if (result){
                const token = jwt.sign({
                    email: user[0].email,
                    userId:user[0]._id
                }, "ecommercewebsite",{
                    expiresIn: "24h"
                });
                return res.status(200).json({
                    message : "Authorization successful",
                    token : token,
                    userId: user[0]._id,
                    user_type : user[0].user_type,

                    status: 200
                })
            }
            res.status(401).json({
                message : "Authorization failed"
            });
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
        error: err
        });
    });
};

exports.user_delete = function (req, res, next){
    User.remove({_id : req.body.userId}).exec().then(result => {
        res.status(200).json({
            message : " User deleted"
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
        error: err
        });
    });
} 
