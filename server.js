`use strict`;
const express = require('express');
const myapp = express();
const newData = require("./Movie data/data.json");
const dotenv = require('dotenv');
const axios = require("axios");
dotenv.config();
const PORT = process.env.PORT;
const APIKEY = process.env.APIKEY;

myapp.get('/',dataConstructerHandler);
myapp.get('/favorite',dataHandler)
myapp.get('/trending',getMoviesHandler)
myapp.get('/searchmovie',searchForMovie)
myapp.get('/randompath',anotherAPIfunction)
myapp.use(errorHandler);


   function anotherAPIfunction(req,res){
       let newArray=[];
    axios.get(`https://api.themoviedb.org/3/movie/changes?api_key=${APIKEY}&page=1`).then(value =>{
    value.data.results.forEach(value =>{
        newArray.push(value);
    });return res.status(200).json(newArray);
    }).catch(error => {
        errorHandler(error, req,res);
    });
   }




function searchForMovie(req, res){
    console.log(req.query.search);
    let searchquery = req.query.search;
    let myArray=[];
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&query=${searchquery}`).then(value => {
        
        value.data.results.forEach(movies => {
            let movie = new DataConstructer (movies.title,movies.poster_path,movies.overview);
            myArray.push(movie);
        })

        return res.status(200).json(myArray);
    }).catch(error => {
        errorHandler(error, req,res);
    })

}





function errorHandler(error, req, res){
    const err = {
        status : 500,
        message : error
    }

    res.status(500).send(err);
};

function dataConstructerHandler(req,res){
    let Dataone = new DataConstructer (newData.title,newData.poster_path,newData.overview);
    return res.status(200).json(Dataone);
};
function DataConstructer(id,title,release_date,poster_path,overview){
    this.id=id;
    this.title =title,
    this.release_date=release_date;
    this.poster_path = poster_path,
    this.overview =overview 
};

function dataHandler(req,res){
 return res.status(200).send('Welcome to Favorite Page');

};

function getMoviesHandler(req,res){
    let myArray=[];
    axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${APIKEY}`).then(value => {
        // console.log(value.data);
            value.data.results.forEach(value=>{
            let movieOne = new DataConstructer (value.id,value.title,value.release_date,value.poster_path,value.overview);            
                myArray.push(movieOne)
            })
         return res.status(200).json(myArray);
    }).catch(error => {
        errorHandler(error, req,res);
    
    });
};

myapp.listen(PORT, () => {
    console.log(`Listen to port ${PORT}`);
});
