'use strict';
var express         = require('express');
var app             = express();
var http            = require("http");

var fs              = require('fs');
var request         = require('request');
var firebase        = require("firebase");

// Firebase Config
var config = {
    apiKey: "AIzaSyCfCoy3KRxV25sCv42Ua7JIFsGx9vp_nTk",
    authDomain: "blockgeeks-e61a4.firebaseapp.com",
    databaseURL: "https://blockgeeks-e61a4.firebaseio.com",
    projectId: "blockgeeks-e61a4",
    storageBucket: "blockgeeks-e61a4.appspot.com",
    messagingSenderId: "192439168836"
};
firebase.initializeApp(config);

// Var to hold the most current MarketCaps of the CCYs
var crt_mkt_cap = [];
var new_mkt_cap = [];
var mkt_caps_sum = 0;

// Get our current array of key value pairs of CCYs and their MktCaps
var currentArray = function(req, res, next) {
    firebase.database().ref('/ticker_new_value').once('value').then(function(snap){
        var orgArr = snap.val();
        // console.log(orgArr);
        queryCurrentPrices(orgArr);
    });
    // next();
};

// Get these CCYs' current live market caps
//
// Creates a local array of upated/current market caps of the CCYs
var queryCurrentPrices = function(tickerArr) {
    for(var i = 0; i < 5; i++) {
        var ticker = Object.keys(tickerArr[i])[0];
        // console.log("Ticker: " + ticker);
        requestFunction(ticker, i);
    }
}
    // Helper Request function, for the above function
    // & Function to sum the market caps
    var requestFunction = function(tick, index) {
        // request('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + tick + '&tsyms=USD', function (error, response, body, ticker) {
        request('https://api.coinmarketcap.com/v1/ticker/' + tick + '/', function (error, response, body, ticker) {
            // console.log(body);
        
            var daObj = {};
            daObj[tick] = parseInt(JSON.parse(body)[0].market_cap_usd);
            console.log(daObj);
            crt_mkt_cap.push(daObj);
            mkt_caps_sum += parseInt(JSON.parse(body)[0].market_cap_usd);

            if(crt_mkt_cap.length == 5) {
                console.log(mkt_caps_sum);
                console.log("Mkt_caps_sum: " + mkt_caps_sum);
                newCCYRatios();
            }
        });
    }



// Function to find what the new %'s should be of each CCY
var newCCYRatios = function() {
    for(var i = 0; i < crt_mkt_cap.length; i++) {
        var daKey = Object.keys(crt_mkt_cap[i]);
        console.log(daKey[0]);
        // console.log(((crt_mkt_cap[i][daKey[0]] / mkt_caps_sum) * 100) + "%");
        console.log(parseInt((crt_mkt_cap[i][daKey[0]] / mkt_caps_sum) * 100) + "%");
        console.log("");
    }
}


currentArray();

// app.get('/currentArray', [currentArray, resSend]);


// app.get('/reset_in_firebase', [resetInFirebase, resSend]);
// var resetInFirebase = function(req, res, next) {
//     // set the current values' array to the above object 
//     next();
// }

var resSend = function(req, res) {
    res.send("DONE!");
}

app.listen('8081')
console.log('Magic happens on port 8081');