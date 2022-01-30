`use strict`;
const express = require('express');
const myapp = express();
const newData = require("./Movie data/data.json");
myapp.get('/',dataConstructerHandler);
myapp.get('/favorite',dataHandler)

function dataConstructerHandler(req,res){
    let Dataone = new DataConstructer (newData.title,newData.poster_path,newData.overview);
    return res.status(200).json(Dataone);
};
function DataConstructer(title,poster_path,overview){
    this.title =title,
    this.poster_path = poster_path,
    this.overview =overview 
};

function dataHandler(req,res){
 return res.status(200).send('Welcome to Favorite Page');
};
myapp.listen(3000, () => {
    console.log('Listen to port 3000');
})
