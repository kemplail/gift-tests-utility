const BanqueDonnees = require('../BanqueDonnees');

describe("Tests de la classe BanqueDonnees", function() {

    beforeAll(function() {

        this.bq = new BanqueDonnees();

    });

    it("Checking récupération des noms de fichier du jeu de données", function() {

        expect(this.bq.getListOfNameFiles().length).toBeGreaterThan(0);
        expect(this.bq.getListOfNameFiles()[0]).toBe('EM-U4-p32_33-Review.gift');

    });

    it("Cheching ajout des fichiers de question à la banque de données", function() {

        expect(this.bq.listeQuestions.length).toBeGreaterThan(0);

    });

    it("Checking accès à un fichier et son contenu de la banque de données", function() {

        expect(this.bq.listeQuestions[0].file).toBe("./SujetB_data/EM-U4-p32_33-Review.gift");
        expect(this.bq.listeQuestions[0].questions[0].title).toBe('EM U4 p32 Review 1 MultiChoice');
        expect(this.bq.listeQuestions[0].questions[0].isMultiple).toBeTrue();
        expect(this.bq.listeQuestions[0].questions[0].type).toBe('MULTIPLE_CHOICE');

    });

    it("Checking accès à une question d'un fichier de question", function() {

        expect(this.bq.listeQuestions[0].questions[3]).toEqual(
            {
                multiple: false,
                title: 'EM U4 p33 Review 4.0 Key word transformation',
                body: 'Complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. Here is an example: <blockquote>Please don’t drive so fast — this is a dangerous road.<br> <b>MORE</b><br> Please <i>drive more slowly</i> — this is a dangerous road.</blockquote>',
                format: 'html',
                type: 'DESCRIPTION'
            }
        );

    });

});