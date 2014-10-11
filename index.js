var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Patient = require('./app/models').Patient,
    controllers = require('./app/controllers'),
    app = express();

//mongoose.connect('mongodb://test:test@dbh55.mongolab.com:27557/heroku_app25028844');
mongoose.connect('mongodb://localhost/clinuip3');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

for (var key in controllers) {
    app.use('/api/v1/' + key, controllers[key]().router);
}

// Temp code, create test data
app.get("/test-data",function(a,b){var c=["Phillip Walker","Adam Cox","Jeremy Ross","Jack Sanchez","Martin Barnes","Carl Martinez","Johnny Peterson","Clarence Henderson","Samuel Brown","Frank Phillips"],d=["Ann Sanders","Rachel Ramirez","Nicole Scott","Norma Walker","Linda Ross","Andrea Bailey","Martha Henderson","Julia Washington","Jessica Gonzalez","Wanda Brooks"],

    e=["Medication - Paracetamol 500mg qds","Medication - Ibuprofen 400mg tds","Investigation - Xray Chest","Investigation - EKG"];Patient.find({}).remove(function(){for(var a=0;10>a;a++){var b=new Patient;if(b.gender=1===Math.floor(2*Math.random()+1)?"male":"female",b.no=Math.floor(8999*Math.random()+1e3),b.test1=Math.random().toString(36).substring(7),b.test2=Math.random().toString(36).substring(7),b.test3=Math.random().toString(36).substring(7),"male"===b.gender){var f=Math.floor(Math.random()*c.length);b.name=c[f],c.splice(f,1)}else{var g=Math.floor(Math.random()*d.length);b.name=d[g],d.splice(g,1)}for(var h=Math.floor(10*Math.random())+1,i=0;h>i;i++){for(var j={no:Math.floor(899*Math.random()+100),details:[]},k=Math.floor(8*Math.random())+4,l=0;k>l;l++)j.details.push(e[Math.floor(Math.random()*e.length)]);b.details.push(j)}b.save()}}),b.send("ok")});



app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});
