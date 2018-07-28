var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "bamazon_db"
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("we're connected")
    displayProducts();
})

 function displayProducts() {
     connection.query("select * from products", function(err, results, fields) {
         if (err) throw err;
         console.table(results);
         var productNames = []
         for (var i = 0; i < results.length; i++) {
             productNames.push(results[i].product_name)
         }
        //  console.log(productNames)
         promptCustomer(productNames)
     })
 }

 function promptCustomer(products) {
        inquirer.prompt([
            {
                name: "productName",
                type: "list",
                message: "Please select a product.",
                choices: products    
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to buy?"
            }
        ]).then (function(answers) {
            // console.log(answers)
            var item = answers.productName;
            var quantity = answers.quantity;
            if (Number.isInteger(parseInt(quantity))) {
                checkInventory(item, quantity);
            } else {
                console.log("Please enter a valid number")
                continuePrompt();
            }
        })
 }

 function checkInventory(itemName, purchaseQuantity) {
     connection.query("select product_name, price, inventory from products where product_name = ?" , [itemName], function(err, results, fields) {
        //  console.log(results)
        var remaininInventory = results[0].inventory - purchaseQuantity;
        var totalSales = results[0].price * purchaseQuantity;

        if (remaininInventory > 0) {
            console.log("Congratulations you just purchased " + purchaseQuantity + " " + itemName + " for $" + totalSales)
            updateInventory(itemName, remaininInventory);
        } else {
            console.log("Insufficient quantity")
            continuePrompt();
        }
     })
 }

 function updateInventory(productName, newInventory) {
     connection.query("update products set ? where ?", [
         {
             inventory: newInventory
         },
         {
             product_name: productName
         }
     ], function(err, results, fields) {
         continuePrompt();
     })
 }

 function continuePrompt() {
     inquirer.prompt([
         {
             type: "confirm",
             name: "continue",
             message: "Would you like to continue shopping?"
         }
     ]).then(function(answers) {
         if (answers.continue) {
             displayProducts()
         } else {
             console.log("Thank you for shopping")
             connection.end();
         }
     })
 }