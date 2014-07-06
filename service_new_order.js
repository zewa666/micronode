var restify = require('restify');
var FireBase = require('firebase');
var fs = require('fs');

var server = restify.createServer({
  name: 'NewOrderCreationService'
});
server.use(restify.bodyParser());

var config;

fs.readFile("./config.json", 'utf8', function (err,data) {
  config = JSON.parse(data);

  server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
  });

  server.post('/order', function placeNewOrder(req, res, next) {
    if(req.params.product === undefined ||
       req.params.amount === undefined ||
       req.params.customerID === undefined) {
      res.send(400, "Required structure: " +
                    JSON.stringify({
                      "product": "Productname",
                      "amount": "INT",
                      "customerID": "CustomerID"})
      );
    } else {
      var rootRef = new FireBase(config.firebaseServer + "orders");

      req.params.status = "UNPROCESSED";
      req.params.creationDate = new Date();
      var newOrder = rootRef.push(req.params);

      res.send(201, "Successfully created order with id: " + newOrder.name());
      console.log('Created new Order for: ' + req.params.customerID);
    }
  });

});



// randomly kill service for service stability checking
/*setTimeout(function() {
    process.exit();
}, (300*1000)*Math.random());*/
