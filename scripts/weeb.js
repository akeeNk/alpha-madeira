document.addEventListener("DOMContentLoaded", function () {
  const startDate = new Date("2024-07-11");
  const endDate = new Date("2024-09-04");
  const targetDate = luxon.DateTime.fromISO("2024-09-04T12:00:00", {
    zone: "Asia/Tokyo",
  }); // 4th September, Mid-day in Japan timezone

  const calendarContainer = document.getElementById("calendar");
  const animationContainer = document.getElementById("animation-container");
  const fortuneContainer = document.getElementById("fortune-container");

  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const totalDays = Math.round((endDate - startDate) / oneDay) + 1; // total days inclusive

  // Initialize FlipClock
  const clock = $("#flipclock").FlipClock({
    clockFace: "DailyCounter", // Use DailyCounter clock face
    countdown: true, // Countdown mode
    showSeconds: true, // Show seconds
  });

  // Update clock face options
  clock.setOptions({
    clockFace: "DailyCounter",
    countdown: true,
    showSeconds: true,
  });

  setInterval(function () {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Calculate days, hours, minutes, seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update FlipClock
    clock.setTime(
      days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
    );
    clock.start();
  }, 1000);

  // Create Calendar
  for (let i = 0; i < totalDays; i++) {
    const date = luxon.DateTime.fromJSDate(startDate)
      .plus({ days: i })
      .setZone("Asia/Tokyo");
    const button = document.createElement("button");
    button.textContent = date.toFormat("LL'/'dd");
    button.classList.add("locked");

    const unlockTime = date.set({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0,
    }); // Mid-day in Japan timezone

    button.addEventListener("click", function () {
      const now = luxon.DateTime.now().setZone("Asia/Tokyo");
      if (now >= unlockTime && !button.classList.contains("clicked")) {
        handleDateClick(date, button, animationContainer, fortuneContainer);
      }
    });

    // Check if button should be unlocked
    if (new Date() >= unlockTime) {
      button.classList.remove("locked");
      button.classList.add("unlocked");
    }

    // Check if the button was clicked previously
    if (localStorage.getItem(date.toISODate())) {
      button.classList.add("clicked");
      const savedData = JSON.parse(localStorage.getItem(date.toISODate()));
      if (savedData) {
        displayAnimation(savedData.animationData, animationContainer);
        displayFortune(savedData.fortune, fortuneContainer);
      }
    }

    calendarContainer.appendChild(button);
  }

  // List of JSON files in the assets folder
  const jsonFiles = [
    "../assets/animations/animation1.json",
    "../assets/animations/animation2.json",
    "../assets/animations/animation3.json",
    "../assets/animations/animation4.json",
    "../assets/animations/animation5.json",
    "../assets/animations/animation6.json",
    "../assets/animations/animation7.json",
    "../assets/animations/animation8.json",
    "../assets/animations/animation9.json",
    "../assets/animations/animation10.json",
    "../assets/animations/animation11.json",
    "../assets/animations/animation12.json",
    "../assets/animations/animation13.json",
    // Add more JSON files as needed
  ];

  // Fetch and display animation and fortune
  function handleDateClick(date, button, animationContainer, fortuneContainer) {
    const randomIndex = Math.floor(Math.random() * jsonFiles.length);
    const randomJsonFile = jsonFiles[randomIndex];

    fetch(randomJsonFile) // Fetch a random JSON file
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((animationData) => {
        console.log("Date clicked:", date.toISODate());
        console.log("JSON data:", animationData);

        // Render the animation using Lottie
        displayAnimation(animationData, animationContainer);

        // Generate and display fortune
        const fortune = generateFortune();
        displayFortune(fortune, fortuneContainer);

        // Mark button as clicked
        button.classList.remove("unlocked");
        button.classList.add("clicked");

        // Store the click in local storage
        const savedData = {
          animationData: animationData,
          fortune: fortune,
        };
        localStorage.setItem(date.toISODate(), JSON.stringify(savedData));
      })
      .catch((error) => {
        console.error("Error loading JSON:", error);
      });
  }

  // Display animation
  function displayAnimation(animationData, container) {
    container.innerHTML = "";
    const anim = lottie.loadAnimation({
      container: container,
      renderer: "svg", // Choose the renderer: svg / canvas / html
      loop: true,
      autoplay: true,
      animationData: animationData, // JSON data from fetch response
    });
  }

  // Display fortune
  function displayFortune(fortune, container) {
    container.innerHTML = `<span>Fortune for today: ${fortune}<br>Congratulations on surviving, you're another day closer to Japan</span>`;
  }

  // Generate a random Japanese fortune telling
  function generateFortune() {
    const fortunes = [
      "大吉: Great blessing",
      "中吉: Middle blessing",
      "小吉: Small blessing",
      "吉: Blessing",
      "半吉: Half-blessing",
      "末吉: Future blessing",
      "末小吉: Future small blessing",
      "凶: Curse",
      "小凶: Small curse",
      "半凶: Half-curse",
      "末凶: Future curse",
      "大凶: Great curse",
    ];
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    return fortunes[randomIndex];
  }
});
