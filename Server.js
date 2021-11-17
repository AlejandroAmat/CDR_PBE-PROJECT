http = require('http');
var mysql = require('mysql');
const url = require ('url');
//const d = require('dateformat'); descargar


const hostname = "10.192.151.163";
const port = 4344;
var user= 'Max Lampurlanés'; //Contemplo que ja esta iniciat sessió

function manage( req, res){  //funció que gestiona les peticions de clients
if(req.method =='GET'){

  req.on('error',(err)=>{
    console.error(err);

  })
   req.on('data',(chunk)=>{

   });

   req.on('end', ()=>{   //tota la funcionalitat es troba en quan acaba la petició
     if(user==''){
      var stringname;
      var uid = req.url.split("?"); //separo el url per obtenir el uid
      var qq = "SELECT name FROM Students WHERE U_ID = '" + uid[1]+ "'"; //creo consulta SQL
      console.log(qq);
      con.query(qq, function(err,result){  //consulta SQL
      if(err) throw err;
      stringname = JSON.stringify(result); //passem a string el objecte
      //final = JSON.parse(striing); //pasem a JSON el string
      //user = final[0].name; //agafem del Json la row 0 i el name, que sera usuari actual
      res.statusCode=200;
      res.setHeader('Content_Type','aplication/json');

      //var baina = "'"+ stringname + "'";
      console.log(stringname);
      var data= "{"+ '"result":' + stringname + "}";
      res.end(data);



       });

     }
else{

     //querys//
     var url = req.url.split("?");
      var all = 1;
      var lim= 0;
     console.log(url[1]);

     if(url.length>=3){ //comprovem si te restriccions
      all = 0;
     var params = url[2].split("&");
   }
   console.log(all);
     var query = "SELECT ";
     var querfinal = "";
     var logout=0;
     switch(url[1]){ //mirem quina taula és
       case 'marks':
       query+="subject, name, mark";
       querfinal=" ORDER BY mark DESC";
       break;
       case 'timetable': //"day , hour, subject, room";//
        query += "room, subject, hour, day";
       break;
       case 'tasks': query += "date, subject, name";
       querfinal=" ORDER BY date ASC";
       break;
       case 'logout': logout= 1;
       break;
       default: break;
     }
    query+= " FROM "+ url[1] + " WHERE student = '" + user + "'";; //creem query SQL

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
           query+= " AND date "  + " = '" + p[1]+ "'";
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
             //const now = new Date();
            // query+= now.format(dd/mm/aa)
           }else{
             query+= p[1]+"'";
           }
           break;
           case 'date[lt]': query+= " AND  date" + " < '";
           if(p[1]=="now"){
             //const now = new Date();
            // query+= now.format(dd/mm/aa)
           }else{
             query+= p[1]+ "'";
           }
           break;
           default: break;
         }


       }

  }
  if(lim!=1)  query+=querfinal;


  console.log(query);


    var striing
     con.query(query, function(err,result){ //SQL consulta
     if(err) throw err;
     striing = JSON.stringify(result);
     //   var body = JSON.parse(striing);
       console.log(striing[1]);
       res.statusCode=200;
       res.setHeader('Content_Type','aplication/json');
       //res.end(striing);
       var data= "{"+ '"result":' + striing + "}";
       res.end(data);
     });


    ///  res.write(striing);
       //devolvemos el JSON al cliente
   }
  });




}else{

  res.end();
}
}

//starting server//

const server = http.createServer(manage);


server.listen (port, hostname, () =>{
  console.log('Server running at http://%s:%d',hostname,port)
});


//mySQL connection


var con = mysql.createConnection({
host: 'localhost',
database: 'PBE',
user: 'root',
password : 'Alex12345'
});

con.connect(function(err){
  if(err) throw err;
  console.log("Connected MySQL");
});



//funcion para tener el post en un buffer
