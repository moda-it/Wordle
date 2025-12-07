const board = document.querySelector(".board");
const rows = document.querySelectorAll(".row");

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

// Функція перезапуску (поза keydown!)
function restartGame() {
  rows.forEach((row) => {
    const rowCells = row.querySelectorAll(".cell");
    rowCells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("correct", "present", "absent");
    });
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
    const letter = key.toUpperCase();
    const rowCells = rows[curRow].querySelectorAll(".cell");
    rowCells[curCell].textContent = letter;
    curWord += letter;
    curCell++;
  }

  // Видалення Backspace
  else if (key === "Backspace" && curCell > 0) {
    curCell--;
    const rowCells = rows[curRow].querySelectorAll(".cell");
    rowCells[curCell].textContent = "";
    curWord = curWord.slice(0, -1);
    console.log("Після Backspace:", curWord);
  }

  // Підтвердження Enter
  else if (key === "Enter") {
    if (curCell === 5) {
      console.log("Submitted word:", curWord);

      const guess = curWord.toUpperCase();
      const secret = secretWord.toUpperCase();
      const rowCells = rows[curRow].querySelectorAll(".cell");

      const result = Array(5).fill("absent");
      const freq = {};

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
        if (result[i] === "correct") {
          rowCells[i].classList.add("correct");
        } else if (result[i] === "present") {
          rowCells[i].classList.add("present");
        } else {
          rowCells[i].classList.add("absent");
        }
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
    } else {
      console.log("Word must be 5 letters long");
    }
  }
});
