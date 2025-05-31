document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("fetch-id-btn");
  const container = document.getElementById("all-sheets");

  button.addEventListener("click", async () => {
    const sheetId = "1hffA8tVgwZOPg1o5KNEY9htw4drQ4TriMAT3RLfs3oQ";
    const apiKey = "AIzaSyC8sdf9do-htTyWScQ9tEisowyP-f-Q7B4";
    const sheetName = "Consent";
    const yesNoColumnIndex = 1;

    container.textContent = "Checking...";

    const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      sheetName
    )}?key=${apiKey}`;

    try {
      const response = await fetch(dataUrl);
      const data = await response.json();

      if (!data.values || data.values.length < 2) {
        container.textContent = "No form responses found.";
        return;
      }

      const lastRow = data.values[data.values.length - 1];
      const rowNumber = data.values.length;
      const columnValue = (lastRow[yesNoColumnIndex] || "").toLowerCase();

      const result = columnValue === "no" ? 0 : rowNumber;

      if (result === 0) {
        container.innerHTML = "❌ Your consent response was 'No'. You are not eligible to proceed. Thank you.";
      } else {
        container.innerHTML = `
          ✅ Your Participant ID: <strong>${result}</strong><br><br>
          Please remember this number for the remainder of the study.<br><br>
          <a href="pre-survey.html?id=${encodeURIComponent(result)}" class="btn btn-success">Continue to Study</a>
        `;
      }
    } catch (err) {
      console.error("Error:", err);
      container.textContent = "Failed to process data.";
    }
  });
});
