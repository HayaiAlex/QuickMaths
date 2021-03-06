const hasTouch = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));

const startButton = document.getElementById("start-button");
startButton.addEventListener("click",startButtonClicked);

async function startButtonClicked() {
    console.log("Start");

    // hide start-container
    const startContainer = document.getElementById("start-container");
    startContainer.remove();


    // show question container and set starting time
    showQuestionContainer();
    
    let questionData = {};
    let startTime = Date.now();
    
    // show keypad if touch supported
    if (hasTouch) {
        setupKeypad()
    }

    // set a Question and wait for the answer before setting a new question
    let questionQuantity = 20
    let correctAnswers = 0;
    for (let questionNum=1; questionNum <= questionQuantity; questionNum++) {
        const results = await askQuestion(questionNum);
        let key = "question"+questionNum;
        questionData[key] = results;
        if (results.correct === true) {
            correctAnswers++;
        }
    }

    // after all questions hide the question container
    hideQuestionContainer();
    hideKeypad();
    let endTime = Date.now();

    // show results information
    let incorrectAnswers = questionQuantity - correctAnswers;
    let timeElapsed = endTime - startTime;
    showResults(incorrectAnswers,timeElapsed,questionData);
    console.log(questionData);

}

function setupKeypad() {
    // Hide regular submit button
    const submitButton = document.getElementById("question-container").querySelector("button");
    submitButton.remove();

    // Force hide keyboard from input textbox
    const input = document.getElementById("answer-input");
    input.readonly = "readonly";
    input.disabled = true;
    setTimeout(() => {
        input.blur();
        input.removeAttribute("readonly");
        input.removeAttribute("disabled");
    });

    // Setup keypad
    const keypadContainer = document.getElementById("keypad-container");
    keypadContainer.style.display = "flex";

    const keys = document.getElementsByClassName("key");
    for (let key=0;key<keys.length;key++) {
        keys[key].addEventListener("touchstart",() => {
            if (keys[key].id == "key-backspace") {
                input.value = input.value.substring(0,input.value.length-1)
            } else if (keys[key].id == "key-enter") {
                // enter event handled inside askQuestion due to dependencies
            } else if (keys[key].id == "key-minus") {
                if (Number(input.value) < 0) {
                    input.value = input.value.substring(1,input.value.length);
                } else if (Number(input.value) > 0) {
                    input.value = "-" + input.value;
                } else {
                    input.value = "-";
                }
            } else {
                input.value += keys[key].querySelector("p").innerText;
            };
        });
    }
}

function hideKeypad() {
    const keypadContainer = document.getElementById("keypad-container");
    keypadContainer.style.display = "none";
}

function showQuestionContainer() {
    const questionTemplate = document.getElementById("question-template");
    const questionClone = questionTemplate.content.cloneNode(true);
    const questionContainer = document.getElementById("question-container");
    questionContainer.append(questionClone);
}

function hideQuestionContainer() {
    const questionContainer = document.getElementById("question-container");
    questionContainer.remove();
}

function showResults(incorrectAnswers,milliseconds,questionData) {
    const resultsContainer = document.getElementById("results-container");
    const resultsTemplate = document.getElementById("results-template");
    const resultsClone = resultsTemplate.content.cloneNode(true);
    resultsContainer.append(resultsClone);

    const scoreText = document.getElementById("score").querySelector("p");
    scoreText.innerText = incorrectAnswers;

    const averageTime = document.getElementById("time").getElementsByTagName("p")[0];
    let averageT = 0;
    for (let question in questionData) {
        averageT += questionData[question].timeTaken;
    }
    averageT /= Object.keys(questionData).length;
    averageT = formatTime(averageT);
    averageTime.innerText = `Average: ${averageT}`

    const timeTotalText = document.getElementById("time").getElementsByTagName("p")[1];
    let formattedTime = formatTime(milliseconds);
    timeTotalText.innerText = `Completed in: ${formattedTime}`;

    const answerButton = document.getElementById("show-answers");
    answerButton.addEventListener("click",() => {

        showAnswers(questionData);
    });
}

