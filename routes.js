var express = require('express');
var jwt = require('jsonwebtoken');

var config = require('./config');
var User = require('./models/user');
var Seller = require('./models/seller');
var Buyer = require('./models/buyer');

var router = express.Router();

router.use(function(request, response, next) {
    console.log('Request %j recieved %s', request.body, dateDisplayed(Date.now()));
    next();
});

router.get('/', function(request, response) {
    response.json({message: 'Welcome to the REST API'});
});

router.post('/api/login', function(request, response) {
    User.findOne({email: request.body.email, password: request.body.password}, function(error, user) {
        if (error) {
            response.json({
                success: false,
                data: 'Error occured ' + error
            });
        } else {
            if (user) {
                response.json({
                    success: true,
                    data: user,
                    token: user.token
                });
            } else {
                response.json({
                    success: false,
                    error: 'Incorrect email/password'
                });
            }
        }
    });
});

router.post('/api/register', function(request, response) {
    User.findOne({email: request.body.email}, function(error, user) {
        if (error) {
            response.json({
                success: false,
                error: 'Error occured ' + error
            });
        } else {
            if (user) {
                // console.log(user);
                response.json({
                    success: false,
                    error: 'That user already exists'
                });
            } else {
                var userModel = new User();
                userModel.email = request.body.email;
                userModel.password = request.body.password;
                //console.log('before save 1: ' + userModel);
                userModel.save(function(error, userWithData) {
                    //console.log('post save 1: ' + userWithData);
                    var profile = {
                        email: userWithData.email,
                        _id: userWithData._id
                    }
                    userWithData.token = jwt.sign(profile, config.secret, {expiresIn: 60 * 60 * 24});
                    //console.log(userWithData.token)
                    //console.log('pre save 2: ' + userWithData);
                    userWithData.save(function(error, tokenedUser) {
                        response.json({
                            success: true,
                            data: tokenedUser,
                            token: tokenedUser.token
                        });
                    });
                });
            }
        }
    });
});

router.post('/api/test', function(request, response) {
    User.findOne({token: request.body.token}, function(error, user) {
        if (error) {
            response.json({
                success: false,
                error: 'Error occured ' + error
            });
        } else {
            if (user) {
                response.json({
                    success: true,
                    data: user
                });
            } else {
                response.send(403);
            }
        }
    });
});

router.post('/api/newSeller', function(request, response) {
    var nSeller = {
        email: request.body.email,
        idOfPost: request.body.idOfPost,
        eventDate: request.body.eventDate,
        author: request.body.author,
        price: request.body.price
    };
    //console.log(nSeller);

    var isComplete = true;
    for (key in nSeller) {
        isComplete = isComplete && (nSeller[key] !== undefined)
    }
    if (!isComplete) {
        Seller.find({}, function(error, sellers) {
            response.json({
                success: false,
                data: sellers,
                error: 'Insufficient data sent'
            });
        });
    } else {
        var sellerModel = new Seller();
        for (key in nSeller) {
            sellerModel[key] = nSeller[key];
        }

        Seller.findOne(nSeller, function(error, seller) {
            if (seller) {
                Seller.find({}, function(error, sellers) {
                    response.json({
                        success: false,
                        data: sellers,
                        error: 'That sell offer already exists'
                    });
                });
            } else {
                sellerModel.save(function(error, seller) {
                    Seller.find({}, function(error, sellers) {
                        response.json({
                            success: true,
                            data: sellers
                        });
                    });
                });
            }
        });
    }
});


router.post('/api/newBuyer', function(request, response) {
    var nBuyer = {
        email: request.body.email,
        idOfPost: request.body.idOfPost,
        eventDate: request.body.eventDate,
        author: request.body.author,
        price: request.body.price
    };
    //console.log(nBuyer);

    var isComplete = true;
    for (key in nBuyer) {
        isComplete = isComplete && (nBuyer[key] !== undefined)
    }
    if (!isComplete) {
        Buyer.find({}, function(error, buyers) {
            response.json({
                success: false,
                data: buyers,
                error: 'Insufficient data sent'
            });
        });
    } else {
        var buyerModel = new Buyer();
        for (key in nBuyer) {
            buyerModel[key] = nBuyer[key];
        }

        Buyer.findOne(nBuyer, function(error, buyer) {
            if (buyer) {
                Buyer.find({}, function(error, buyers) {
                    response.json({
                        success: false,
                        data: buyers,
                        error: 'That buy offer already exists'
                    });
                });
            } else {
                buyerModel.save(function(error, buyer) {
                    Buyer.find({}, function(error, buyers) {
                        response.json({
                            success: true,
                            data: buyers
                        });
                    });
                });
            }
        });
    }
});


router.post('/api/removeSeller', function(request, response) {
    var rSeller = {
        email: request.body.email,
        idOfPost: request.body.idOfPost,
        eventDate: request.body.eventDate,
        author: request.body.author,
        price: request.body.price
    };

    Seller.remove(rSeller, function(error1, removed) {
        Seller.find({}, function(error2, sellers) {
            response.json({
                success: !!removed.result.n,
                data: sellers
            });
        });
    });
});

router.post('/api/removeBuyer', function(request, response) {
    var rBuyer = {
        email: request.body.email,
        idOfPost: request.body.idOfPost,
        eventDate: request.body.eventDate,
        author: request.body.author,
        price: request.body.price
    };

    Buyer.remove(rBuyer, function(error1, removed) {
        //console.log(removed.result.n);
        Buyer.find({}, function(error2, buyers) {
            response.json({
                success: !!removed.result.n,
                data: buyers
            });
        });
    });
});


module.exports = router;

function dateDisplayed(timestamp) {
    var date = new Date(timestamp);
    return (date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
}

