const GiftParser = require('./GiftParser.js');
const fs = require('fs');
const GiftEncoder = require('./GiftEncoder.js');
const TEST_TYPES = require('./constantes/TestType');

const getFileContent = function(file) {

    try {
        
        return fs.readFileSync(file, 'utf-8');

      } catch (err) {
        //
      }

}

let Test = function(filename,type){

    this.fileName = filename;
    this.parsedQuestions = [];
    this.type = type;

    if(this.type == TEST_TYPES.creation) {

        if(getFileContent("./test_en_creation/"+filename)) {
            this.parseQuestions(getFileContent("./test_en_creation/"+filename));
        }

    } else {

        let dirname = filename.replace('.gift','');

        if(getFileContent("./test_valide/"+dirname+"/"+filename)) {
            this.parseQuestions(getFileContent("./test_valide/"+dirname+"/"+filename));
        }
    }

}

Test.prototype.parseQuestions = function(data){

    let parser = new GiftParser();
    parser.parseAFile(data);

    parser.parsedQuestions.forEach(question => {
        this.addQuestion(question);
    });

}

Test.prototype.addQuestion = function(question) {

    let correct = true;

    /*
    this.parsedQuestions.forEach(questionparsed => {
        if(questionparsed.title == question.title) {
            correct = false;
        }
    });
    */

    if(correct) {
        this.parsedQuestions.push(question);
        return true;
    } else {
        return false;
    }

}

Test.prototype.writeTest = function() {

    if(this.type == TEST_TYPES.creation) {
        fs.writeFile('./test_en_creation/'+this.fileName, GiftEncoder.encoder(this.parsedQuestions), function(){console.log('écriture du fichier effectuée\n')});
    } else {

        let dirname = this.fileName.replace('.gift','');
        fs.writeFile('./test_valide/'+dirname+'/'+this.fileName, GiftEncoder.encoder(this.parsedQuestions), function(){console.log('écriture du fichier effectuée\n')});
    
    }

}

Test.prototype.verifyTest = function() {

    let correct = true;

    this.parsedQuestions.forEach(question => {
        if(this.parsedQuestions.filter(q => q.title==question.title).length > 1) {
            correct = false;
        }
    });

    if(this.parsedQuestions.length < 15 || this.parsedQuestions.length > 20) {
        correct = false;
    }

    return correct;

}

Test.prototype.deleteQuestion = function(numQuestion) {

    let correct = (numQuestion <= this.parsedQuestions.length && numQuestion > 0);

    if(correct) {
        this.parsedQuestions.splice((numQuestion-1), 1);
    }

    return correct;

}

module.exports = Test;