function showAnswers(questions) {
    console.log("show answers")

    const answers = document.getElementById("answers-container");
    const answerTemplate = document.getElementById("answer-template");

    // if answers-container already contains answers, return
    // if (answers.querySelector("div")) {
    //     return
    // }

    const answerButton = document.getElementById("show-answers");
    answerButton.remove()
    
    const totalQuestions = Object.keys(questions).length;
    for (let i=1;i<=totalQuestions;i++) {
        const answer = answerTemplate.content.cloneNode(true);
        answers.append(answer);

        let answerBox = document.getElementsByClassName("answer");
        answerBox = answerBox[answerBox.length - 1];
        console.log(answerBox);
        num = "question"+i;

        answerBox.querySelector("h4").innerText = `Question ${questions[num].questionNumber}`;
        let question = questions[num].question.substring(8,questions[num].question.length-1);
        question += ` = ${questions[num].givenAnswer}`;
        answerBox.getElementsByClassName("question")[0].innerText = question;
        
        if (questions[num].correct) {
            answerBox.getElementsByClassName("cross")[0].remove();
            answerBox.getElementsByClassName("description")[0].innerText = "Good job!";
        } else {
            answerBox.getElementsByClassName("check")[0].remove();
            answerBox.getElementsByClassName("description")[0].innerText = `Answer: ${questions[num].correctAnswer}`;
        }
        
        const time = formatTime(questions[num].timeTaken);
        answerBox.getElementsByClassName("time")[0].innerText = `Time: ${time}`;

    }
        

}

function formatTime(milliseconds) {
    
    function addZero(i) {
        if (i < 10) {i = "0" + i}
        return i;
    }

    function addMillisecondZeroes(i) {
        if (i < 10) {i = "00" + i}
        else if (i < 100) {i = "0" + i}
        return i;
    }

    let d = new Date();
    d.setTime(milliseconds);
    let m = addZero(d.getMinutes());
    let s = addZero(d.getSeconds());
    let ms = addMillisecondZeroes(d.getMilliseconds());
    return `${m}:${s}:${ms}`;
}

function askQuestion(questionNum) {
    const questionContainer = document.getElementById("question-container");
    const questionHeader = questionContainer.querySelector("h3");
    const question = questionContainer.querySelector("p");

    // Select a random operator
    const operatorList = ["+","-","x","??"]
    const operator = operatorList[Math.floor(Math.random() * 4)];
    // operator = operatorList[3];

    // If multiplication or division, make the numbers smaller
    let num1, num2;
    if (operator === "+" || operator === "-") {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
    } else if (operator === "x") {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    } else if (operator === "??") {
        do {
            num1 = Math.floor(Math.random() * 12) + 4;
            num2 = Math.floor(Math.random() * 4) + 2;
        } while (num1%num2!==0 || num1===num2)
    }
    
    questionHeader.innerText = `Question ${questionNum}`;
    question.innerText = `What is ${num1} ${operator} ${num2}?`;

    console.log(`Set question: What is ${num1} ${operator} ${num2}?`);
    const startTime = Date.now();

    // Submit pressed, check answer
    return answerPromise = new Promise( resolve => {

        const textBox = questionContainer.querySelector("input");
        const submitButton = questionContainer.querySelector("button");
        const enterKey = document.getElementById("key-enter");

        function submittedAnswer(event) {
            // accept button submit or textbox enter events
            if (event.type == "keydown" && event.key != "Enter") {return};

            // return if the answer is correct
            const result = checkAnswer(num1,num2,operator);
            const timeElapsed = Date.now() - startTime;

            // remove event listeners to stop duplicate events existing simultaneiously
            if (hasTouch) {
                enterKey.removeEventListener("touchstart",submittedAnswer);
            } else {
                submitButton.removeEventListener("click",submittedAnswer);
            }
            textBox.removeEventListener("keydown",submittedAnswer);


            // finally return the results
            let results = {
                questionNumber: questionNum,
                question: question.innerText,
                timeTaken: timeElapsed,
                correctAnswer: result.answer,
                givenAnswer: result.givenAnswer,
                correct: result.correct,
            }
            resolve(results);
        }

        textBox.addEventListener("keydown",submittedAnswer);

        // add keypad event
        if (hasTouch) {
            enterKey.addEventListener("touchstart",submittedAnswer);
        } else { // submit button is only there if not using keypad
            submitButton.addEventListener("click",submittedAnswer);
        }
    
        function checkAnswer(num1,num2,operator) {
            const textBox = questionContainer.querySelector("input");
            const userAnswer = Number(textBox.value);
            textBox.value = "";
    
            switch (operator) {
                case "+":
                    console.log(num1+num2,userAnswer,num1+num2 === userAnswer)
                    return {answer: num1+num2, givenAnswer: userAnswer, correct: num1+num2 === userAnswer};
                case "-":
                    console.log(num1-num2,userAnswer,num1-num2 === userAnswer)
                    return {answer: num1-num2, givenAnswer: userAnswer, correct: num1-num2 === userAnswer};
                case "x":
                    console.log(num1*num2,userAnswer,num1*num2 === userAnswer)
                    return {answer: num1*num2, givenAnswer: userAnswer, correct: num1*num2 === userAnswer};
                case "??":
                    console.log(num1/num2,userAnswer,num1/num2 === userAnswer)
                    return {answer: num1/num2, givenAnswer: userAnswer, correct: num1/num2 === userAnswer};
            }
        }
    });
}