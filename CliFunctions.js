const QUESTION_TYPES = require('./constantes/QuestionType.js');
var prompt = require('prompt-sync')();
var fs = require('fs');
const vCard = require('vcard-parser');
const vg = require('vega');
const vegalite = require('vega-lite');

//Fonction pour afficher des éléments de manière ordonné dans la console
//Sert à afficher l'ensemble des dossiers de question ou le contenu d'un dossier
let afficheElements = function (listeElements, logger) {
    
    if(listeElements.length > 0) {

        let numero = 1;

        let affichage = "";

        listeElements.forEach(element => {
            affichage += numero+" > "+element+"\n";
            numero++;
        });

        logger.info(affichage);

    } else {
        logger.info("Aucun élément trouvé !");
    }

}

let filterQuestions = function(questions, type, logger) {

    let affichage = "";

    questions.filter(element => element.type == type).forEach(element => {
        affichage+="- "+element.title+"\n";
    });

    logger.info(affichage);

}

let viewQuestion = function(question, logger) {

    let affichage = "";

    if(question.title) {
        affichage += "Titre : "+question.title+"\n";
    }

    affichage += "Type : "+question.type.toString()+"\n";
    
    //Question multiple
    if(question.isMultiple) {

        let reponses = "[Réponses : ";
        let texte = "";

        affichage += "Texte associé : \n";

        let inputNumber = 1;
        question.questions.forEach(element => {

            texte += element.body;

            reponses += "("+inputNumber+") \n";
            inputNumber++;

            element.answers.forEach(answer => {

                reponses+="- "+answer.text;

                if(answer.correct == true) {
                    reponses += " [correcte : "+answer.correct+"]";
                }

                if(answer.weight) {
                    reponses += " [pondération : "+answer.weight+"]";
                }

                if(answer.feedback) {
                    
                    if(Array.isArray(answer.feedback)) {
                        
                        reponses += " [feedback : ";

                       for(let i = 0; i < answer.feedback.length; i++) {
                            reponses += answer.feedback[i]
                           if(i != answer.feedback.length-1) {
                            reponses += ",";
                           }
                       }

                       reponses += "]";

                    } else {
                        reponses += " [feedback : "+answer.feedback+"]";
                    }

                }
                
                reponses += "\n";

            });

        });

        reponses += "] \n";

        affichage += texte+"\n\n";
        affichage += reponses;

    } else {

        affichage += "Texte associé : "+question.body+"\n";
        
        if(question.answers) {

            affichage += "Réponses associées : \n";

            question.answers.forEach(element => {

                if(question.type == QUESTION_TYPES.NUMERIC) {

                    affichage += "- "+element.value;

                    if(element.weight) {
                        affichage += " [pondération : "+element.weight+"]";
                    }
    
                    if(element.range) {
                        affichage += " [marge d'erreur : "+element.range+"]";
                    }

                } else if (question.type == QUESTION_TYPES.MATCH) {

                    affichage += "- "+element.match[0]+" ---> "+element.match[1];

                } else if (question.type == QUESTION_TYPES.TF) {

                    affichage += "- "+element.correct;

                } else {

                    affichage += "- "+element.text;

                }

                if(element.correct) {
                    affichage += " [correcte : "+element.correct+"]";
                }

                if(element.weight) {
                    affichage += " [pondération : "+element.weight+"]";
                }

                if(element.feedback) {
                    
                    if(Array.isArray(element.feedback)) {
                        
                        affichage += " [feedback : ";

                       for(let i = 0; i < element.feedback.length; i++) {
                            affichage += element.feedback[i]
                           if(i != element.feedback.length-1) {
                            affichage += ",";
                           }
                       }

                       affichage += "]";

                    } else {
                        affichage += " [feedback : "+element.feedback+"]";
                    }

                }

                affichage += "\n";

            });
        }
    }

    logger.info(affichage);

}

