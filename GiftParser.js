const QUESTION_TYPES = require("./constantes/QuestionType.js");

const ANSWER_END = `
}`;
const ANSWER_SPACING = '  ';
const ANSWER_START = `{
`;
const ANSWER_NUMERIC_START = `{#
`;

const ANSWER_BLANKS = ' _____ ';
const FORMATS = {
  html: 'html',
  markdown: 'markdown',
  moodle: 'moodle',
  plain: 'plain'
};

const trueRegex = /^T$|^TRUE$/;
const falseRegex = /^F$|^FALSE$/;
const matchRegex = /->/;
const weightRegex1 = /^%(-?\d+\.?\d*?)%/;
const feedbackRegex = /#/;
const minMaxRegex = /\.\./;
const rangeRegex = /:/;
const weightRegex = /%(-?\d+\.?\d*)%/;
const answersRegex = /{([\s\S]*)}/;
const answersRegex1 = /{[\s\S]*}/;
const numberOfInputInQuestion = /\{.*?\}/g;
const formatRegex = /^\[(html|moodle|plain|markdown)\]/;
const titleRegex = /^::.+::/;
const titleRegex1 = /^::(.+)::[\s\S]+$/;
const ansFlagRegex = /[~=]/g;

//

const sumCorrectAnswers = (acc, answer) => acc + (answer.correct ? 1 : 0);
const sumIncorrectAnswers = (acc, answer) => acc + (answer.correct ? 0 : 1);
const classifyAnswer = answers => {
  const flags = {
    correct: answers.reduce(sumCorrectAnswers, 0),
    incorrect: answers.reduce(sumIncorrectAnswers, 0)
  };
  
  if (flags.incorrect > 0) {
    return QUESTION_TYPES.MC;
  }
  return QUESTION_TYPES.SHORT;
};

const matchAnswer = answer => {
  const parts = answer.split(matchRegex);
  const key = parts[0].substr(1).trim();
  const value = parts[1].trim();
  return {
    match: [key, value],
    type: QUESTION_TYPES.MATCH
  };
};
const tfAnswer = isCorrect => ({
  correct: isCorrect,
  type: QUESTION_TYPES.TF
});

const evaluateAnswer = answer => {
  let _answer = answer;
  let feedback;
  if (feedbackRegex.test(_answer)) {
    const answerSplit = _answer.split(feedbackRegex).map(d => d.trim());
    _answer = answerSplit[0];
    feedback = answerSplit.length > 2 ? answerSplit.slice(1) : answerSplit[1];
  }
  if (trueRegex.test(_answer)) {
    return withFeedback(feedback, tfAnswer(true));
  }
  if (falseRegex.test(_answer)) {
    return withFeedback(feedback, tfAnswer(false));
  }
  if (_answer[0] === '=' && matchRegex.test(_answer)) {
    return withFeedback(feedback, matchAnswer(_answer));
  }
  if (_answer.length === 0) {
    return {
      type: QUESTION_TYPES.ESSAY
    };
  }
  const result = {
    correct: _answer[0] === '='
  };
  _answer = _answer.substr(1).trim();

  if (weightRegex1.test(_answer)) {
    result.weight = parseFloat(_answer.match(weightRegex1)[1]);
    _answer = _answer.replace(weightRegex1, '');
  } else {
    result.weight = result.correct ? 100 : 0;
  }

  result.text = _answer.trim();

  return withFeedback(feedback, result);
};

const withFeedback = (feedback, answer) => {
  if (!feedback) {
    return answer;
  }

  return { ...answer, feedback };
};

const evaluateNumeric = answer => {
  if (minMaxRegex.test(answer)) {
    const numberSplit = answer.split(minMaxRegex).map(d => parseFloat(d));
    return {
      max: Math.max(...numberSplit),
      min: Math.min(...numberSplit)
    };
  }
  if (rangeRegex.test(answer)) {
    const numberSplit = answer.split(rangeRegex);
    return {
      value: parseFloat(numberSplit[0]),
      range: parseFloat(numberSplit[1])
    };
  }
  return { value: parseFloat(answer) };
};

const evaluateNumericAnswer = answer => {
  let _answer = answer;
  let feedback;
  if (feedbackRegex.test(_answer)) {
    const answerSplit = _answer.split(feedbackRegex).map(d => d.trim());
    _answer = answerSplit[0];
    feedback = answerSplit[1];
  }
  if (_answer[0] === '=') {
    _answer = _answer.substr(1);
    if (weightRegex.test(_answer)) {
      const weight = parseFloat(_answer.match(weightRegex)[1]);
      _answer = _answer.replace(weightRegex, '');
      const result = evaluateNumeric(_answer);
      result.weight = weight;
      return withFeedback(feedback, result);
    }
  }

  return withFeedback(feedback, evaluateNumeric(_answer));
};

    const separateAnswers = answers => {
      let regexResult;
      const splitAnswers = [];
      let start = 0;
      let end = 0;
      while ((regexResult = ansFlagRegex.exec(answers)) !== null) {
        end = regexResult.index;
        if (end === 0) {
          continue;
        }
    
        if (answers[end - 1] !== '\\') {
          splitAnswers.push(answers.substring(start, end).trim());
          start = end;
       }
      }
    
      splitAnswers.push(answers.substring(start).trim());
      return splitAnswers;
    };

  const isDescription = answerString => answerString === null;
  const isEssay = type => type === QUESTION_TYPES.ESSAY;
  const isNumeric = answerString => answerString[0] === '#';

  const removeComments = inputString => 
  inputString.split('\n')
    .map(d => d.trim())
    .filter(d => !/^\/\//.test(d)).join('\n');

  const isMultiChoice = function(input) {
    if(input.match(numberOfInputInQuestion)) {
      return input.match(numberOfInputInQuestion).length > 1;
    } else {
      return false;
    }
  }

  const parseMultipleChoices = function(input) {

    if(input.match(numberOfInputInQuestion)) {
      if (input.match(numberOfInputInQuestion).length > 1) {

        input = input.replace(/1:SA:/g,'');
        input = input.replace(/1:MC:/g,'');

        let title = titleRegex1.exec(input)[1];

        input = input.replace(/}/gi,'}²');
        input = input.split("²");
  
        if(!input[input.length-1].match(numberOfInputInQuestion)) {
  
          input[input.length-2] = input[input.length-2]+input[input.length-1];
          input.splice(input.length-1, 1);
          
        }

        for(let i = 1; i < input.length; i++) {
          input[i] = "::"+title+"::"+input[i];
        }

      }
    }

    return input;

  }

