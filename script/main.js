const board = document.querySelector(".board");
const rows = document.querySelectorAll(".row");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let secretWord;
let curRow = 0;
let curCell = 0;
let curWord = "";

fetch("words.json")
  .then((res) => res.json())
  .then((words) => {
    secretWord = words[Math.floor(Math.random() * words.length)];
    console.log("Secret word:", secretWord);
  });

document.getElementById("restartBtn").addEventListener("click", (e) => {
  restartGame();
  e.target.blur(); // зняти фокус з кнопки
});

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("winModal").style.display = "none";
});

const rowsArr = [
  ["Й", "Ц", "У", "К", "Е", "Н", "Г", "Ш", "Щ", "З", "Х", "Ї", "Backspace"],
  ["Ф", "І", "В", "А", "П", "Р", "О", "Л", "Д", "Ж", "Є", "Enter"],
  ["Я", "Ч", "С", "М", "И", "Т", "Ь", "Б", "Ю"],
];
const keyboard = document.querySelector(".keyboard");

for (let row of rowsArr) {
  const div = document.createElement("div");
  div.classList.add("key-row");
  keyboard.appendChild(div);
  for (let key of row) {
    const button = document.createElement("button");
    button.textContent = key;
    button.classList.add("key");
    if (key === "Backspace" || key === "Enter") {
      button.classList.add("large-key");

      button.addEventListener(
        "click",
        key === "Backspace" ? DeleteLetter : Chek
      );
    } else {
      button.addEventListener("click", (e) => {
        EnterLetter(key);
        e.target.blur();
      });
    }
    div.appendChild(button);
  }
}

function Chek() {
  if (curCell !== 5) {
    console.log("Word must be 5 letters long");
    return;
  }
  console.log("Submitted word:", curWord);

  const guess = curWord.toUpperCase();
  const secret = secretWord.toUpperCase();
  const rowCells = rows[curRow].querySelectorAll(".cell");
  const keyboardKeys = Array.from(document.querySelectorAll(".key"));

  const result = Array(5).fill("absent");
  const freq = {};

  for (let index = 0; index < 5; index++) {
    const cell = rowCells[index];
    cell.classList.remove("pop-in");
    setTimeout(() => {
      console.log(index, cell, "flip");
      rowCells[index].classList.add("flip");
    }, index * 300);
  }

  // рахуємо частоти літер у секреті
  for (let ch of secret) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  // перший прохід: зелені
  for (let i = 0; i < 5; i++) {
    const guessChar = guess[i];
    const secretChar = secret[i];
    if (guessChar === secretChar) {
      result[i] = "correct";
      freq[guessChar]--;
    }
  }

  // другий прохід: жовті
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const guessChar = guess[i];
    if (freq[guessChar] > 0) {
      result[i] = "present";
      freq[guessChar]--;
    } else {
      result[i] = "absent";
    }
  }

  // фарбуємо клітинки поточного рядка
  for (let i = 0; i < 5; i++) {
    rowCells[i].classList.add(result[i]);
    const key = keyboardKeys.find((k) => k.textContent === guess[i]);
    key.classList.add(result[i]);
  }

  // Порівняння перемоги
  if (guess === secret) {
    const modal = document.getElementById("winModal");
    modal.style.display = "flex";
  }

  // перехід до наступного рядка
  curRow++;
  curCell = 0;
  curWord = "";

  if (curRow >= rows.length) {
    console.log("No more rows available.");
  }
}

function EnterLetter(letter) {
  if (curCell >= 5) return;
  letter = letter.toUpperCase();
  const rowCells = rows[curRow].querySelectorAll(".cell");
  rowCells[curCell].classList.add("pop-in");
  console.log(curCell);
  rowCells[curCell].textContent = letter;
  curWord += letter;
  curCell++;
}

function DeleteLetter() {
  curCell--;
  const rowCells = rows[curRow].querySelectorAll(".cell");
  rowCells[curCell].textContent = "";
  curWord = curWord.slice(0, -1);
  console.log("Після Backspace:", curWord);
  rowCells[curCell].classList.remove("pop-in");
}

// Функція перезапуску (поза keydown!)
function restartGame() {
  rows.forEach((row) => {
    const rowCells = row.querySelectorAll(".cell");
    rowCells.forEach((cell) => {
      cell.textContent = "";
      // cell.classList.remove("correct", "present", "absent");
      cell.className = "cell";
    });
  });

  const keyboardKeys = Array.from(document.querySelectorAll(".key"));
  keyboardKeys.forEach((key) => {
    key.classList.remove("correct", "present", "absent");
  });
  curRow = 0;
  curCell = 0;
  curWord = "";

  // нове випадкове слово
  fetch("words.json")
    .then((res) => res.json())
    .then((words) => {
      secretWord = words[Math.floor(Math.random() * words.length)];
      console.log("New secret word:", secretWord);
    });

  console.log("Гра перезапущена!");
}

document.addEventListener("keydown", (event) => {
  const key = event.key;

  // Введення літери
  if (key.length === 1 && curCell < 5 && /^[а-яА-ЯіІєЄґҐїЇ]$/u.test(key)) {
    EnterLetter(key);
  }

  // Видалення Backspace
  else if (key === "Backspace" && curCell > 0) {
    DeleteLetter();
  }

  // Підтвердження Enter
  else if (key === "Enter") {
    Chek();
  }
});
