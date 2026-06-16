(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("currentYear");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  });
})();
