var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Patient = require('./app/models').Patient,
    controllers = require('./app/controllers'),
    app = express();

mongoose.connect('mongodb://test:test@dbh55.mongolab.com:27557/heroku_app25028844');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

for (var key in controllers) {
    app.use('/api/v1/' + key, controllers[key]().router);
}

app.get('/test-data', function(req, res){

  var males = [
    "Phillip Walker", "Adam Cox", "Jeremy Ross", "Jack Sanchez", "Martin Barnes",
    "Carl Martinez", "Johnny Peterson", "Clarence Henderson", "Samuel Brown", "Frank Phillips"
  ];

  var females = [
    "Ann Sanders", "Rachel Ramirez", "Nicole Scott", "Norma Walker", "Linda Ross",
    "Andrea Bailey", "Martha Henderson", "Julia Washington", "Jessica Gonzalez", "Wanda Brooks"
  ];

  var idc = [
    "H65.1", "K65.0", "A54.9", "A56.2", "B95.5", "B97.7", "D13.5", "D13.9", "E11.3", "E11.7",
    "G11.1", "G11.8", "G40.3", "G40.9", "H30.2", "H31.4", "H34.2", "K55.1", "K56.1", "L20.8"
  ];

  Patient.find({}).remove(function () {
    for (var i = 0; i < 10; i++){
        var row = new Patient();

        row.gender = Math.floor((Math.random() * 2) + 1) === 1 ? "male" : "female";
        row.no = Math.floor((Math.random() * 8999) + 1000);
        row.test1 = Math.random().toString(36).substring(7);
        row.test2 = Math.random().toString(36).substring(7);
        row.test3 = Math.random().toString(36).substring(7);
        
        if (row.gender === "male") {
            var maleIndex = Math.floor(Math.random() * males.length);
            row.name = males[maleIndex];
            males.splice(maleIndex, 1);
        } else {
            var femaleIndex = Math.floor(Math.random() * females.length);
            row.name = females[femaleIndex];
            females.splice(femaleIndex, 1);
        }

        var count = Math.floor(Math.random() * 10) + 1;
        for(var j = 0; j < count; j++) {
            var detail = {
                no: Math.floor((Math.random() * 899) + 100),
                details: [ ]
            };
            var sCount = Math.floor(Math.random() * 8) + 4;
            for(var s = 0; s < sCount; s++) {
                detail.details.push(idc[Math.floor(Math.random() * idc.length)]);
            }

            row.details.push(detail);
        }

        row.save();
    }
});
  res.send('ok');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
