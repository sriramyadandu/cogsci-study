document.addEventListener("DOMContentLoaded", () => {
  const checkButton = document.getElementById("check-survey-button");
  const messageBox = document.getElementById("survey-message");

  if (!checkButton || !messageBox) return;

  checkButton.addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const participantId = params.get("id");

    if (!participantId) {
      showMessage("Participant ID is missing from the URL.", "danger");
      return;
    }

    const sheetId = "1eoF3tZZsBG-DQWKJj9pvj6EN9w6Q_GQECX-x8bVbeRc";
    const sheetName = "study";
    const apiKey = "AIzaSyC8sdf9do-htTyWScQ9tEisowyP-f-Q7B4";

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const rows = data.values || [];

      const idColumnIndex = 1;
      const found = rows.some((row, i) => i > 0 && row[idColumnIndex] === participantId);

      if (found) {
        const baseUrl = document.body.dataset.baseurl;
        window.location.href = `${window.location.origin}${baseUrl}/post-survey.html?id=${encodeURIComponent(participantId)}`;
      } else {
        showMessage("Please complete the survey below before proceeding.", "danger");
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("⚠️ An error occurred while checking your survey status. Please try again later.", "danger");
    }
  });

  function showMessage(message, type = "info") {
    messageBox.textContent = message;
    messageBox.className = `alert alert-${type}`;
    messageBox.style.display = "block";
  }
});