let simulateTest = function(listequestions) {

    let reponses = [];
    let questionnumber = 0;

    const ordreQuestions = ['A','B','C','D','E','F','G','H'];

    listequestions.forEach(question => {
        
        console.log("\nQuestion "+(questionnumber+1)+" : "+question.title+"\n");

        if(question.isMultiple) {

            let reponsesMultiples = [];
            let numTrou = 0;

            let global_body = "";
            question.questions.forEach(question => {
                global_body += question.body;
            });

            console.log(global_body+"\n");

            question.questions.forEach(question => {

                if(question.type == QUESTION_TYPES.MC) {

                    let numReponse = 0;
                    let reponsesPossibles = [];

                    question.answers.forEach(reponse => {
                        console.log(ordreQuestions[numReponse]+". "+reponse.text);
                        reponsesPossibles.push(ordreQuestions[numReponse]);
                        numReponse++;
                    });

                    console.log("Veuillez entrer une réponse pour le trou n°"+(numTrou+1)+" : ");

                    let reponseClavier = "";
                    reponseClavier = prompt();

                    while(!reponsesPossibles.includes(reponseClavier.toUpperCase())) {
                        console.log("Veuillez entrer une réponse parmi les propositions !");
                        reponseClavier = prompt();
                    }

                    let indexRep = ordreQuestions.indexOf(reponseClavier.toUpperCase());

                    reponsesMultiples.push(question.answers[indexRep].text);

                } else {

                    console.log("Veuillez entrer une réponse pour le trou n°"+(numTrou+1)+" : ");

                    reponseClavier = prompt();
                    reponsesMultiples.push(reponseClavier);

                }

                numTrou++;

            });

            reponses.push(reponsesMultiples);

        } else {

            console.log(question.body);

            if(question.type == QUESTION_TYPES.MC) {

                let numReponse = 0;
                let reponsesPossibles = [];

                question.answers.forEach(reponse => {
                    console.log(ordreQuestions[numReponse]+". "+reponse.text);
                    reponsesPossibles.push(ordreQuestions[numReponse]);
                    numReponse++;
                });

                console.log("\nVeuillez entrer une réponse (a / b ..) : ");

                let reponseClavier = "";
                reponseClavier = prompt();

                while(!reponsesPossibles.includes(reponseClavier.toUpperCase())) {
                    console.log("Veuillez entrer une réponse parmi les propositions !");
                    reponseClavier = prompt();
                }

                let indexRep = ordreQuestions.indexOf(reponseClavier.toUpperCase());
                reponses.push(question.answers[indexRep].text);

            } else if(question.type == QUESTION_TYPES.SHORT || question.type == QUESTION_TYPES.ESSAY) {

                console.log("\nVeuillez entrer une réponse : ");

                reponseClavier = prompt();
                reponses.push(reponseClavier);

            } else if(question.type == QUESTION_TYPES.NUMERIC) {

                console.log("\nVeuillez entrer une réponse numérique : ");

                let reponseClavier = "";
                reponseClavier = prompt();

                while(isNaN(reponseClavier)) {
                    console.log("Veuillez entrer un nombre !");
                    reponseClavier = prompt();
                }

                reponses.push(reponseClavier);

            } else if (question.type == QUESTION_TYPES.TF) {

                console.log("\nVeuillez entrer Vrai ou Faux : ");

                let reponseClavier = "";
                reponseClavier = prompt();

                while(reponseClavier.toLowerCase() != "vrai" && reponseClavier.toLowerCase() != "faux") {
                    console.log("Veuillez entrer vrai ou faux !");
                    reponseClavier = prompt();
                }

                reponses.push(reponseClavier);

            } else if(question.type == QUESTION_TYPES.MATCH) {

                let reponsesMatching = [];

                let reponsesGauche = [];
                let reponsesDroite = [];

                question.answers.forEach(reponse => {
                    reponsesGauche.push(reponse.match[0]);
                    reponsesDroite.push(reponse.match[1]);
                });

                let affichage = "\nMatchs possibles : \n";
                for(let i = 0; i < reponsesDroite.length; i++) {
                    affichage += (i+1)+". "+reponsesDroite[i]+"\n";
                }

                console.log(affichage+"\n");

                reponsesGauche.forEach(reponse => {
                    console.log("Veuillez entrer le numéro de la réponse avec lequel l'expression '"+reponse+"' match : ");

                    let reponseClavier = "";
                    reponseClavier = prompt();

                    while(isNaN(reponseClavier) || (parseInt(reponseClavier) < 1 || parseInt(reponseClavier) > reponsesDroite.length)) {
                        console.log("Veuillez entrer un numéro valable !");
                        reponseClavier = prompt();
                    }

                    reponsesMatching.push(reponsesDroite[reponseClavier-1]);

                });

                reponses.push(reponsesMatching);

            } else {

                reponses.push("//");

            }

        }

        questionnumber++;

    });

    ////

    console.log("\n CORRECTION \n");

    questionnumber = 0;

    let score = 0;
    let scoremaxi = 0;

    listequestions.forEach(question => {

        if(question.isMultiple) {

            console.log("\nQuestion "+(questionnumber+1)+" : "+question.title+"\n");
            
            let numTrou = 0;

            let global_body = "";
            question.questions.forEach(question => {
                global_body += question.body;
            });

            console.log(global_body+"\n");

            question.questions.forEach(question => {

                scoremaxi++

                let repCorrecte = question.answers.filter(reponse => (reponse.correct == true || reponse.weight > 0));
                let repCorrecteText = repCorrecte.map(reponse => reponse.text);

                let reponseDansListe = question.answers.filter(reponse => reponse.text == reponses[questionnumber][numTrou]);

                console.log("Réponse de l'étudiant pour le trou n°"+(numTrou+1)+" : "+reponses[questionnumber][numTrou]);
                
                if(repCorrecteText.includes(reponses[questionnumber][numTrou])) {
                    console.log("Bravo ! Pondération appliquée : "+repCorrecte[repCorrecteText.indexOf(reponses[questionnumber][numTrou])].weight);
                    score += repCorrecte[repCorrecteText.indexOf(reponses[questionnumber][numTrou])].weight/100;
                } else {
                    console.log("Raté ! Réponse(s) possible(s) : ");
                    let affichereponse = "";

                    repCorrecte.forEach(element => {
                        affichereponse += "- "+element.text+" - Pondération : "+element.weight+"\n";
                    });

                    console.log(affichereponse);
                }

                if(reponseDansListe.length > 0) {
                    if(reponseDansListe[0].feedback) {

                        let feed = "";
    
                        if(Array.isArray(reponseDansListe[0].feedback)) {
                            
                            feed += "Feedback : ";
    
                           for(let i = 0; i < reponseDansListe[0].feedback.length; i++) {
                                feed += reponseDansListe[0].feedback[i]
                               if(i != reponseDansListe[0].feedback.length-1) {
                                feed += ",";
                               }
                           }
    
                        } else {
                            feed += "Feedback : "+reponseDansListe[0].feedback;
                        }
    
                    }
                }

                numTrou++;

            });

        } else {

            console.log("\nQuestion "+(questionnumber+1)+" : "+question.title+"\n");
            console.log(question.body);

            if(question.type == QUESTION_TYPES.MC || question.type == QUESTION_TYPES.SHORT) {
                scoremaxi++;

                let repCorrecte = question.answers.filter(reponse => (reponse.correct == true || reponse.weight > 0));
                let repCorrecteText = repCorrecte.map(reponse => reponse.text);

                let reponseDansListe = question.answers.filter(reponse => reponse.text == reponses[questionnumber]);

                console.log("Réponse de l'étudiant : "+reponses[questionnumber]);
                
                if(repCorrecteText.includes(reponses[questionnumber])) {
                    console.log("Bravo ! Pondération appliquée : "+repCorrecte[repCorrecteText.indexOf(reponses[questionnumber])].weight);
                    score += repCorrecte[repCorrecteText.indexOf(reponses[questionnumber])].weight/100;
                } else {
                    console.log("Raté ! Réponse(s) possible(s) : ");
                    let affichereponse = "";

                    repCorrecte.forEach(element => {
                        affichereponse += "- "+element.text+" - Pondération : "+element.weight+"\n";
                    });

                    console.log(affichereponse);
                }

                if(reponseDansListe.length > 0) {
                    if(reponseDansListe[0].feedback) {

                        let feed = "";
    
                        if(Array.isArray(reponseDansListe[0].feedback)) {
                            
                            feed += "Feedback : ";
    
                           for(let i = 0; i < reponseDansListe[0].feedback.length; i++) {
                                feed += reponseDansListe[0].feedback[i]
                               if(i != reponseDansListe[0].feedback.length-1) {
                                feed += ",";
                               }
                           }
    
                        } else {
                            feed += "Feedback : "+reponseDansListe[0].feedback;
                        }
    
                    }
                }

            } else if (question.type == QUESTION_TYPES.MATCH) {
                scoremaxi++;

                let correct = true;
                for(let i = 0; i < reponses[questionnumber].length; i++) {
                    if(!(reponses[questionnumber][i] == question.answers[i].match[1])) {
                        correct = false;
                    }
                }

                console.log("Réponse de l'étudiant : ");
                for(let i = 0; i < reponses[questionnumber].length; i++) {
                    console.log(question.answers[i].match[0]+" => "+reponses[questionnumber][i]);
                }

                if(correct) {
                    console.log("Réponse correcte !");
                    score += 1;
                } else {
                    console.log("Réponse incorrecte !");
                    console.log("Correction : ");

                    question.answers.forEach(element => {
                        console.log("- "+element.match[0]+" => "+element.match[1]);
                    });
                }

            } else if(question.type == QUESTION_TYPES.NUMERIC) {
                scoremaxi++;

                let correct = false;
                let indexReponseCorrect;
                let index = 0;

                console.log(question);

                for(let i = 0; i < question.answers.length; i++) {
                    if(question.answers[i].range) {
                        if(reponses[questionnumber] >= (question.answers[i].value-question.answers[i].range) && question.answers[i][questionnumber] <= (question.answers[i].value-question.answers[i].range)) {
                            correct = true;
                            indexReponseCorrect = index;
                            break;
                        }
                    } else {
                        if(reponses[questionnumber] == question.answers[i].value) {
                            correct = true;
                            indexReponseCorrect = index;
                            break;
                        }
                    }
                    index++;
                }

                console.log("Réponse de l'étudiant : "+reponses[questionnumber]);

                if(correct) {
                    console.log("Réponse correcte !");

                    if(question.answers[indexReponseCorrect].weight) {
                        score += question.answers[indexReponseCorrect].weight/100;
                    } else {
                        score += 1;
                    }

                } else {
                    console.log("Réponse incorrecte !");
                    console.log("Correction : ");

                    question.answers.forEach(element => {

                        if(element.weight) {
                            console.log("- "+element.value+" - Range : "+element.range+" - Pondération : "+element.weight);
                        } else {
                            console.log("- "+element.value+" - Range : "+element.range);
                        }

                    });
                }

            } else if (question.type == QUESTION_TYPES.TF) {
                scoremaxi++;

                let reponse;
                if(reponses[questionnumber] == "vrai") {
                    reponse = true;
                } else {
                    reponse = false;
                }

                console.log("Réponse de l'étudiant : "+reponses[questionnumber]);

                if(question.answers[0].correct == reponse) {
                    console.log("Réponse correcte !");
                    score += 1;
                } else {
                    console.log("Réponse incorrecte !");
                    console.log("Correction : "+question.answers[0].correct);
                }

            }

        }

        questionnumber++;

    });

    console.log("Score : "+score+" / "+scoremaxi);

}