///////////////

let GiftParser = function(){
    this.parsedQuestions = [];
}

GiftParser.prototype.parseAFile = function(data){
    this.tokenize(data);
}

GiftParser.prototype.removeNewLines = function(data) {
    var filtered = data.filter(function (line) {
        return !line.match(/\r\n\r\n/) && !line.match(/\n\n/) ;
    });

    return filtered;
}

//Tokenize : Mettre les questions dans un format exploitable
GiftParser.prototype.tokenize = function(data) {

    data = removeComments(data);

    //Split les questions pour avoir une liste de questions
    var separator = /\r\n\r\n|\n\n/;
    data = data.split(separator)
    .map(d => d.replace(/\n/g, ' ').trim())
    .filter(d => d);

    //On retire les commentaires
    data = this.removeNewLines(data);

    indexToRemove = [];

    for(let i = 1; i < data.length; i++) {
      if(data[i][0] != ':') {
        data[0] = data[0]+data[i];
        indexToRemove.push(i);
      }
    }

    newData = [];

    for(let i = 0; i < data.length; i++) {
      if(!indexToRemove.includes(i)) {
        newData.push(data[i]);
      }
    }

   // console.log(newData);

    newData.forEach(element => {

      let global_question;

      if(isMultiChoice(element)) {

        let newArray = parseMultipleChoices(element);
        
        title = this.getQuestionTitle(newArray[0]);

        global_question = {
          title:title,
          questions:[],
          isMultiple:true
        };

        for(let i = 0; i < newArray.length; i++) {
          let questionToAdd = this.parseQuestion(newArray[i],true);

          if(i != newArray.length-1) {
            questionToAdd.body = questionToAdd.body+ANSWER_BLANKS;
          }

          global_question.questions.push(questionToAdd);
        }

        global_question.type = global_question.questions[0].type;

      } else {
        global_question = this.parseQuestion(element,false);
      }

      if(global_question.title != null) {
        this.parsedQuestions.push(global_question);
      }
    });

}

GiftParser.prototype.getQuestionAnswers = question => {
  if (!answersRegex.test(question)) {
    return null;
  }

  return answersRegex.exec(question)[1].trim().replace('~=','=');
};

GiftParser.prototype.getQuestionBody = question => {
  let modQuestion = question.trim();
  const result = {};
  if (titleRegex.test(modQuestion)) {
    modQuestion = modQuestion.replace(titleRegex, '').trim();
  }
  if (formatRegex.test(modQuestion)) {
    result.format = FORMATS[formatRegex.exec(modQuestion)[1]];
    modQuestion = modQuestion.replace(formatRegex, '').trim();
  }

  if(!modQuestion) {
    throw new Error('Question requires body text.');
  }

  const answerPieces = modQuestion
    .split(answersRegex1)
    .map(d => d.replace(/\n/g, ' ').trim())
    .filter(d => d);

  if (answerPieces.length > 1) {
    return {
      ...result,
      body: answerPieces.join(ANSWER_BLANKS),
      hasBlank: true
    };
  }

  return { ...result, body: answerPieces[0] };
};

GiftParser.prototype.getQuestionTitle = question => {
  
  if (!titleRegex1.test(question)) {
    return null;
  }

  return titleRegex1.exec(question)[1];
};

GiftParser.prototype.parseQuestion = function(question,isMultiple) {

  let result;

  if(!isMultiple) {
    result = {
      multiple:isMultiple
    };
  } else {
    result = {
      
    };
  }

  result.title = this.getQuestionTitle(question);
  try {
    const { body, format, hasBlank } = this.getQuestionBody(question);
    result.body = body;
    if (hasBlank) {
      result.hasBlank = hasBlank;
    }
    if (format) {
      result.format = format;
    }
  } catch (error) {
    // Manage bad input gracefully.
  }
  const answerString = this.getQuestionAnswers(question);

  if (isDescription(answerString)) {
    return {
      ...result,
      type: QUESTION_TYPES.DESCRIPTION
    };
  }
  if (isNumeric(answerString)) {
    return {
      ...result,
      answers: separateAnswers(answerString.substr(1).trim()).map(evaluateNumericAnswer),
      type: QUESTION_TYPES.NUMERIC
    };
  }
  answers = separateAnswers(answerString).map(evaluateAnswer);

  if (answers[0].type) {
    if (isEssay(answers[0].type)) {
      return {
        ...result,
        type: QUESTION_TYPES.ESSAY
      };
    }
    const type = answers[0].type;
    return {
      ...result,
      answers: answers.map(answer => {
        delete answer.type;
        return answer;
      }),
      type
    };
  }

  return {
    ...result,
    answers,
    type: classifyAnswer(answers)
  };
};

module.exports = GiftParser;