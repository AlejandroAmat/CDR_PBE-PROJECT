//incorporamos la gema http, mysql y url para tratar la información
http = require('http');  
//const express = require ('express');
var mysql = require('mysql');
const url = require ('url');
//require('dotenv').config();
var a =0;
var timetablee =0;
var tim=0;
//const d = require('dateformat'); descargar

const hostname = "172.20.10.2";  //ip a la que se debe conectar
const port =  4344;  //Escucha del puerto 4344
var user= ''; //Usuario activo. Consideramos que solo existe uno a la vez. Así en el cliente no tiene que enviarse en cada request() el nombre. 

function manage( req, res){  //funció que gestiona las peticiones
if(req.method =='GET'){   //contempla get requests

  req.on('error',(err)=>{
    console.error(err);

 })
   req.on('data',(chunk)=>{

 });

    req.on('end', ()=>{   //Toda la funcionaldad se encuentra cuando finaliza la petición

    var disc = req.url.split("?");  //dividimos el url recibido para analizar si se trata de una desconexión. Desconectamos al usuario activo.
    if(disc[1]=="d"){
    user="";
    res.end("disconnected");
    console.log("disconnected")
    }
    else{     // en caso de no tratarse de desconexión, dos casos: Conexión o acceso a la base de datos.

      if(user==''){
      var stringname;
      var uid = req.url.split("?"); //separo el url per obtenir el uid
      var qq = "SELECT name FROM Students WHERE U_ID = '" + uid[1]+ "'"; //creo consulta SQL
      console.log(qq);
      con.query(qq, function(err,result){  //consulta SQL
      if(err) throw err;

      stringname = JSON.stringify(result); //pasamos a string el objeto JScript
      console.log(stringname);
      if(stringname=="[]") res.end("error");  //si no existe el usuario devuelve error
      else{
      final = JSON.parse(stringname); //pasamos a JSON el string para poder extraer info más fácil
      console.log(final);
      user = final[0].name.toString(); //cogemos del Json la row 0 i el name, que sera usuario actual
      res.statusCode=200;
      res.setHeader('Content_Type','aplication/json');

      
      //var data= "{"+ '"result":' + stringname + "}";
      res.end(user);  //devolvemos nombre de usuario

      }

      });

    }
else{

    //querys//
     var url = req.url.split("?");
     var all = 1;
     var lim= 0;
     console.log(url);

     if(url.length>=3){ //comprobamos si existen restricciones o si solo se accede a la tabla
      all = 0;
      var params = url[2].split("&");
      console.log(params);
      }
      console.log(all);
      var query = "SELECT ";
      var querfinal = "";
      var logout=0;
      switch(url[1]){ //miramos tabla, creamos el Select y los atributos y cramos el query final que será el ORDER BY.
        case 'marks':
        query+="subject, name, mark";
        querfinal=" ORDER BY subject ASC";
        break;
        case 'timetable': 
        query += "day, hour, subject, room";

        var date = new Date();
        var hour =  date.toTimeString().substr(0,5); //miramos que día y hora es para poder hacer el orderBy. 
         
        var dayint = date.getDay() -1;
        //dayint = 2;
        if(dayint>4) dayint = 0;
           queryfinal = "ORDER BY CASE ";
          
          for(int i =0; i<6; i++){   //ordenacio dels dies i hores
          queryfinal+= " when daynum = " + (dayint + i) %5 ;
            if(i==0) queryfinal += "and hour >= '" + hour + "'";
            if(i==5) queryfinal += "and hour < '" + hour + "'";
          queryfinal+= "then "+ i;
            
          }        
    
        break;
        case 'tasks': query += "date, subject, name";
        querfinal=" ORDER BY date ASC";
        break;
        case 'logout': logout= 1;
        break;
        default: break;
     }

    query+= " FROM "+ url[1] + " WHERE student = '" + user + "'"; //añadimos From a la sentencia SQL con el parametro de tabla y usuario

    if(all!=1){   //si existen restricciones iteramos por todas, analizando cada caso y sumándolas a las sentencias SQL
    for(const element of params){   
     var p = element.split("=");
       switch (p[0]){

           case 'name': query+= " AND " + p[0] + " = '" + p[1] + "'";
           break;
           case 'room': query+= " AND " + p[0] + " = '" + p[1] + "'";
           break;
           case 'subject': query+= " AND " + p[0] + " = '" + p[1] + "'";
           break;
           case 'limit':
           lim = 1;  //en caso de haber un limit el order by se debe hacer antes por tanto es necesario saber cuándo es limit y cuándo no.
           query+= querfinal;
           query+=  " LIMIT " +  p[1];
           break;
           case 'date':
           query+= " AND date "  + ' = "' + p[1]+ '"';
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
           break;
           case 'hour[lt]': query+= " AND hour " + " < '";
           query+= p[1] + "'";
           break;
           case 'date[gte]': query+= " AND date" + " >= DATE '"; //en el caso de las dtes es necesario comprobar si es now, ya que el formato de Date es complejo
           if(p[1]=="now"){
             var now = new Date();
             query += now.toISOString().split('T')[0] + "'"; //separamos por T,  ya que el formato ISO separa yyyy-dd-mm con la hora mediante una T
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

  if(lim!=1 )   query+=querfinal;  //en caso de no haber limit, añadimos la sentencia order by a la sentencia actual

  console.log(query);

   timetablee = 0;
   var striing
   con.query(query, function(err,result){ //SQL consulta
   if(err) res.end("error");  //Si existe error en la consulta (de formato) retorna error.
    else{
      striing = JSON.stringify(result);

      res.statusCode=200; //200 por defecto es el número para peticiones con respuesta satisfactoria
      res.setHeader('Content_Type','aplication/json');
       
      var data= "{"+ '"result":' + striing + "}"; //añadimos result ya que Ruby necesita un identificador para poder analizar las strings con formato Json
    
       
      res.end(data);
    }
   });

    
  }
 }
});




}else{  //si no es request de get

  res.end();
}
}

//creamos el servidor mediante el protocolo http y le pasasmos como parametro la función que gestiona las peticiones

const server = http.createServer(manage);

server.listen (port, hostname, () =>{  //servidor escuchando puerto e IP asignados
  console.log('Server running at http://%s:%d',hostname,port)
});



//mySQL connection


var con = mysql.createConnection({  //conexión SQL. Introducimos los datos de la BD y posteriormente nos conectamos con el método connect.
host: process.env.DB_HOST || 'localhost',
database: process.env.DB_DATABASE || 'PBE',
user: process.env.DB_USER|| 'root',
password : process.env.DB_PASSWORD ||'Alex12345'
});

con.connect(function(err){
if(err) throw err;
  console.log("Connected MySQL");
});