let addVcard = function(logger) {

    if(getProfilFilesNames().length > 0) {

        console.log("\nAvez-vous déjà un profil au sein de notre base de données ? Entrez 'oui' ou 'non'");

        let reponseClavier = "";
        reponseClavier = prompt();
    
        while(reponseClavier.toLowerCase() != "oui" && reponseClavier.toLowerCase() != "non") {
            console.log("Veuillez entrer oui ou non !");
            reponseClavier = prompt();
        }
    
        if(reponseClavier == "oui") {
    
            return getExistingVcards(logger);
    
        } else {
    
            return createVCard();
    
        }

    } else {

        return createVCard();

    }

}

let createVCard = function() {

    console.log("Création de votre profil : \n");

        let reponseClavier = "";

        let aCard = {
            version: [{ value: '4.0' }]
        };

        console.log("Quel est votre nom ?");

        reponseClavier = prompt();

        while(!isNaN(reponseClavier) || reponseClavier == "") {
            console.log("Veuillez entrer du texte !");
            reponseClavier = prompt();
        }

        aCard.n = [{value: [reponseClavier]}];

        console.log("Quel est votre prénom ?");

        reponseClavier = "";
        reponseClavier = prompt();

        while(!isNaN(reponseClavier) || reponseClavier == "") {
            console.log("Veuillez entrer du texte !");
            reponseClavier = prompt();
        }

        aCard.n[0].value.push(reponseClavier);
        aCard.fn = [{value: aCard.n[0].value[0]+"_"+aCard.n[0].value[1]}];

        if (!getVCard(aCard.n[0].value[0]+"_"+aCard.n[0].value[1])) {

            console.log("Quelle est votre organisation ?");

            reponseClavier = "";
            reponseClavier = prompt();

            while(!isNaN(reponseClavier) || reponseClavier == "") {
                console.log("Veuillez entrer du texte !");
                reponseClavier = prompt();
            }

            aCard.org = [{value:reponseClavier}];

            console.log("Quelle est votre poste ?");

            reponseClavier = "";
            reponseClavier = prompt();

            while(!isNaN(reponseClavier) || reponseClavier == "") {
                console.log("Veuillez entrer du texte !");
                reponseClavier = prompt();
            }

            aCard.role = [{value:reponseClavier}];

            console.log("Voulez-vous affecter un titre à votre profil ? Entrez 'oui' ou 'non'");

            reponseClavier = "";
            reponseClavier = prompt();

            while(reponseClavier.toLowerCase() != "oui" && reponseClavier.toLowerCase() != "non") {
                console.log("Veuillez entrer oui ou non !");
                reponseClavier = prompt();
            }

            if(reponseClavier == "oui") {

                console.log("Veuillez entrer un titre : ");

                reponseClavier = "";
                reponseClavier = prompt();

                while(!isNaN(reponseClavier) || reponseClavier == "") {
                    console.log("Veuillez entrer du texte !");
                    reponseClavier = prompt();
                }

                aCard.title = [{value:reponseClavier}];

            }

            console.log("Quel est votre numéro de téléphone ? (format français)");

            reponseClavier = "";
            reponseClavier = prompt();

            let telRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

            while(reponseClavier == "" || !telRegex.test(reponseClavier)) {
                console.log("Veuillez entrer un format valide de numéro de téléphone !");
                reponseClavier = prompt();
            }

            aCard.tel = [{value:reponseClavier}];

            console.log("Quel est votre e-mail ?");

            reponseClavier = "";
            reponseClavier = prompt();

            let mailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            while(reponseClavier == "" || !mailRegex.test(reponseClavier)) {
                console.log("Veuillez entrer un format valide d'email' !");
                reponseClavier = prompt();
            }

            aCard.email = [{value:reponseClavier}];

            let cardToWrite = vCard.generate(aCard);
            fs.writeFile('./profils/'+aCard.fn[0].value+".vcf", cardToWrite, function(){console.log('écriture du fichier effectuée\n')});

            return aCard;

        } else {

            console.log("Erreur ! Vous avez déjà un profil en base.");

            return null;

        }

}

