http = require('http');
//const express = require ('express');
var mysql = require('mysql');
const url = require ('url');
require('dotenv').config();
var a =0;
var timetablee =0;
var tim=0;
//const d = require('dateformat'); descargar

const hostname = "172.20.10.2";
const port =  4344;
var user= ''; //Contemplo que ja esta iniciat sessió

function manage( req, res){  //funció que gestiona les peticions de clients
if(req.method =='GET'){

  req.on('error',(err)=>{
    console.error(err);

  })
   req.on('data',(chunk)=>{

   });

   req.on('end', ()=>{   //tota la funcionalitat es troba en quan acaba la petició

    var disc = req.url.split("?");
    if(disc[1]=="d"){
    user="";
    res.end("disconnected");
    }
    else{

     if(user==''){
      var stringname;
      var uid = req.url.split("?"); //separo el url per obtenir el uid
      var qq = "SELECT name FROM Students WHERE U_ID = '" + uid[1]+ "'"; //creo consulta SQL
      console.log(qq);
      con.query(qq, function(err,result){  //consulta SQL
      if(err) throw err;

      stringname = JSON.stringify(result); //passem a string el objecte
      console.log(stringname);
if(stringname=="[]") res.end("error");
else{
      final = JSON.parse(stringname); //pasem a JSON el string
      console.log(final);
      user = final[0].name.toString(); //agafem del Json la row 0 i el name, que sera usuari actual
      res.statusCode=200;
      //res.setHeader('Content_Type','aplication/json');

      //var baina = "'"+ stringname + "'";

      var data= "{"+ '"result":' + stringname + "}";
      res.end(user);

}

       });

     }
else{

     //querys//
     var url = req.url.split("?");
      var all = 1;
      var lim= 0;
     console.log(url);

     if(url.length>=3){ //comprovem si te restriccions
      all = 0;
     var params = url[2].split("&");
     console.log(params);
   }
   console.log(all);
     var query = "SELECT ";
     var querfinal = "";
     var logout=0;
     switch(url[1]){ //mirem quina taula és
       case 'marks':
       query+="subject, name, mark";
       querfinal=" ORDER BY subject ASC";
       break;
       case 'timetable': //"day , hour, subject, room";//
        query += "day, hour, subject, room";

        var date = new Date();
        var hour =  date.toTimeString().substr(0,5);
         //get only houy;
         var dayint = date.getDay() -1;
       //dayint = 2;
        if(dayint>4) dayint = 0;

        querfinal = "ORDER BY CASE when daynum = "+ dayint +  " and hour >= '" + hour +"' then 0 when daynum = "+ (dayint+1)%5 +" then 1 when daynum= "+ (dayint+2)%5 +" then 2 when daynum= "+ (dayint+3)%5 +" then 3 when daynum= "+ (dayint+4)%5 +" then 4 when daynum";
        querfinal += "= " + dayint +" AND hour< '" + hour + "' then 5 end";
        break;
       case 'tasks': query += "date, subject, name";
       querfinal=" ORDER BY date ASC";
       break;
       case 'logout': logout= 1;
       break;
       default: break;
     }

    query+= " FROM "+ url[1] + " WHERE student = '" + user + "'"; //creem query SQL

    if(all!=1){ //mirem resta de restriccions!!!
    for(const element of params){
     var p = element.split("=");
      //comprobar que no sea limit
      //comprobar que no sea [gte]  o [lte]
      //comprobar las que son int o las que son string
      //query+= " AND " + p[0] + " = '" + p[1] +"'";
      console.log("baina");

      switch (p[0]){

           case 'name': query+= " AND " + p[0] + " = '" + p[1] + "'";
           break;
           case 'room': query+= " AND " + p[0] + " = '" + p[1] + "'";
           break;
           case 'subject': query+= " AND " + p[0] + " = '" + p[1] + "'";
           break;
           case 'limit':
           lim = 1;
           query+= querfinal;
           query+=  " LIMIT " +  p[1];
           break;
           case 'date':
           //'date':  var date= new Date(p[1]);
           query+= " AND date "  + ' = "' + p[1]+ '"';
          // console.log(p[1]);
           break;
           case 'day': query+= " AND " + p[0] + " = '" + p[1] + "'";
           break;
           case 'mark[lt]': query+= " AND  mark" + " < " + p[1];
           break;
           case 'mark[gte]': query+= " AND  mark" + " >= " + p[1];
           break;
           case 'mark': query+= " AND  " + p[0] + " = " + p[1];
           break;
           case 'hour': query+= " AND  " + p[0] + " = '" + p[1] +"'";
           break;
           case 'hour[gte]': query+= " AND hour " + " >= '";
           query+= p[1] + "'";
           //.formt(dd/mm/aa); //no se si esta be aixo hauras de probaro
           break;
           case 'hour[lt]': query+= " AND hour " + " < '";
           query+= p[1] + "'";
           //.formt(dd/mm/aa); //no se si esta be aixo hauras de probaro
           break;


           case 'date[gte]': query+= " AND date" + " >= DATE '";
           if(p[1]=="now"){
             var now = new Date();
              query += now.toISOString().split('T')[0] + "'";
           }else{
             query+= p[1]+"'";
           }
           break;
           case 'date[lt]': query+= " AND  date" + " < '";
           if(p[1]=="now"){
             var now = new Date();

             query += now.toISOString().split('T')[0] + "'";

           }else{
             query+= p[1]+ "'";
           }
           break;
           default: break;
         }


       }

  }

  //  if(timetablee==1){

  //  if(lim==1) query += " limit " + params[0].split("=")[1];

  //  tim =1;
//  }
//  }

  //if(lim!=1 && tim==0) {
    //console.log("entroooo");
    //query+=querfinal;
    //tim = 1;
  //}

if(lim!=1 )   query+=querfinal;

  console.log(query);

    timetablee = 0;
    var striing
     con.query(query, function(err,result){ //SQL consulta
     if(err) res.end("error");
     else{
     //console.log(result);
     striing = JSON.stringify(result);

     //   var body = JSON.parse(striing);

       res.statusCode=200;
       res.setHeader('Content_Type','aplication/json');
       //res.end(striing);
       var data= "{"+ '"result":' + striing + "}";
    //   console.log(striing);
       console.log(data);
       res.end(data);
}
     });

    // res.write(striing);
       //devolvemos el JSON al cliente
   }

}
  });




}else{

  res.end();
}
}

//starting server//

const server = http.createServer(manage);
//const app = express();

server.listen (port, hostname, () =>{
  console.log('Server running at http://%s:%d',hostname,port)
});
//app.listen (port,() =>{
  //console.log('Server running at http://%d',port)
//});


//mySQL connection


var con = mysql.createConnection({
host: process.env.DB_HOST || 'localhost',
database: process.env.DB_DATABASE || 'PBE',
user: process.env.DB_USER|| 'root',
password : process.env.DB_PASSWORD ||'Alex12345'
});

con.connect(function(err){
  if(err) throw err;
  console.log("Connected MySQL");
});



//funcion para tener el post en un buffer
