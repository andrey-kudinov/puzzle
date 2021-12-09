async function getTest(type = 27) {
  let url = `https://opentdb.com/api.php?amount=30&category=${type}&type=multiple`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });
  return await response;
}

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

document.addEventListener("DOMContentLoaded", () => {
  let id = 0;
  document.querySelectorAll(".btn-choose ").forEach((el) => {
    el.onclick = function () {
      id = el.dataset.id;
      document.querySelector(".puzzle__questions").innerHTML = "";
      document.querySelector(".puzzle__result-num").textContent = 1;
      document.querySelector(".puzzle__progress-caption-js").textContent = `11%`;
      document.querySelector(".puzzle__progress-bar-green-js").style.width = `11%`;

      if (document.querySelectorAll(".puzzle__item.opened").length > 1) {
        for (let i = 1; i < 9; i++) {
          document.querySelectorAll(".puzzle__item")[i].classList.remove("opened");
        }

        setTimeout(() => {
          getTest(id)
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              shuffle(data.results);
              puzzleStart(data.results);
            });
        }, 300);
      } else {
        getTest(id)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            shuffle(data.results);
            puzzleStart(data.results);
          });
      }
    };
  });

  getTest(27)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      shuffle(data.results);
      puzzleStart(data.results);
    });

  document.querySelector(".btn-caption").onclick = function () {
    document.querySelector(".puzzle__buttons").classList.toggle("buttons-wrap_active");
  };
  document.addEventListener("mouseup", function (e) {
    if (!document.querySelector(".puzzle__buttons").contains(e.target)) {
      document.querySelector(".puzzle__buttons").classList.remove("buttons-wrap_active");
    }
  });
});

async function puzzleStart(response) {
  let test = response;
  shuffle(test);
  test = test.slice(0, 8);

  let answerHTML;
  let puzzleHTML;

  let $class = "block";
  let cardClass = "active";

  for (let i = 0; i < test.length; i++) {
    if (i !== 0) {
      $class = "hidden";
      cardClass = "";
    }
    let answersArray = [test[i].correct_answer, test[i].incorrect_answers[0], test[i].incorrect_answers[1]];
    shuffle(answersArray);
    let answers = '';
    let question = test[i];
    for (let j = 0; j < 3; j++) {
      let answer = answersArray[j];
      let check = "";
      if (answer.correct) {
      }
      answerHTML =
        '<label class="puzzle__input-container" data-id="' +
        answer.id +
        '"><div class="relative flex-shrink-0 box-border w-7 h-7"><input type="radio" name="question' +
        i +
        '" class="puzzle__input absolute w-1 h-1 m-0 p-0 opacity-0"><div class="answers puzzle__input-check">' +
        check +
        '</div></div><span class="self-end ml-4 text-gray-800 text-base puzzle__answer">' +
        answer +
        "</span></label>";
      answers += answerHTML;
    }
    let questionHTML = `<div class="puzzle__question-container ${$class}" data-id="${i}" data-id-backend=${i}>
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
    document.querySelector(".puzzle__questions").innerHTML += questionHTML;
    puzzleHTML = `<div class="puzzle__item" data-id="${i}">
                                                      <div class="puzzle__item-first ${cardClass}">
                                                          <div class="puzzle__item-num">${i + 1}</div>
                                                      </div>
                                                      <div class="puzzle__item-second">
                                                          <img src="./images/${i + 2}.jpg" alt="">
                                                      </div>
                                                  </div>`;
    document.querySelector(".puzzle__items-js").innerHTML += puzzleHTML;
  }

  let correctAnswersCounter = 1;
  document.querySelectorAll(".puzzle__caption-js").forEach(function (item, index) {
    item.textContent = `${test[0].category}`;
  });
  document.querySelectorAll(".puzzle__input").forEach(function (item, index) {
    item.addEventListener("change", async function (e) {
      let $this = this;
      let question = $this.closest(".puzzle__question-container");
      let answer = $this.closest(".puzzle__input-container");
      let answer_id = answer.getAttribute("data-id");
      let question_id = $this.closest(".puzzle__question-container").getAttribute("data-id");
      let question_id_backend = $this.closest(".puzzle__question-container").getAttribute("data-id-backend");

      let comment = document.createElement("div");
      question.querySelectorAll(".puzzle__comment").forEach(function (item, index) {
        item.remove();
      });
      question.querySelectorAll(".puzzle__comment-false").forEach(function (item, index) {
        item.remove();
      });
      if (answer.textContent == test[question_id].correct_answer) {
        correctAnswersCounter++;
        document.querySelector(".puzzle__result-num").textContent = correctAnswersCounter;
        document.querySelector(".puzzle__progress-caption-js").textContent = `${Math.round((correctAnswersCounter * 100) / 9)}%`;
        document.querySelector(".puzzle__progress-bar-green-js").style.width = `${Math.round((correctAnswersCounter * 100) / 9)}%`;
        answer.querySelector(".puzzle__input-check").innerHTML =
          '<img class="w-full opacity-0 object-cover	 puzzle__input-check-error" src="./images/input-checked.svg" alt="">';
        comment.classList.add("puzzle__comment");
        comment.innerHTML = `<div class="mb-2 text-green-600 text-base font-bold">Верно!</div></div></div><div class="puzzle__comment-text">Вопрос уровня ${test[question_id].difficulty}</div>`;
        answer.classList.add("puzzle__input-container-correct");
        document.querySelectorAll(".puzzle__input-container").forEach(function (item, index) {
          item.classList.remove("puzzle__input-container-false");
        });
        question.querySelectorAll(".puzzle__input-container").forEach(function (item, index) {
          item.classList.add("puzzle__input-container_disable");
        });
        document.querySelector(".puzzle__item[data-id='" + question_id + "']").classList.add("opened");
        if (correctAnswersCounter == 9) {
          document.querySelector(".puzzle__result-all").style.color = "#061b36";
        }
        if (document.querySelectorAll(".puzzle__item.opened").length == 9) {
          setTimeout(function () {
            document.querySelector(".buttons-wrap").style.display = "none";
            document.querySelector(".puzzle__handle").style.display = "none";
            document.querySelector(".puzzle__message").style.display = "block";
          }, 1000);
        }
      } else {
        answer.querySelector(".puzzle__input-check").innerHTML =
          '<img class="w-full opacity-0 object-cover	 puzzle__input-check-error" src="./images/input-error.svg" alt="">';
        comment.innerText = `Попробуй еще раз!`;
        comment.classList.add("puzzle__comment-false");
        document.querySelectorAll(".puzzle__input-container").forEach(function (item, index) {
          item.classList.remove("text-red-600");
        });
        answer.classList.add("text-red-600");
      }
      answer.after(comment);
    });
  });
}

document.addEventListener("click", async function (e) {
  for (let target = e.target; target && target != this; target = target.parentNode) {
    if (target.matches(".puzzle__item:not(.opened)")) {
      const $this = target;
      const id = $this.getAttribute("data-id");
      document.querySelectorAll(".puzzle__question-container").forEach(function (item, index) {
        item.classList.remove("block");
        item.classList.add("hidden");
      });
      document.querySelector(".puzzle__question-container[data-id='" + id + "']").classList.remove("hidden");
      document.querySelector(".puzzle__question-container[data-id='" + id + "']").classList.add("block");
      document.querySelectorAll(".puzzle__item-first").forEach(function (item, index) {
        item.classList.remove("active");
      });
      $this.querySelector(".puzzle__item-first").classList.add("active");
    }
  }
});
