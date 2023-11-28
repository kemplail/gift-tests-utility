const cli = require("@caporal/core").default;
const GiftParser = require('./GiftParser.js');
const BanqueDonnees = require('./BanqueDonnees.js');
const QUESTION_TYPES = require('./constantes/QuestionType.js');
const Test = require("./Test.js");
const func = require("./CliFunctions.js");
const fs = require('fs');
const TEST_TYPES = require('./constantes/TestType');
const vCard = require('vcard-parser');
const vg = require('vega');
const vegalite = require('vega-lite');

const banque = new BanqueDonnees();

cli
	.version('vpf-parser-cli')
	.version('0.07')

    //Voir la liste des dossiers de la banque de données
    .command('viewfolders', 'Visualiser la liste des dossiers de la banque de données')
    .action(({args, options, logger}) => {

        logger.info("Liste des dossiers de la banque de données : \n");

        let elements = banque.listeQuestions.map(element => element.file.replace('./sujetB_data/','').replace('.gift',''));

        func.afficheElements(elements, logger);

        logger.info("\nPour ouvrir un dossier, veuillez entrer la commande suivante : openfolder <numero> \n");

	})

    //Ouvrir un dossier, en fonction des numéros de dossiers visibles dans la commande viewfolders
    .command('openfolder', 'Affiche les liste des questions présentes dans un dossier de questions')
	.argument('<numero>', 'Le numéro de dossier visible au sein de la commande "viewfolders"')
	.action(({args, options, logger}) => {
		
        let dossier = banque.listeQuestions[args.numero-1];

        if(dossier) {

            logger.info("\nContenu du dossier "+dossier.file.replace('./sujetB_data/','').replace('.gift','')+" : \n");

            let elements = dossier.questions.map(element => element.title);

            func.afficheElements(elements, logger);

            logger.info("\nPour filtrer un dossier, veuillez entrer la commande suivante : filter <numero> <filter> \n");
            logger.info("\nPour afficher un dossier, veuillez entrer la commande suivante : viewquestion <numerofolder> <numeroquestion> \n");

        } else {
            return logger.warn("Aucun dossier correspondant à ce numéro n'a été trouvé");
        }
			
	})

    //Ouvrir un dossier, en fonction des numéros de dossiers visibles dans la commande viewfolders
    .command('filterfolder', 'Filtre les questions par type de question : QCM / Vrai_Faux / Appariement / Rep_Courte / Rep_Num / Essai / Description')
    .argument('<numero>', 'Le numéro de dossier visible au sein de la commande "viewfolders"')
	.argument('<filter>', 'Le type de question par lequel il faut filtrer les questions du dossier choisi')
    .action(({args, options, logger}) => {

        let filtre;

        switch(args.filter.toLowerCase()) {
            case "qcm":
                filtre = QUESTION_TYPES.MC;
                break;
            case "vrai_faux":
                filtre = QUESTION_TYPES.TF;
                break;
            case "rep_courte":
                filtre = QUESTION_TYPES.SHORT;
                break;
            case "appariement":
                filtre = QUESTION_TYPES.MATCH;
                break;
            case "rep_num":
                filtre = QUESTION_TYPES.NUMERIC;
                break;
            case "essai":
                filtre = QUESTION_TYPES.ESSAY;
                break;
            case "description":
                filtre = QUESTION_TYPES.DESCRIPTION;
                break;
            default:
                return logger.warn("Veuillez entrer un filtre valide");
        }

        let dossier = banque.listeQuestions[args.numero-1];

        if(dossier) {

            if(dossier.questions.filter(element => element.type == filtre).length > 0) {

                logger.info("Questions du type "+filtre.toString()+" au sein du dossier "+dossier.file+" : \n");

                func.filterQuestions(dossier.questions,filtre,logger);

            } else {
                logger.info("Aucune question de ce type n'a été trouvé dans le dossier.");
            }

        } else {
            return logger.warn("Aucun dossier correspondant à ce numéro n'a été trouvé");
        }

        //QCM / Vrai_Faux / Rep_Courte / Mot_Manquant / Rep_Num / Essai / Appariement
			
	})

    //Afficher la question d'un dossier, en entrant le numéro de la question (ordre de la question dans le dossier), en fonction des numéros visibles dans la commande open folder <numero>
    .command('viewquestion', 'Affiche une question présente dans un dossier')
    .argument('<numerodossier>', 'Le numéro de dossier visible au sein de la commande "viewfolders"')
	.argument('<numeroquestion>', 'Le numéro de la question au sein du dossier, visible au sein de la commande "openfolder"')
    .action(({args, options, logger}) => {

        let dossier = banque.listeQuestions[args.numerodossier-1];

        if(dossier) {

            let question = dossier.questions[args.numeroquestion-1];

            if(question) {
                func.viewQuestion(question,logger);
            } else {
                return logger.warn("Aucune question correspondant à ce numéro dans le dossier n'a été trouvé");
            }

        } else {
            return logger.warn("Aucun dossier correspondant à ce numéro n'a été trouvé");
        }

    })

    .command('launchtest', 'Simuler la réalisation d\'un test valide (présent dans le dossier "test_valide")')
    .argument('<nomtest>', 'Nom du test au sein du dossier "test_valide"')
    .action(({args, options, logger}) => {

        let nomtest = args.nomtest.replace('gift','');
        let dir = './test_valide/'+nomtest;

        if(fs.existsSync(dir)) {
                
            let test = new Test(nomtest+".gift",TEST_TYPES.valide);
            func.simulateTest(test.parsedQuestions);

        } else {
            return logger.warn("Le test n'a pas été trouvé au sein du dossier 'test_valide'");
        }


    })

    .command('addquestion', 'Ajout d\'une question à un test en cours de création (présent dans le dossier "test_en_creation"')
    .argument('<nomtest>', 'Nom du test au sein du dossier "test_en_creation"')
    .argument('<numerodossier>', 'Le numéro de dossier visible au sein de la commande "viewfolders"')
    .argument('<numeroquestion>', 'Le numéro de la question au sein du dossier, visible au sein de la commande "openfolder"')
    .action(({args, options, logger}) => {

        let dossier = banque.listeQuestions[args.numerodossier-1];

        if(dossier) {

            let question = dossier.questions[args.numeroquestion-1];

            if(question) {
                
                let testFileName = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest+".gift" || element == args.nomtest);
            
                if(testFileName.length != 0) {

                    let test = new Test(testFileName[0],TEST_TYPES.creation);
                    
                    if(test.addQuestion(question)) {

                        test.writeTest();
                        logger.info("Question ajoutée !");

                    } else {

                        return logger.warn("Impossible d'ajouter la question ! (Celle ci est peut être déjà présente dans le test)");

                    }

                } else {
                    return logger.warn("Aucun fichier correspondant à ce nom de test n'a été trouvé au sein du dossier 'test_en_creation'");
                }

            } else {
                return logger.warn("Aucune question correspondant à ce numéro dans le dossier n'a été trouvé");
            }

        } else {
            return logger.warn("Aucun dossier correspondant à ce numéro n'a été trouvé");
        }

    })

    .command('deletequestion', 'Suppresion d\'une question d\'un test en cours de création (présent dans le dossier "test_en_creation"')
    .argument('<nomtest>', 'Nom du test au sein du dossier "test_en_creation"')
    .argument('<numeroquestion>', 'Le numéro de la question au sein du dossier, visible au sein de la commande "viewtest en_creation <nomdutest>"')
    .action(({args, options, logger}) => {

        let testFileName = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest+".gift" || element == args.nomtest);
            
        if(testFileName.length != 0) {

            let test = new Test(testFileName[0],TEST_TYPES.creation);
                    
            if(test.deleteQuestion(args.numeroquestion)) {

                test.writeTest();
                logger.info("Question supprimée !");

            } else {

                return logger.warn("Impossible de supprimer la question ! (Vous avez sûrement entré un numéro de question non trouvé)");

            }

            } else {
                return logger.warn("Aucun fichier correspondant à ce nom de test n'a été trouvé au sein du dossier 'test_en_creation'");
            }

    })

    .command('viewtest', 'Visualisation d\'un test')
    .argument('<type>', 'Type de test : "en_creation" ou "valide"')
    .argument('<nomtest>', 'Nom du test (présent dans le dossier "test_en_creation" ou "test_valide")')
    .action(({args, options, logger}) => {

        let type;
        switch(args.type.toLowerCase()) {
            case "en_creation":
                type = TEST_TYPES.creation;
                break;
            case "valide":
                type = QUESTION_TYPES.valide;
                break;
            default:
                return logger.warn("Veuillez entrer un type valide");
        }
        
        let testFileName;

        if(type == TEST_TYPES.creation) {
            testFileName = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest+".gift" || element == args.nomtest);
        } else {

            testFileName = func.getTestsValidesFilesNames(args.nomtest).filter(element => element == args.nomtest+".gift" || element == args.nomtest);

            if(testFileName.length != 0) {
                testFileName[0] = testFileName[0]+".gift";
            }

        }
            
        if(testFileName.length != 0) {

            let test = new Test(testFileName[0],type);

            if(test.parsedQuestions.length > 0) {

                for(let i = 0; i < test.parsedQuestions.length; i++) {
                    logger.info("\n > Question n°"+(i+1)+" : \n");
                    func.viewQuestion(test.parsedQuestions[i],logger);
                }
    
            } else {

                logger.info("Aucune question n'est présente dans le test.");

            }

        } else {
            return logger.warn("Aucun fichier de ce type correspondant à ce nom de test n'a été trouvé");
        }

    })

    .command('verifytest', 'Vérification de la conformité d\'un test en cours de création')
    .argument('<nomtest>', 'Nom du test (présent dans le dossier "test_en_creation")')
    .action(({args, options, logger}) => {

        let testFileName = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest+".gift" || element == args.nomtest);
        
        if(testFileName.length != 0) {

            let test = new Test(testFileName[0],TEST_TYPES.creation);

            if(!test.verifyTest()) {

                logger.info("Test non conforme !");

            } else {

                logger.info("Test conforme !");

            }

        } else {
            return logger.warn("Aucun fichier de test en création correspondant à ce nom de test n'a été trouvé");
        }

    })

    .command('createtest', 'Création d\'un test vide stocké dans le dossier "test_en_creation"')
    .argument('<nomtest>', 'Nom du test')
    .action(({args, options, logger}) => {

        let testFileName = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest+".gift" || element == args.nomtest);
        
        if(testFileName.length == 0) {

            fs.writeFile("./test_en_creation/"+args.nomtest+".gift","",function(){console.log('Création effectuée\n')});
            logger.info("Création du test effectué ! Vous pouvez maintenant ajouter des questions au test grâce à la commande 'addquestion'");

        } else {
            return logger.warn("Un test en création du même nom existe déjà !");
        }

    })

    .command('gentest', 'Génération du test : le test passe du statut en_creation à valide, s\'il est effectivement valide')
    .argument('<nomtest>', 'Nom du test')
    .action(({args, options, logger}) => {

        let testFileName = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest+".gift" || element == args.nomtest);
        
        if(testFileName.length > 0) {

            let test = new Test(testFileName[0],TEST_TYPES.creation);

            if(test.verifyTest()) {

                let card = func.addVcard();

                if(card) {

                    test.type = TEST_TYPES.valide;

                    var dir = './test_valide/'+testFileName[0].replace('.gift','');

                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    } else {
                        return logger.warn("Erreur dans la création du dossier du test - Un dossier de ce nom existe déjà");
                    }

                    let cardToWrite = vCard.generate(card);
                    fs.writeFile(dir+"/"+card.fn[0].value+".vcf", cardToWrite, function(){console.log('écriture du fichier effectuée\n')});

                    fs.unlink("./test_en_creation/"+testFileName[0], (err) => {
                        if (err) {
                            return logger.warn("Erreur à la suppression du test du dossier test_en_creation");
                        }
                    });
    
                    test.writeTest();

                    logger.info("Le test a bien été généré ! Trouvez le dans le dossier 'test_valide'");

                } else {
                    return logger.warn("Erreur dans l'initialisation de la vCard");
                }

            } else {
                return logger.warn("Génération du test (transformation en test valide) impossible car le test ne respecte pas les exigences");
            }

        } else {
            return logger.warn("Aucun fichier de test en création correspondant à ce nom de test n'a été trouvé");
        }

    })

    .command('getprofiltest', 'Affichage du profil d\'un test en cours de création ou valide (proportion de chaque type de question) : crée un fichier .svg et .png dans le répertoire graphiques')
    .argument('<type>', 'Type de test : "en_creation" ou "valide"')
    .argument('<nomtest>', 'Nom du test')
    .action(({args, options, logger}) => {

        let type;
        switch(args.type.toLowerCase()) {
            case "en_creation":
                type = TEST_TYPES.creation;
                break;
            case "valide":
                type = TEST_TYPES.valide;
                break;
            default:
                return logger.warn("Veuillez entrer un type accepté ('en_creation' ou 'valide')");
        }
        
        let testFileName;

        if(type == TEST_TYPES.creation) {
            testFileName = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest+".gift" || element == args.nomtest);
        } else {
            testFileName = func.getTestsValidesFilesNames(args.nomtest).filter(element => element == args.nomtest+".gift" || element == args.nomtest);

            if(testFileName.length != 0) {
                testFileName[0] = testFileName[0]+".gift";
            }

        }

        if(testFileName.length != 0) {
       
            let test = new Test(testFileName[0],type);

            let data= {

                "data": {
                  "values": func.sommeQuestions(test.parsedQuestions,logger)
                },
                "mark": {"type": "bar", "cornerRadiusEnd": 4},
                "encoding": {
                  "x": {"field": "type_quest", "type": "ordinal"},
                  "y": {"field": "pourcentage", "type": "quantitative"}
                }

            }

            const myChart = vegalite.compile(data).spec;

            var runtime = vg.parse(myChart);

            var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
            var myCanvas = view.toCanvas();
            myCanvas.then(function(res){
                fs.writeFileSync("./graphiques/result.png", res.toBuffer());
                view.finalize();
                logger.info("Graphique crée au sein du fichier : ./graphiques/result.png");
            })

            /* SVG version */
 
            var view = new vg.View(runtime).renderer('svg').run();
            var mySvg = view.toSVG();
            mySvg.then(function(res){
                fs.writeFileSync("./graphiques/result.svg", res)
                view.finalize();
                logger.info("Graphique crée au sein du fichier : ./graphiques/result.svg");
            });

        } else {
            return logger.warn("Aucun fichier de ce type correspondant à ce nom de test n'a été trouvé");
        }

    })

    .command('getprofilbd', 'Affichage du profil d\'un dossier de question au sein de la banque de données (proportion de chaque type de question) : crée un fichier .svg et .png dans le répertoire graphiques')
    .argument('<numerodossier>', 'Le numéro de dossier visible au sein de la commande "viewfolders"')
    .action(({args, options, logger}) => {

        let dossier = banque.listeQuestions[args.numerodossier-1];

       if(dossier) {
            
            let data= {

                "data": {
                "values": func.sommeQuestions(dossier.questions,logger)
                },
                "mark": {"type": "bar", "cornerRadiusEnd": 4},
                "encoding": {
                "x": {"field": "type_quest", "type": "ordinal"},
                "y": {"field": "pourcentage", "type": "quantitative"}
                }

            }

            const myChart = vegalite.compile(data).spec;

            var runtime = vg.parse(myChart);

            var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
            var myCanvas = view.toCanvas();
            myCanvas.then(function(res){
                fs.writeFileSync("./graphiques/result.png", res.toBuffer());
                view.finalize();
                logger.info("Graphique crée au sein du fichier : ./graphiques/result.png");
            })

            /* SVG version */
            var view = new vg.View(runtime).renderer('svg').run();
            var mySvg = view.toSVG();
            mySvg.then(function(res){
                fs.writeFileSync("./graphiques/result.svg", res)
                view.finalize();
                logger.info("Graphique crée au sein du fichier : ./graphiques/result.svg");
            });

        } else {
            return logger.warn("Aucun dossier correspondant à ce numéro n'a été trouvé");
        }

    })

    .command('compareprofiltest', 'Comparaison d\'un profil de test avec le profil d\'un autre test)  : crée un fichier .svg et .png dans le répertoire graphiques')
    .argument('<type1>', 'Type du test 1 : "valide" ou "en_creation"')
    .argument('<nomtest1>', 'Nom du test 1')
    .argument('<type2>', 'Type de test 2 : "valide" ou "en_creation"')
    .argument('<nomtest2>', 'Nom du test 2')
    .action(({args, options, logger}) => {

        let type1;
        let type2;

        switch(args.type1.toLowerCase()) {
            case "en_creation":
                type1 = TEST_TYPES.creation;
                break;
            case "valide":
                type1 = TEST_TYPES.valide;
                break;
            default:
                return logger.warn("Veuillez entrer un type accepté ('en_creation' ou 'valide')");
        }

        switch(args.type2.toLowerCase()) {
            case "en_creation":
                type2 = TEST_TYPES.creation;
                break;
            case "valide":
                type2 = TEST_TYPES.valide;
                break;
            default:
                return logger.warn("Veuillez entrer un type accepté ('en_creation' ou 'valide')");
        }

        let testFileName1;
        let testFileName2;

        if(type1 == TEST_TYPES.creation) {
            
            testFileName1 = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest1+".gift" || element == args.nomtest1);
        
        } else {

            testFileName1 = func.getTestsValidesFilesNames(args.nomtest1).filter(element => element == args.nomtest1+".gift" || element == args.nomtest1);

            if(testFileName1.length != 0) {
                testFileName1[0] = testFileName1[0]+".gift";
            }

        }

        if(type2 == TEST_TYPES.creation) {
            
            testFileName2 = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest2+".gift" || element == args.nomtest2);
        
        } else {

            testFileName2 = func.getTestsValidesFilesNames(args.nomtest2).filter(element => element == args.nomtest2+".gift" || element == args.nomtest2);

            if(testFileName2.length != 0) {
                testFileName2[0] = testFileName2[0]+".gift";
            }

        }

        if(testFileName1.length != 0 && testFileName2.length != 0) {
       
            let test1 = new Test(testFileName1[0],type1);
            let test2 = new Test(testFileName2[0],type2);

            let values = func.sommeQuestions(test1.parsedQuestions,1,logger).concat(func.sommeQuestions(test2.parsedQuestions,2,logger));

            let data = {

                "data": {
                "values":  values,
                },
        
                "mark": "bar",
                "encoding": {
                  "column": {"field": "type_quest", "header": {"orient": "bottom"}},
                  "y": {"field": "pourcentage", "type": "quantitative"},
                  "x": {"field": "numero_test", "axis": null},
                  "color": {"field": "numero_test"}
                },
                "config": {"view": {"stroke": "transparent"}}
              }

            const myChart = vegalite.compile(data).spec;

            var runtime = vg.parse(myChart);

            var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
            var myCanvas = view.toCanvas();
            myCanvas.then(function(res){
                fs.writeFileSync("./graphiques/result.png", res.toBuffer());
                view.finalize();
                logger.info("Graphique crée au sein du fichier : ./graphiques/result.png");
            })

            /* SVG version */
            var view = new vg.View(runtime).renderer('svg').run();
            var mySvg = view.toSVG();
            mySvg.then(function(res){
                fs.writeFileSync("./graphiques/result.svg", res)
                view.finalize();
                logger.info("Graphique crée au sein du fichier : ./graphiques/result.svg");
            });

        } else {
            return logger.warn("Aucun fichier de ce type correspondant à ce nom de test n'a été trouvé");
        }

    })

    .command('compareprofilbd', 'Comparaison d\'un profil de test avec le profil d\'un dossier de question de la base de données : crée un fichier .svg et .png dans le répertoire graphiques')
    .argument('<numerodossier>', 'Le numéro de dossier visible au sein de la commande "viewfolders"')
    .argument('<type>', 'Type de test : "en_creation" ou "valide"')
    .argument('<nomtest>', 'Nom du test')
    .action(({args, options, logger}) => {

       let dossier = banque.listeQuestions[args.numerodossier-1];

       if(dossier) {
            
            let type;
            switch(args.type.toLowerCase()) {
                case "en_creation":
                    type = TEST_TYPES.creation;
                    break;
                case "valide":
                    type = TEST_TYPES.valide;
                    break;
                default:
                    return logger.warn("Veuillez entrer un type accepté ('en_creation' ou 'valide')");
            }
            
            let testFileName;

            if(type == TEST_TYPES.creation) {
                testFileName = func.getTestsEnCreationFilesNames().filter(element => element == args.nomtest+".gift" || element == args.nomtest);
            } else {
                testFileName = func.getTestsValidesFilesNames(args.nomtest).filter(element => element == args.nomtest+".gift" || element == args.nomtest);

                if(testFileName.length != 0) {
                    testFileName[0] = testFileName[0]+".gift";
                }

            }

            if(testFileName.length != 0) {
        
                let test = new Test(testFileName[0],type);
                let values = func.sommeQuestions(dossier.questions,1,logger).concat(func.sommeQuestions(test.parsedQuestions,2,logger));

                let data = {

                    "data": {
                    "values":  values,
                    },
            
                    "mark": "bar",
                    "encoding": {
                    "column": {"field": "type_quest", "header": {"orient": "bottom"}},
                    "y": {"field": "pourcentage", "type": "quantitative"},
                    "x": {"field": "numero_test", "axis": null},
                    "color": {"field": "numero_test"}
                    },
                    "config": {"view": {"stroke": "transparent"}}
                }

                const myChart = vegalite.compile(data).spec;

                var runtime = vg.parse(myChart);

                var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
                var myCanvas = view.toCanvas();
                myCanvas.then(function(res){
                    fs.writeFileSync("./graphiques/result.png", res.toBuffer());
                    view.finalize();
                    logger.info("Graphique crée au sein du fichier : ./graphiques/result.png");
                })

                /* SVG version */
                var view = new vg.View(runtime).renderer('svg').run();
                var mySvg = view.toSVG();
                mySvg.then(function(res){
                    fs.writeFileSync("./graphiques/result.svg", res)
                    view.finalize();
                    logger.info("Graphique crée au sein du fichier : ./graphiques/result.svg");
                });

            } else {
                return logger.warn("Aucun fichier de ce type correspondant à ce nom de test n'a été trouvé");
            }

        } else {
            return logger.warn("Aucun dossier correspondant à ce numéro n'a été trouvé");
        }

    })

    // readme
	.command('readme', 'Affiche le fichier README.txt')
	.action(({args, options, logger}) => {
		fs.readFile("./README.txt", 'utf8', function(err, data){
			if(err){
				return logger.warn(err);
			}
			
			logger.info(data);
		});
		
	})

    cli.run(process.argv.slice(2));