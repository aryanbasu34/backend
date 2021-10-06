const express = require("express");
const app=express();
const firebase=require("firebase");
const fs = require("fs")
const objectstocsv = require('objects-to-csv')
const config = {
    apiKey: "AIzaSyCqx_MVl0clBGV4NVDmVq7egSJSHZFAES0",
    authDomain: "ps14-da3a1.firebaseapp.com",
    projectId: "ps14-da3a1",
    storageBucket: "ps14-da3a1.appspot.com",
    messagingSenderId: "474011809198",
    appId: "1:474011809198:web:21f4b977ddf545196f843f",
    measurementId: "G-ZG0DWW4WMJ"
  };
  firebase.initializeApp(config);
  const auth = firebase.auth();
 const firestore = firebase.firestore();
console.log("Server is running...")
var today = new Date();
var year = today.getFullYear();
var mes = today.getMonth()+1;
var dia = today.getDate();
var fecha =dia+"-"+mes+"-"+year;
const maindata=[];
firebase.firestore().collection(`${fecha}`).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
       maindata.push(doc.data());
        //console.log(doc.id, " => ", doc.data().firstName);
    });
   // console.log(maindata);
   // <CSVDownload data={maindata} target="_blank" />
  });
//  app.use( express.static( "public" ) );
  //routes
 
 // app.use('/',require('./routes/index'));
 app.get('/',async(req,res) => {
    const csv = new objectstocsv(maindata);
 
  // Save to file:
  await csv.toDisk('./test.csv');
 


  res.download("./test.csv",() => {

    fs.unlinkSync("./test.csv")

  })
})

 //app.get('/join', (req, res) => newMeeting(req, res));
const port=process.env.PORT||5000






app.listen(port,()=>{
  console.log(`listening to the port number at ${port}`);
})