let getVCard = function(formattedName) {

    listVcfFiles = fs.readdirSync("./profils");
    let trouve = false;
    let index = 0;

    while(index < listVcfFiles.length && !trouve) {

        content = fs.readFileSync("./profils/"+listVcfFiles[index], 'utf-8');
        let card = vCard.parse(content);

        if(Object.keys(card).length != 0) {
            
            if(card.n[0].value[0]+"_"+card.n[0].value[1] == formattedName) {
                trouve = true;
            }

        }

        index++;
    }

    return trouve;

}

let getProfilFilesNames = function() {
    return fs.readdirSync("./profils").filter(element => element != ".gitkeep");
}

let getExistingVcards = function(logger) {

        let indexCard = 0;
        listVcfFiles = getProfilFilesNames();

        let Cards = [];
        
        listVcfFiles.forEach(filename => {

            let content = fs.readFileSync("./profils/"+filename,'utf8');

            console.log("\nVcard n°"+(indexCard+1)+" : \n");
            let card = vCard.parse(content);

            Cards.push(card);

            let affichage = "";

            affichage += "Version : "+card.version[0].value+"\n";

            for(let i = 0; i < card.n[0].value.length; i++) {
                if(i == 0) {
                    affichage += "Nom : "+card.n[0].value[i]+" ";
                } else if(i == 1) {
                    affichage += "Prénom : "+card.n[0].value[i];
                }
            }

            affichage += "\n";

            console.log(affichage);

            console.log("Nom formaté : "+card.fn[0].value);
            console.log("Organisation : "+card.org[0].value);

            if(card.title) {
                console.log("Titre : "+card.title[0].value);
            }

            console.log("Poste : "+card.role[0].value);
            console.log("Téléphone : "+card.tel[0].value);
            console.log("Email : "+card.email[0].value);

            console.log("\n");
    
            indexCard++;

        });

        console.log("Veuillez entrer le numéro de votre vCard : ");

        let reponseClavier = "";
        reponseClavier = prompt();

        while(isNaN(reponseClavier) || (parseInt(reponseClavier) < 1 || parseInt(reponseClavier) > listVcfFiles.length)) {
            console.log("Veuillez entrer un numéro valable !");
            reponseClavier = prompt();
        }

        return Cards[parseInt(reponseClavier-1)];

}

