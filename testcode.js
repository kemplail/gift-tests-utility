const GiftParser = require('./GiftParser.js');
const GiftEncoder = require('./GiftEncoder.js');
const BanqueDonnees = require('./BanqueDonnees.js');
const func = require("./CliFunctions.js");
const vCard = require('vcard-parser');
const Test = require("./Test.js");

const fs = require('fs');

//./SujetB_data/U3-p33-UoE-Hygge.gift
//./SujetB_data/EM-U42-Ultimate.gift
//U5-p52-Reading-The_death_of_cooking

//let banque = new BanqueDonnees();
//banque.listeQuestions.forEach(element => {
/*
if(element.file == "./SujetB_data/U3-p33-UoE-Hygge.gift") {
    console.log(GiftEncoder.encoder(element.questions));
}
*/    
//});

//let test = new Test("fichierTest.gift");
//console.log(test.verifyTest());

let content = fs.readFileSync("./SujetB_data/EM-U42-Ultimate.gift", 'utf-8');
let gf = new GiftParser();
gf.parseAFile(content);
//console.log(gf.tokenize(content));

let bq = new BanqueDonnees();
console.log(bq.listeQuestions[0].questions[3]);

//content = fs.readFileSync("./SujetB_data/EM-U5-p34-Gra-Expressions_of_quantity.gift", 'utf-8');
//let gf = new GiftParser();
//gf.parseAFile(content);

//console.log(gf.parsedQuestions[4]);


//func.createVcard();