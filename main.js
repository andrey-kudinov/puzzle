async function getTest(type = 27) {
  // Default options are marked with *
  let url = `https://opentdb.com/api.php?amount=30&category=${type}&type=multiple`;
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
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
      document.querySelector(".step2-container__item-result_num").textContent = 0;
      document.querySelector(".step2-container__progress-caption").textContent = `0%`;
      document.querySelector(".step2-container__progress-bar_green").style.width = `0%`;
      getTest(id)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          shuffle(data.results);
          start(data.results);
        });
    };
  });

  getTest(27)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      shuffle(data.results);
      start(data.results);
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

function start(response) {
  let test = response;
  let test_step = 0;
  shuffle(test);
  test = test.slice(0, 5);
  let answerHTML = "";
  let $class = "d-block";
  let cardClass = "intensive-puzzle__item-first_active";

  document.querySelectorAll(".step2-item__title-js")[0].textContent = `${test[0].category}`;
  document.querySelectorAll(".step2-item__title-js")[1].textContent = `Вопросы из категории ${test[0].category}`;
  for (let i = 0; i < test.length; i++) {
    if (i !== 0) {
      $class = "d-none";
      cardClass = "";
    }
    let answersArray = [test[i].correct_answer, test[i].incorrect_answers[0], test[i].incorrect_answers[1], test[i].incorrect_answers[2]];

    shuffle(answersArray);
    let answers = "";
    let question = test[i];
    for (let j = 0; j < 4; j++) {
      let answer = answersArray[j];
      let check = "";
      // let check = `<img class="intensive-test__input-check-error" src="./images/intensive-test-input-error.svg" alt="">`;
      if (answer == test[i].correct_answer) {
        // check = `<img class="intensive-test__input-img intensive-test__input-check-checked" src="./images/intensive-test-input-checked.svg" alt="">`;
      } else {
        // check = `<img class="intensive-test__input-img intensive-test__input-check-error" src="./images/intensive-test-input-error.svg" alt="">`;
      }
      answerHTML =
        '<label class="intensive-test__input-container question-container__answer-text" data-id="' +
        i +
        '"><div class="intensive-test__input-wrapper intensive-test__input-wrapper"><input type="radio" name="question' +
        i +
        '" class="input step2__input-checkbox"><div class="answers intensive-test__input-check">' +
        check +
        '</div></div><span class="intensive-test__input-text answerText question-container__answer step2-container__answer">' +
        answer +
        "</span></label>";
      answers += answerHTML;
    }
    let questionHTML = `<div class="intensive-test__question-container question-container ${$class}" data-id=${i} data-id-backend=${i}>
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
  }

  {
    let correctAnswersCounter = 0;
    let falseAnswersCounter = 0;
    // await checkAnswer(parseInt(question_id)+10, answer_id).then(function(response) {
    //     console.log('3. response.result.is_correct -', response.result.is_correct);
    // })
    document.querySelector(".step2-container__item-result__gray").textContent = `/${5}`;

    document.querySelectorAll(".step2__input-checkbox").forEach(function (item, index) {
      item.addEventListener("change", function (e) {
        let $this = this;
        let question = $this.closest(".question-container");
        let answer = $this.closest(".intensive-test__input-container");
        let answer_id = answer.getAttribute("data-id");
        let question_id = $this.closest(".question-container").getAttribute("data-id");
        let comment = document.createElement("div");
        question.querySelectorAll(".question-container__comment").forEach(function (item, index) {
          item.remove();
        });
        question.querySelectorAll(".question-container__comment_error").forEach(function (item, index) {
          item.remove();
        });
        // for (let i = 0; i < step.length; i++) {
        //   if (questions_step2[question_id].answers[i].is_correct) {
        //     question.querySelectorAll(".intensive-test__input-container")[i].classList.add("question-container-js");
        //   }
        // }
        if (answer.textContent == test[question_id].correct_answer) {
          correctAnswersCounter++;
          document.querySelector(".step2-container__item-result_num").textContent = correctAnswersCounter;
          document.querySelector(".step2-container__progress-caption").textContent = `${Math.round((correctAnswersCounter * 100) / 5)}%`;
          document.querySelector(".step2-container__progress-bar_green").style.width = `${Math.round((correctAnswersCounter * 100) / 5)}%`;
          answer.querySelector(".intensive-test__input-check").innerHTML =
            '<img class="intensive-test__input-img intensive-test__input-check-error" src="./images/intensive-test-input-checked.svg" alt="">';
          // comment.classList.add("question-container__comment_true");
          // comment.innerText = 'Верно!';
          comment.classList.add("step2-question-container__comment");
          comment.innerHTML = `<div class="step2-question-container__comment-title">Верно!</div><div class="question-container__comment-text">Вопрос уровня ${test[question_id].difficulty}</div>`;
          question.querySelectorAll(".intensive-test__input-container").forEach(function (item, index) {
            item.classList.add("intensive-test__input-container_disable");
          });
          answer.classList.add("intensive-test__input-container-correct");
          document.querySelectorAll(".intensive-test__input-container").forEach(function (item, index) {
            item.classList.remove("intensive-test__input-container-false");
          });
          // if (correctAnswersCounter == 5) {
          //     document.querySelector('.step2-container__item-result__gray').style.color = '#061b36'
          //     document.querySelector('.step2__button_green').onclick = function() {
          //         document.querySelector(".step2-start").style.display = "none";
          //         document.querySelector(".step2-end").style.display = "block";
          //     }
          // }
          if (test_step == test.length - 1 && correctAnswersCounter != test.length) {
            document.querySelector(".step2__button_green").disabled = true;
          } else {
            document.querySelector(".step2__button_green").disabled = false;
          }
        } else {
          falseAnswersCounter++;
          answer.querySelector(".intensive-test__input-check").innerHTML =
            '<img class="intensive-test__input-img intensive-test__input-check-error" src="./images/intensive-test-input-error.svg" alt="">';
          // question.querySelectorAll(".intensive-test__input-container").forEach(function (item, index) {
          //     item.classList.add("intensive-test__input-container_disable");
          // });
          // comment.classList.add("question-container__comment");
          comment.classList.add("question-container__comment_error");
          comment.classList.add("step2-container__comment_error");
          // comment.innerHTML = '<div>'+step2[question_id].comment+'</div>';
          comment.innerText = `Попробуй еще раз!`;
          document.querySelectorAll(".intensive-test__input-container").forEach(function (item, index) {
            item.classList.remove("intensive-test__input-container-false");
          });
          answer.classList.add("intensive-test__input-container-false");
        }
        answer.after(comment);
      });
    });
    document.querySelector(".step2__button_green").onclick = function () {
      document.querySelector(".step2__button_test-back").classList.remove("d-none");
      document.querySelectorAll(".question-container").forEach(function (item, index) {
        item.classList.remove("d-block");
        item.classList.add("d-none");
      });
      test_step++;
      if (test_step == test.length - 1 && correctAnswersCounter != test.length) {
        document.querySelector(".step2__button_green").disabled = true;
        document.querySelector(".step2__button_green").textContent = "Завершить тест";
      } else {
        document.querySelector(".step2__button_green").disabled = false;
      }
      if (test_step == test.length) {
        document.querySelector(".buttons-wrap").style.display = "none";
        document.querySelector(".step2-start").style.display = "none";
        document.querySelector(".step2-end").style.display = "block";
      } else {
        document.querySelector(".question-container[data-id='" + test_step + "']").classList.remove("d-none");
        document.querySelector(".question-container[data-id='" + test_step + "']").classList.add("d-block");
        document.querySelector(".step2__button_test-back").disabled = false;
      }
    };
    document.querySelector(".step2__button_test-back").onclick = function () {
      document.querySelector(".step2__button_green").disabled = false;
      document.querySelectorAll(".question-container").forEach(function (item, index) {
        item.classList.remove("d-block");
        item.classList.add("d-none");
      });
      test_step--;
      document.querySelector(".question-container[data-id='" + test_step + "']").classList.remove("d-none");
      document.querySelector(".question-container[data-id='" + test_step + "']").classList.add("d-block");
      if (test_step == 0) {
        document.querySelector(".step2__button_test-back").disabled = true;
      } else {
        document.querySelector(".step2__button_test-back").disabled = false;
      }
      document.querySelector(".step2__button_green").textContent = "Следующий вопрос";
    };
  }
}
