const startButton = document.getElementById("start-button");

startButton.addEventListener("click",startButtonClicked);

async function startButtonClicked() {
    console.log("Start");

    // hide start-container
    const startContainer = document.getElementById("start-container");
    startContainer.remove();

    // show question container and set starting time
    showQuestionContainer();
    let startTime = Date.now();
    console.log(startTime);

    // set a Question and wait for the answer before setting a new question
    let questionQuantity = 20
    let correctAnswers = 0;
    for (let questionNum=1; questionNum <= questionQuantity; questionNum++) {
        const result = await askQuestion(questionNum);
        if (result === true) {
            correctAnswers++;
        }
    }

    // after all questions hide the question container
    hideQuestionContainer();
    let endTime = Date.now();

    // show results information
    let incorrectAnswers = questionQuantity - correctAnswers;
    let timeElapsed = endTime - startTime;
    showResults(incorrectAnswers,timeElapsed);

}

function showQuestionContainer() {
    const questionTemplate = document.getElementById("question-template");
    const questionClone = questionTemplate.content.cloneNode(true);
    document.body.querySelector("main").append(questionClone);
}

function hideQuestionContainer() {
    const questionContainer = document.getElementById("question-container");
    questionContainer.remove();
}

function showResults(incorrectAnswers,milliseconds) {
    const resultsTemplate = document.getElementById("results-template");
    const resultsClone = resultsTemplate.content.cloneNode(true);
    document.body.querySelector("main").append(resultsClone);

    const scoreText = document.getElementById("score").querySelector("p");
    scoreText.innerText = incorrectAnswers;

    const timeText = document.getElementById("time").querySelector("p");
    let formattedTime = formatTime(milliseconds);
    timeText.innerText = `Completed in: ${formattedTime}`;
}

function formatTime(milliseconds) {
    
    function addZero(i) {
        if (i < 10) {i = "0" + i}
        return i;
    }

    let d = new Date();
    d.setTime(milliseconds);
    let m = addZero(d.getMinutes());
    let s = addZero(d.getSeconds());
    return m + ":" + s;
}

function askQuestion(questionNum) {
    const questionContainer = document.getElementById("question-container");
    const questionHeader = questionContainer.querySelector("h3");
    const question = questionContainer.querySelector("p");

    // Select a random operator
    const operatorList = ["+","-","x","÷"]
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
    } else if (operator === "÷") {
        do {
            num1 = Math.floor(Math.random() * 12) + 4;
            num2 = Math.floor(Math.random() * 4) + 2;
        } while (num1%num2!==0 || num1===num2)
    }
    
    questionHeader.innerText = `Question ${questionNum}`;
    question.innerText = `What is ${num1} ${operator} ${num2}?`;

    console.log(`Set question: What is ${num1} ${operator} ${num2}?`);

    // Submit pressed, check answer
    return answerPromise = new Promise( resolve => {

        const textBox = questionContainer.querySelector("input");
        const submitButton = questionContainer.querySelector("button");

        function submittedAnswer(event) {
            // accept button submit or textbox enter events
            if (event.type == "click" || event.type == "keydown" && event.key == "Enter") {
                // return if the answer is correct
                const result = checkAnswer(num1,num2,operator);

                // remove event listeners to stop duplicate events existing simultaneiously
                submitButton.removeEventListener("click",submittedAnswer);
                textBox.removeEventListener("keydown",submittedAnswer);

                // finally return the result
                resolve(result);
            }
        }

        submitButton.addEventListener("click",submittedAnswer);
        textBox.addEventListener("keydown",submittedAnswer);

    
        function checkAnswer(num1,num2,operator) {
            const textBox = questionContainer.querySelector("input");
            const userAnswer = Number(textBox.value);
            textBox.value = "";
    
            switch (operator) {
                case "+":
                    console.log(num1+num2,userAnswer,num1+num2 === userAnswer)
                    return num1+num2 === userAnswer;
                case "-":
                    console.log(num1-num2,userAnswer,num1-num2 === userAnswer)
                    return num1-num2 === userAnswer;
                case "x":
                    console.log(num1*num2,userAnswer,num1*num2 === userAnswer)
                    return num1*num2 === userAnswer;
                case "÷":
                    console.log(num1/num2,userAnswer,num1/num2 === userAnswer)
                    return num1/num2 === userAnswer;
            }
        }
    });
}