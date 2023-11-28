Bonjour! Vous trouverez ci-dessous l'ensemble des commandes necessaires pour pouvoir creer des tests a votre gise, au format GIFT. Mais aussi pour pouvoir avoir des informations sur ces derniers a travers des graphiques sous forme d'histogrammes.
Vous trouverez dans le repertoire du logiciel plusieurs dossiers, voici quelques informations sur les dossiers que vous aurez a manipuler :

-graphiques: contiendra les graphes generés suit aux commandes 'getprofiltest', 'getprofilbd', 'compareprofiltest', 'compareprofilbd'.
-SujetB_data: contient les dossiers de questions au format GIFT dont l'utilisateur va user pour creer son test. Mais contiendra aussi celles que l'utilisateur utilisera pour les commandes 'getprofilbd' et 'compareprofilbd' .
-test_en_creation: contiendra les tests au format GIFT qui seront en cours de creation.
-test_valide: contiendra les dossiers des tests finis, ces dossiers contiendront donc le test au format GIFT ainsi le fichier VCARD de son createur.

Voici les commandes que vous aurez a utiliser:

- viewfolders : Permet de visualiser la liste des dossiers de questions (situés dans le dossier 'SujetB_data').

- openfolder <numero> : Affiche la liste des questions présentes dans un dossier de questions.
    '<numero>' : Numéro de dossier, visible suite a l'utilisation de la commande "viewfolders".

- filterfolder <numero> <filter> : Permet de filtrer les questions d'un dossier de questions (situé dans le dossier 'SujetB_data') par type de question. 
    '<numero>': Numéro de dossier, visible suite a l'utilisation de la commande "viewfolders".
    '<filter>': Type de question par lequel il faut filtrer les questions du dossier choisi: QCM / Vrai_Faux / Rep_Courte / Rep_Num / Essai / Description / Appariement.

- viewquestion <numerodossier> <numeroquestion> : Permet d'afficher une question présente dans un dossier de questions (situé dans le dossier 'SujetB_data').
    '<numerodossier>': Numéro de dossier, visible suite a l'utilisation de la commande "viewfolders".
    '<numeroquestion>': Numéro de la question au sein du dossier, visible suite a l'utilisation de la commande "openfolder".

- createtest <nomtest>: Permet la création d'un test vide qui sera stocké dans le dossier "test_en_creation".
    '<nomtest>': Nom du test.

- addquestion <nomtest> <numerodossier> <numeroquestion> : Permet l'ajout d'une question à un test en cours de création (test présent dans le dossier "test_en_creation").
    '<nomtest>': Nom du test au sein du dossier "test_en_creation".
    '<numerodossier>': Numéro de dossier contenant la question, visible au sein de la commande "viewfolders".
    '<numeroquestion>': Numéro de la question au sein du dossier, visible au sein de la commande "openfolder".

- deletequestion <nomtest> <numeroquestion> : Permet la suppresion d'une question d'un test en cours de création (test présent dans le dossier "test_en_creation"')
    '<nomtest>': Nom du test au sein du dossier "test_en_creation".
    '<numeroquestion>': Numéro de la question au sein du dossier, visible suite a l'utilisation de la commande "viewtest en_creation <nomdutest>" .

- verifytest <nomtest> : Permet la vérification de la conformité d'un test en cours de création (donc situé dans le dossier "test_en_creation") (Verifie s'il contient entre 15 et 20 questions sans doublons).
    '<nomtest>': Nom du test (présent dans le dossier "test_en_creation").

- gentest <nomtest>: Permet la génération du test (il est genere dans le dossier 'test_valide' et supprimé du dossier 'test_en_creation') le test passe du statut 'en_creation' à 'valide', s'il est bien conforme.
    '<nomtest>': Nom du test.

Durant l'execution de cette commande, si vous n'aviez jamais genere de test avant, on vous demandera de rentrer certains informations sur vous-meme pour pouvoir creer un fichier Vcard qui sera genere en meme temps que le test, les deux seront placés dans un dossier ayant le meme nom que le test, dans le dossier 'test_valide'.
Si vous en aviez deja créé avant, vous aurez a choisir votre profil parmi une liste de profil (située dans le dossier "profils").
Faites attentions! Une fois un test genere, on ne peut plus le modifier, donc revoyez bien de temps en temps votre test avec la commande 'viewtest' ci-dessous, avant de la generer.

- viewtest <type> <nomtest> : Permet l'affichage d'un test.
    '<type>': statut du test : "en_creation" ou "valide".
    '<nomtest>': Nom du test (présent dans le dossier "test_en_creation" ou "test_valide").

- launchtest <nomtest> : Permet de simuler la réalisation d'un test valide (présent dans le dossier "test_valide").
    '<nomtest>': Nom du test.

- getprofiltest <type> <nomtest>: Permet la generation du profil d'un test en cours de création ou valide (proportion de chaque type de question). Un fichier svg et un fichier png sont créés dans le dossier 'graphiques'.
    '<type>': Type du test : "en_creation" ou "valide".
    '<nomtest>': Nom du test.

- getprofilbd <numerodossier>: Permet la generation du profil d'un dossier de question situé dans le dossier 'SujetB_data' (proportion de chaque type de question). Un fichier svg et un fichier png sont créés dans le dossier 'graphiques'.
    '<numerodossier>': Numéro de dossier visible au sein de la commande "viewfolders".

- compareprofiltest <type1> <nomtest1> <type2> <nomtest2>: Permet la comparaison d'un profil de test avec le profil d'un autre test. Un fichier svg et un fichier png sont créés dans le dossier 'graphiques'.
    '<type1>': Type du test 1 : "valide" ou "en_creation".
    '<nomtest1>': Nom du test 1.
    '<type2>': Type de test 2 : "valide" ou "en_creation".
    '<nomtest2>': 'Nom du test 2.

- compareprofilbd <numerodossier> <type> <nomtest>: Permet la comparaison d'un profil de test avec le profil d'un dossier de question situé dans le dossier 'SujetB_data'. Un fichier svg et un fichier png sont créés dans le dossier 'graphiques'.
    '<numerodossier>': Numéro de dossier visible au sein de la commande "viewfolders".
    '<type>': Type de test : "en_creation" ou "valide".
    '<nomtest>': Nom du test.