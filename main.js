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
      document.querySelector(".intensive-test__questions").innerHTML = "";
      document.querySelector(".step2-container__item-result_num").textContent = 1;
      document.querySelector(".puzzle__progress-caption").textContent = `11%`;
      document.querySelector(".puzzle__progress-bar_green").style.width = `11%`;

      if (document.querySelectorAll(".intensive-puzzle_item.opened").length > 1) {
        for (let i = 1; i < 9; i++) {
          document.querySelectorAll(".intensive-puzzle_item")[i].classList.remove("opened");
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
    document.querySelector(".buttons-wrap").classList.toggle("buttons-wrap_active");
  };
  document.addEventListener("mouseup", function (e) {
    if (!document.querySelector(".buttons-wrap").contains(e.target)) {
      document.querySelector(".buttons-wrap").classList.remove("buttons-wrap_active");
    }
  });
});

async function puzzleStart(response) {
  let test = response;
  shuffle(test);
  test = test.slice(0, 8);

  let answerHTML;
  let puzzleHTML;

  let $class = "d-block";
  let cardClass = "intensive-puzzle_item-first_active";

  document.querySelector(".intensive-test__puzzle").innerHTML = `
    <div class="intensive-puzzle_item opened">
      <div class="intensive-puzzle_item-first intensive-puzzle_item-first_active">
        <div class="intensive-puzzle_item-num">1</div>
      </div>
      <div class="intensive-puzzle_item-second">
        <img src="./images/1.jpg" alt="" />
      </div>
    </div>`;

  for (let i = 0; i < test.length; i++) {
    if (i !== 0) {
      $class = "d-none";
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
        '<label class="intensive-test__input-container question-container__answer-text" data-id="' +
        answer.id +
        '"><div class="intensive-test__input-wrapper intensive-test__input-wrapper"><input type="radio" name="question' +
        i +
        '" class="input intensive-test__input-checkbox"><div class="answers intensive-test__input-check">' +
        check +
        '</div></div><span class="intensive-test__input-text answerText question-container__answer ">' +
        answer +
        "</span></label>";
      answers += answerHTML;
    }
    let questionHTML = `<div class="intensive-test__question-container question-container ${$class}" data-id="${i}" data-id-backend=${i}>
                          <div class="question-container__head">
                              <div class="question-container__title">
                                  Вопрос ${i + 1}
                              </div>
                              <div class="question-container__caption">
                                  ${question.question}
                              </div>
                          </div>
                          <div class="question-container__body">
                              <div class="answers">
                                  ${answers}
                              </div>
                          </div>
                      </div>`;
    document.querySelector(".intensive-test__questions").innerHTML += questionHTML;
    puzzleHTML = `<div class="intensive-puzzle_item" data-id="${i}">
                                                      <div class="intensive-puzzle_item-first ${cardClass}">
                                                          <div class="intensive-puzzle_item-num">${i + 1}</div>
                                                      </div>
                                                      <div class="intensive-puzzle_item-second">
                                                          <img src="./images/${i + 2}.jpg" alt="">
                                                      </div>
                                                  </div>`;
    document.querySelector(".intensive-test__puzzle").innerHTML += puzzleHTML;
  }

  let correctAnswersCounter = 1;
  document.querySelectorAll(".puzzle__caption-js").forEach(function (item, index) {
    item.textContent = `${test[0].category}`;
  });
  document.querySelectorAll(".intensive-test__input-checkbox").forEach(function (item, index) {
    item.addEventListener("change", async function (e) {
      let $this = this;
      let question = $this.closest(".question-container");
      let answer = $this.closest(".intensive-test__input-container");
      let answer_id = answer.getAttribute("data-id");
      let question_id = $this.closest(".question-container").getAttribute("data-id");
      let question_id_backend = $this.closest(".question-container").getAttribute("data-id-backend");

      let comment = document.createElement("div");
      question.querySelectorAll(".question-container__comment").forEach(function (item, index) {
        item.remove();
      });
      question.querySelectorAll(".question-container__comment_error").forEach(function (item, index) {
        item.remove();
      });
      if (answer.textContent == test[question_id].correct_answer) {
        correctAnswersCounter++;
        document.querySelector(".step2-container__item-result_num").textContent = correctAnswersCounter;
        document.querySelector(".puzzle__progress-caption").textContent = `${Math.round((correctAnswersCounter * 100) / 9)}%`;
        document.querySelector(".puzzle__progress-bar_green").style.width = `${Math.round((correctAnswersCounter * 100) / 9)}%`;
        answer.querySelector(".intensive-test__input-check").innerHTML =
          '<img class="intensive-test__input-img intensive-test__input-check-error" src="./images/intensive-test-input-checked.svg" alt="">';
        comment.classList.add("question-container__comment");
        comment.innerHTML = `<div class="question-container__comment-title">Верно!</div></div></div><div class="question-container__comment-text">Вопрос уровня ${test[question_id].difficulty}</div>`;
        answer.classList.add("intensive-test__input-container-correct");
        document.querySelectorAll(".intensive-test__input-container").forEach(function (item, index) {
          item.classList.remove("intensive-test__input-container-false");
        });
        question.querySelectorAll(".intensive-test__input-container").forEach(function (item, index) {
          item.classList.add("intensive-test__input-container_disable");
        });
        document.querySelector(".intensive-puzzle_item[data-id='" + question_id + "']").classList.add("opened");
        if (correctAnswersCounter == 9) {
          document.querySelector(".step2-container__item-result__gray").style.color = "#061b36";
        }
        if (document.querySelectorAll(".intensive-puzzle_item.opened").length == 9) {
          setTimeout(function () {
            document.querySelector(".buttons-wrap").style.display = "none";
            document.querySelector(".step3-start").style.display = "none";
            document.querySelector(".step2-end").style.display = "block";
          }, 1000);
        }
      } else {
        answer.querySelector(".intensive-test__input-check").innerHTML =
          '<img class="intensive-test__input-img intensive-test__input-check-error" src="./images/intensive-test-input-error.svg" alt="">';
        comment.innerText = `Попробуй еще раз!`;
        comment.classList.add("question-container__comment_error");
        document.querySelectorAll(".intensive-test__input-container").forEach(function (item, index) {
          item.classList.remove("intensive-test__input-container-false");
        });
        answer.classList.add("intensive-test__input-container-false");
      }
      answer.after(comment);
    });
  });
}

document.addEventListener("click", async function (e) {
  for (let target = e.target; target && target != this; target = target.parentNode) {
    if (target.matches(".intensive-puzzle_item:not(.opened)")) {
      const $this = target;
      const id = $this.getAttribute("data-id");
      document.querySelectorAll(".question-container").forEach(function (item, index) {
        item.classList.remove("d-block");
        item.classList.add("d-none");
      });
      document.querySelector(".question-container[data-id='" + id + "']").classList.remove("d-none");
      document.querySelector(".question-container[data-id='" + id + "']").classList.add("d-block");
      document.querySelectorAll(".intensive-puzzle_item-first").forEach(function (item, index) {
        item.classList.remove("intensive-puzzle_item-first_active");
      });
      $this.querySelector(".intensive-puzzle_item-first").classList.add("intensive-puzzle_item-first_active");
    }
  }
});
