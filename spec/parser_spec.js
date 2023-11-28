const GiftParser = require('../GiftParser');
const fs = require('fs');

describe("Tests du parser de fichiers GIFT", function() {

    beforeAll(function() {

        let content = fs.readFileSync("./SujetB_data/EM-U42-Ultimate.gift", 'utf-8');

        this.gf = new GiftParser();
        this.gf.parseAFile(content);

    });

    it("Checking les questions ont bien été ajoutées à la liste des questions parsées", function() {

        expect(this.gf.parsedQuestions).toBeDefined();
        expect(this.gf.parsedQuestions.length).toBe(4);

    });

    it("Cheching possibilité de récupérer une question parsée", function() {

        expect(this.gf.parsedQuestions[0].multiple).toBeFalse();
        expect(this.gf.parsedQuestions[0].title).toBe('EM U42 Ultimate q1');
        expect(this.gf.parsedQuestions[0].body).toBe("What's the answer to this multiple-choice question?");
        expect(this.gf.parsedQuestions[0].answers.length).toBe(3);
        expect(this.gf.parsedQuestions[0].type).toBe('MULTIPLE_CHOICE');
        

    });

    it("Checking possibilité de récupérer les réponses d'une question parsée", function() {

        expect(this.gf.parsedQuestions[0].answers[0]).toEqual(
            {
                correct: false,
                weight: 0,
                text: 'wrong answer',
                feedback: 'feedback comment on the wrong answer'
            }
        );

        expect(this.gf.parsedQuestions[0].answers[0].correct).toBeFalse();

    });

});