let getTestsEnCreationFilesNames = function() {
    return fs.readdirSync("./test_en_creation");
}

let getTestsValidesFilesNames = function(dirname) {

    dirname = dirname.replace('.gift','');

    return fs.readdirSync('./test_valide').filter(function (file) {
        return fs.statSync('./test_valide/'+file).isDirectory();
    });
}

let sommeQuestions = function(questions, numTest, logger) {

    let stats = {
        qcm:0,
        essay:0,
        description:0,
        matching:0,
        numeric:0,
        short:0,
        tf:0
    }

    questions.forEach(element => {
        
        switch(element.type) {
            case QUESTION_TYPES.MC:
                stats.qcm++;
                break;
            case QUESTION_TYPES.ESSAY:
                stats.essay++;
                break;
            case QUESTION_TYPES.DESCRIPTION:
                stats.description++;
                break;
            case QUESTION_TYPES.MATCH:
                stats.matching++;
                break;
            case QUESTION_TYPES.NUMERIC:
                stats.numeric++;
                break;
            case QUESTION_TYPES.SHORT:
                stats.short++;
                break;
            case QUESTION_TYPES.TF:
                stats.tf++;
                break;
        }

    });
    
    let somme = stats.qcm+stats.essay+stats.description+stats.matching+stats.numeric+stats.short+stats.tf;

    return [
        {"type_quest": "Qcm", "numero_test" : numTest, "pourcentage": (stats.qcm/(somme)*100).toFixed(2) },
        {"type_quest": "essai", "numero_test" : numTest, "pourcentage": (stats.essay/(somme)*100).toFixed(2) },
        {"type_quest": "description", "numero_test" : numTest, "pourcentage": (stats.description/(somme)*100).toFixed(2) },
        {"type_quest": "matching", "numero_test" : numTest, "pourcentage": (stats.matching/(somme)*100).toFixed(2) },
        {"type_quest": "numeric", "numero_test" : numTest, "pourcentage": (stats.numeric/(somme)*100).toFixed(2) },
        {"type_quest": "short", "numero_test" : numTest, "pourcentage": (stats.short/(somme)*100).toFixed(2) },
        {"type_quest": "vrai_faux", "numero_test" : numTest, "pourcentage": (stats.tf/(somme)*100).toFixed(2) }

      ]
}

module.exports = {
    afficheElements: afficheElements,
    filterQuestions: filterQuestions,
    viewQuestion: viewQuestion,
    simulateTest: simulateTest,
    addVcard: addVcard,
    getTestsEnCreationFilesNames: getTestsEnCreationFilesNames,
    getTestsValidesFilesNames: getTestsValidesFilesNames,
    sommeQuestions: sommeQuestions
};