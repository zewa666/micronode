var restify = require('restify');
var FireBase = require('firebase');
var fs = require('fs');

var server = restify.createServer({
  name: 'ProcessNewOrdersService'
});
server.use(restify.bodyParser());

var config;

fs.readFile("./config.json", 'utf8', function (err,data) {
  config = JSON.parse(data);

  server.listen(8081, function() {
    console.log('%s listening at %s', server.name, server.url);
  });

  server.get('/order/:id', function getOrder(req, res, next) {
    new FireBase(config.firebaseServer + "orders/" + req.params.id).once('value', function(order) {
      console.log(order.val());
      res.setHeader('content-type', 'application/json');
      res.send(order.val());
    });
  });

  // Listen for new orders
  var dataRef = new FireBase(config.firebaseServer + "orders");
  dataRef.on('child_added', function(snapshot) {

    var order = snapshot.val();
    if(order.status === "UNPROCESSED") {
      order.processedDate = new Date();
      order.status = "PROCESSED";
      order.valid = (order.amount > 0);
      var ref = new FireBase(config.firebaseServer + "orders/" + snapshot.name());
      ref.set(order);

      console.log("Processed order no: " + snapshot.name());
    }


    /*console.log(snapshot.name());
    dataRef.child(order.name()).set(order);*/

  });
});



// randomly kill service for service stability checking
/*setTimeout(function() {
    process.exit();
}, (30000)*Math.random());*/
