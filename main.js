const getTest = async (type = 27) => {
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
  let test = await getTest(id);
  shuffle(test);
  test = test.slice(0, 8);

  let questionClass = "block";
  let cardClass = "active";
  const puzzleItemsHTML = document.querySelector(".puzzle__items-js");
  puzzleItemsHTML.innerHTML = `
    <div class="puzzle__item opened">
      <div class="puzzle__item-first active">
        <div class="puzzle__item-num">0</div>
      </div>
      <div class="puzzle__item-second">
        <img src="./images/1.jpg" alt="" />
      </div>
    </div>
  `;

  for (let i = 0; i < test.length; i++) {
    let answers = "";
    const question = test[i];
    const answersArray = [
      test[i].correct_answer,
      test[i].incorrect_answers[0],
      test[i].incorrect_answers[1],
    ];
    shuffle(answersArray);

    if (i !== 0) {
      questionClass = "hidden";
      cardClass = "";
    }


    for (let j = 0; j < 3; j++) {
      let answer = answersArray[j];

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
            ${question.question}
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

    const puzzleItemHTML = `<div class="puzzle__item" data-id="${i}">
        <div class="puzzle__item-first ${cardClass}">
          <div class="puzzle__item-num">${i + 1}</div>
        </div>
        <div class="puzzle__item-second">
          <img src="./images/${i + 2}.jpg" alt="">
        </div>
      </div>`;
    puzzleItemsHTML.innerHTML += puzzleItemHTML;
  }

  let correctAnswersCounter = 1;
  document.querySelectorAll(".puzzle__caption-js").forEach((item) => {
    item.textContent = `${test[0].category}`;
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

      if (answer.textContent.trim() == test[question_id].correct_answer) {
        correctAnswersCounter++;
        document.querySelector(".puzzle__result-num").textContent =
          correctAnswersCounter;
        document.querySelector(
          ".puzzle__progress-caption-js"
        ).textContent = `${Math.round((correctAnswersCounter * 100) / 9)}%`;
        document.querySelector(
          ".puzzle__progress-bar-green-js"
        ).style.width = `${Math.round((correctAnswersCounter * 100) / 9)}%`;
        answer.querySelector(".puzzle__input-check").innerHTML =
          '<img class="w-full opacity-0 object-cover" src="./images/input-checked.svg" alt="">';
        comment.classList.add("puzzle__comment");
        comment.innerHTML = `<div class="mb-2 text-green-600 text-base font-bold">
            Верно!
          </div>
          <div class="puzzle__comment-text">
            Вопрос уровня ${test[question_id].difficulty}
          </div>`;
        answer.classList.add("puzzle__input-container-correct");
        question
          .querySelectorAll(".puzzle__input-container-js")
          .forEach((item) => item.classList.add("pointer-events-none"));
        document
          .querySelector(".puzzle__item[data-id='" + question_id + "']")
          .classList.add("opened");
        if (correctAnswersCounter == 9) {
          document.querySelector(".puzzle__result-all").style.color = "#061b36";
        }
        if (document.querySelectorAll(".puzzle__item.opened").length == 9) {
          setTimeout(() => {
            document.querySelector(".buttons-wrap").style.display = "none";
            document.querySelector(".puzzle__handle").style.display = "none";
            document.querySelector(".puzzle__message").style.display = "block";
          }, 1000);
        }
      } else {
        answer.querySelector(".puzzle__input-check").innerHTML =
          '<img class="w-full opacity-0 object-cover" src="./images/input-error.svg" alt="">';
        comment.innerText = `Попробуй еще раз!`;
        comment.classList.add("puzzle__comment-false-js");
        document
          .querySelectorAll(".puzzle__input-container-js")
          .forEach((item) => item.classList.remove("text-red-600"));
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
    for (let i = 1; i < 9; i++) {
      document.querySelectorAll(".puzzle__item")[i].classList.remove("opened");
    }
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  puzzleStart();

  document.querySelectorAll(".btn-choose ").forEach((el) => {
    el.onclick = () => {
      reset();
      const id = el.dataset.id;
      puzzleStart(id);
    };
  });

  document.querySelector(".btn-caption").onclick = () => {
    document
      .querySelector(".puzzle__buttons")
      .classList.toggle("buttons-wrap_active");
  };

  document.addEventListener("mouseup", (e) => {
    if (!document.querySelector(".puzzle__buttons").contains(e.target)) {
      document
        .querySelector(".puzzle__buttons")
        .classList.remove("buttons-wrap_active");
    }
  });
});
