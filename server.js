`use strict`;
const express = require('express');
const myapp = express();
const newData = require("./Movie data/data.json");
const dotenv = require('dotenv');
const axios = require("axios");
const pg = require("pg");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT;
const APIKEY = process.env.APIKEY;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

myapp.use(express.json());
myapp.use(cors());
myapp.get('/',dataConstructerHandler);
myapp.get('/favorite',dataHandler)
myapp.get('/trending',getMoviesHandler)
myapp.get('/searchmovie',searchForMovie)
myapp.get('/randompath',anotherAPIfunction)
myapp.post("/addFavMovies", addMoviesHandler);
myapp.get("/getAllFavMovies", getAllFavMoviesHandler);
myapp.get("/getFavMovies/:id", getFavMoviesHandler);
myapp.put("/updateFavMoives/:id", updateFavMoviesHandler);
myapp.delete("/deleteFavMovies/:id", deleteFavMoviesHandler)


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

};
function errorHandler(error, req, res){
    const err = {
        status : 500,
        message : error
    }

    res.status(500).send(err);
};

function dataConstructerHandler(req,res){
        let Dataone = new DataConstructer (newData.id,newData.title,newData.release_date,newData.poster_path,newData.overview);

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
function addMoviesHandler(req,res){
    console.log(req.body);
    let movie = req.body
    const sql = `INSERT INTO favMovies(title,release_date,poster_path,overview,comment) VALUES($1, $2, $3, $4, $5) RETURNING * ;`
    let values = [movie.title, movie.release_date, movie.poster_path, movie.overview ,movie.comment];
    client.query(sql, values).then((data) => {
       
        return res.status(201).json(data.rows);
    }).catch(error => {
        errorHandler(error, req, res);
    })
};
function getAllFavMoviesHandler(req, res){
    const sql = `SELECT * FROM favMovies`;
    client.query(sql).then(data => {
        return res.status(200).json(data.rows);
    }).catch(error => {
        errorHandler(error, req,res);
    })
}

function getFavMoviesHandler(req,res){
    console.log(req.params.id);
    const id = req.params.id;
    const sql = `SELECT * FROM favMovies WHERE id=${id}`;

    client.query(sql).then(data => {
        
        res.status(200).json(data.rows);
    }).catch(error => {
        console.log(error);
        errorHandler(error, req, res);
    })
};

function updateFavMoviesHandler(req, res){
    const id = req.params.id;
    const movie = req.body;

    const sql = `UPDATE favMovies SET comment=$1 WHERE id=${id} RETURNING *;`
    const values = [movie.comment];

    client.query(sql,values).then(data => {
        // return res.status(204).send([]);
        return res.status(200).json(data.rows);
    }).catch(error => {
        errorHandler(error, req, res);
    })
};
function deleteFavMoviesHandler(req, res){
    const id = req.params.id;

    const sql = `DELETE FROM favMovies WHERE id=${id};`

    client.query(sql).then(() => {
        return res.status(204).json([]);
    }).catch(error => {
        errorHandler(error, req, res);
    })
}

client.connect().then(() => {
    myapp.listen(PORT, () => {
        console.log(`I am using port ${PORT}`);
    });
});
