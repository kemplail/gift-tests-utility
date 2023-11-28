var fs = require('fs');
const GiftParser = require('./GiftParser.js');

const DIR_PATH = './SujetB_data';

let BanqueDonnees = function() {
    this.listeQuestions = [];

    this.getQuestionsFromFolder();
}

BanqueDonnees.prototype.getListOfNameFiles = function() {
    return fs.readdirSync(DIR_PATH);
};

BanqueDonnees.prototype.getQuestionsFromFolder = function() {

    let files = this.getListOfNameFiles();

    files.forEach(element => {
        this.getQuestionsFromFile(DIR_PATH+"/"+element);
    });

}

BanqueDonnees.prototype.getQuestionsFromFile = function(file) {

    let content;

    try {
        
        content = fs.readFileSync(file, 'utf-8');

        let parser = new GiftParser();
        parser.parseAFile(content);
        
        let result = {
            file: file,
            questions: parser.parsedQuestions
        }
        
        this.listeQuestions.push(result);

      } catch (err) {
        //
      }

};

module.exports = BanqueDonnees;