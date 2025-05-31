document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("fetch-id-btn");
  const resultContainer = document.createElement("div");
  button.parentNode.insertBefore(resultContainer, button.nextSibling);

  button.addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const participantId = params.get("id");

    if (!participantId) {
      resultContainer.innerHTML = "<div class='text-danger'>Missing participant ID in the URL.</div>";
      return;
    }

    const sheetId = "19BMNvRsF__4cE_i5VTAng3Sy5Wgg2wZIPpFwEI5S8FM";
    const sheetName = "pre_survey";
    const apiKey = "AIzaSyC8sdf9do-htTyWScQ9tEisowyP-f-Q7B4";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

    resultContainer.innerHTML = "🔍 Searching...";

    try {
      const response = await fetch(url);
      const json = await response.json();
      const rows = json.values;

      const idIndex = 1;
      const climateIndex = 6;
      const gunsIndex = 7;
      const immigrationIndex = 8;

      const match = rows.find((row, i) => i > 0 && row[idIndex] === participantId);

      if (!match) {
        resultContainer.innerHTML = "<div class='text-danger'> ❌ Pre-Survey unfinished. <br><br> Please take the survey and retry. Ensure participant id is correct.</div>";
        return;
      }

      const mapToStance = (text) => {
        if (!text) return "neutral";
        const t = text.toLowerCase();
        if (t.includes("strongly disagree") || t.includes("disagree")) return "oppose";
        if (t.includes("strongly agree") || t.includes("agree")) return "support";
        return "neutral";
      };

      const stance = {
        climate: mapToStance(match[climateIndex]),
        guns: mapToStance(match[gunsIndex]),
        immigration: mapToStance(match[immigrationIndex]),
        group: Math.random() < 0.5 ? "A" : "B"
      };

      const baseUrl = document.body.dataset.baseurl || "";
      const newsfeedUrl = `${window.location.origin}${baseUrl}/index.html?id=${encodeURIComponent(participantId)}&climate=${stance.climate}&guns=${stance.guns}&immigration=${stance.immigration}&group=${stance.group}`;

      resultContainer.innerHTML = `✅ Pre-Survey completed. Redirecting to your personalized news feed...`;

      setTimeout(() => {
        window.location.href = newsfeedUrl;
      }, 1500);
    } catch (err) {
      console.error(err);
      resultContainer.innerHTML = "<div class='text-danger'>An error occurred retrieving your data.</div>";
    }
  });
});
