const getQuiz = async (type = 27) => {
  const url = `https://opentdb.com/api.php?amount=30&category=${type}&type=multiple`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });
  const data = await response.json();
  return data.results;
};

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

const puzzleStart = async (id) => {
  const quiz = (await getQuiz(id)).slice(0, 8);
  shuffle(quiz);

  let questionClass = "block";
  let cardClass = "active";
  const puzzleItemsHTML = document.querySelector(".puzzle__items-js");
  puzzleItemsHTML.innerHTML = `
    <div
      class="puzzle__item opened relative w-1/4 h-auto sm:w-24 sm:h-24 m-1 rounded"
      data-aos="fade-up-right"
      data-aos-once="true"
    >
      <div class="puzzle__item-first absolute w-full h-full transition-transform duration-1000 bg-gray-400 active">
        <div class="puzzle__item-num">0</div>
      </div>
      <div class="puzzle__item-second">
        <img 
          src="./images/1.jpg"
          alt="puzzle item"
          class="block w-full h-full object-contain"
        />
      </div>
    </div>
  `;

  for (let i = 0; i < quiz.length; i++) {
    let answers = "";
    const currentQuiz = quiz[i];
    const answersArray = [
      currentQuiz.correct_answer,
      currentQuiz.incorrect_answers[0],
      currentQuiz.incorrect_answers[1],
    ];
    shuffle(answersArray);

    if (i !== 0) {
      questionClass = "hidden";
      cardClass = "";
    }

    for (let j = 0; j < 3; j++) {
      const answer = answersArray[j];

      const answerHTML =
        `<label class="puzzle__input-container-js flex mb-5 cursor-pointer">
          <div class="relative flex-shrink-0 box-border w-7 h-7">
            <input type="radio" name="question${i}" class="puzzle__input absolute w-1 h-1 m-0 p-0 opacity-0">
            <div class="answers puzzle__input-check"></div>
          </div>
          <span class="self-end ml-4 text-gray-800 text-base puzzle__answer">
            ${answer}
          </span>
        </label>`;

      answers += answerHTML;
    }

    const questionHTML = `
      <div class="puzzle__question-container ${questionClass}" data-id="${i}">
        <div>
          <div class="mb-2 text-yellow-400 text-lg font-bold">
            Вопрос ${i + 1}
          </div>
          <div class="mb-5 pb-5 text-grey-800 sm:border-b border-solid	border-gray-200	text-base font-bold">
            ${currentQuiz.question}
          </div>
        </div>
        <div>
          <div class="answers">
            ${answers}
          </div>
        </div>
      </div>`;
    const questionsHTML = document.querySelector(".puzzle__questions");
    questionsHTML.innerHTML += questionHTML;
    const animations = [
      'fade-up',
      'fade-down',
      'fade-left',
      'fade-right',
      'fade-up-right',
      'fade-up-left',
      'fade-down-right',
      'fade-down-left'
    ]

    const puzzleItemHTML = `
      <div
        class="puzzle__item relative w-1/4 h-auto sm:w-24 sm:h-24 m-1 rounded"
        data-id="${i}"
        data-aos=${animations[Math.floor(Math.random()*animations.length)]}
        data-aos-once="true"
      >
        <div 
          class="puzzle__item-first absolute w-full h-full transition-transform duration-1000 bg-gray-200 cursor-pointer hover:opacity-50 active:bg-gray-200 ${cardClass}"
        >
          <div class="puzzle__item-num">${i + 1}</div>
        </div>
        <div 
          class="puzzle__item-second transition-transform duration-1000"
          style="backface-visibility: hidden"
        >
          <img 
            src="./images/${i + 2}.jpg" 
            alt="puzzle item"
            class="block w-full h-full object-contain"
          >
        </div>
      </div>`;
    puzzleItemsHTML.innerHTML += puzzleItemHTML;
  }

  let correctAnswersCounter = 1;
  document.querySelectorAll(".puzzle__caption-js").forEach((item) => {
    item.textContent = `${quiz[0].category}`;
  });
  document.querySelectorAll(".puzzle__input").forEach((item) => {
    item.addEventListener("change", async (e) => {
      const question = e.target.closest(".puzzle__question-container");
      const answer = e.target.closest(".puzzle__input-container-js");
      const question_id = e.target.closest(".puzzle__question-container")
        .dataset.id;

      const comment = document.createElement("div");
      const comments = question.querySelectorAll(".puzzle__comment");
      comments.forEach((comment) => comment.remove());
      const falseComments = question.querySelectorAll(
        ".puzzle__comment-false-js"
      );
      falseComments.forEach((item) => item.remove());
      const inputHTML = answer.querySelector(".puzzle__input-check")
      const inputsContainer = question.querySelectorAll(".puzzle__input-container-js")

      if (answer.textContent.trim() == quiz[question_id].correct_answer) {
        correctAnswersCounter++;
        const correctAnswersCounterHTML = document.querySelector(".puzzle__result-num");
        correctAnswersCounterHTML.textContent = correctAnswersCounter;

        const correctAnswersPercentHTML = document.querySelector(".puzzle__progress-caption-js")
        correctAnswersPercentHTML.textContent = `${Math.round((correctAnswersCounter * 100) / 9)}%`;

        const progressHTML = document.querySelector(".puzzle__progress-bar-green-js")
        progressHTML.style.width = `${Math.round((correctAnswersCounter * 100) / 9)}%`;

        inputHTML.innerHTML ='<img class="w-full opacity-0 object-cover" src="./images/input-checked.svg" alt="">';

        comment.classList.add("puzzle__comment");
        comment.innerHTML = `
          <div class="mb-2 text-yellow-400 text-base font-bold">
            Верно!
          </div>
          <div class="puzzle__comment-text">
            Вопрос уровня ${quiz[question_id].difficulty}
          </div>`;

        answer.classList.add("puzzle__input-container-correct");

        inputsContainer.forEach((input) => input.classList.add("pointer-events-none"));

        const puzzleItem = document.querySelector(`.puzzle__item[data-id="${question_id}"]`)
        puzzleItem.classList.add("opened");

        if (correctAnswersCounter == 9) {
          document.querySelector(".puzzle__result-all").style.color = "#061b36";
        }
        const puzzleItemsOpened = document.querySelectorAll(".puzzle__item.opened")
        if (puzzleItemsOpened.length == 9) {
          setTimeout(() => {
            document.querySelector(".puzzle__buttons-js").style.display = "none";
            document.querySelector(".puzzle__buttons-js").nextElementSibling.style.display = "none";
            document.querySelector(".puzzle__handle").style.display = "none";
            document.querySelector(".puzzle__message").style.display = "block";
          }, 1000);
        }
      } else {
        inputHTML.innerHTML =
          '<img class="w-full opacity-0 object-cover" src="./images/input-error.svg" alt="">';
        comment.innerText = `Попробуй еще раз!`;
        comment.classList.add("puzzle__comment-false-js");
        inputsContainer.forEach((item) => item.classList.remove("text-red-600"));
        answer.classList.add("text-red-600");
      }
      answer.after(comment);
    });
  });

  const puzzleItems = document.querySelectorAll(".puzzle__item");
  puzzleItems.forEach((puzzleItem) => {
    puzzleItem.onclick = (e) => {
      if (!e.currentTarget.classList.contains("opened")) {
        const id = e.currentTarget.dataset.id;
        const questions = document.querySelectorAll(
          ".puzzle__question-container"
        );
        const question = document.querySelector(
          `.puzzle__question-container[data-id="${id}"]`
        );
        const puzzleItemsFront = document.querySelectorAll(
          ".puzzle__item-first"
        );

        questions.forEach((question) => {
          question.classList.remove("block");
          question.classList.add("hidden");
        });
        question.classList.remove("hidden");
        question.classList.add("block");
        puzzleItemsFront.forEach((item) => item.classList.remove("active"));
        
        e.currentTarget
          .querySelector(".puzzle__item-first")
          .classList.add("active");
      }
    };
  });
};

const reset = () => {
  document.querySelector(".puzzle__questions").innerHTML = "";
  document.querySelector(".puzzle__result-num").textContent = 1;
  document.querySelector(".puzzle__progress-caption-js").textContent = `11%`;
  document.querySelector(".puzzle__progress-bar-green-js").style.width = `11%`;

  if (document.querySelectorAll(".puzzle__item.opened").length > 1) {
    document.querySelectorAll(".puzzle__item").forEach(item => {
      item.classList.remove("opened");
    })
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  puzzleStart();

  document.querySelectorAll(".btn-choose ").forEach((button) => {
    button.onclick = () => {
      reset();
      puzzleStart(button.dataset.id);
    };
  });

  document.querySelector(".btn-caption-js").onclick = () => {
    document
      .querySelector(".puzzle__buttons-js")
      .classList.toggle("buttons-wrap_active");
  };

  document.addEventListener("mouseup", (e) => {
    if (!document.querySelector(".puzzle__buttons-js").contains(e.target)) {
      document
        .querySelector(".puzzle__buttons-js")
        .classList.remove("buttons-wrap_active");
    }
  });
});
