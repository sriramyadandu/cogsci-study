document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("lookup-btn");
    const result = document.getElementById("result");

    button.addEventListener("click", async () => {
        const participantId = document.getElementById("pid-input").value.trim();
        if (!participantId) {
            result.innerHTML = "<div class='text-danger'>Please enter a Participant ID.</div>";
            return;
        }

        const sheetId = "19BMNvRsF__4cE_i5VTAng3Sy5Wgg2wZIPpFwEI5S8FM";
        const sheetName = "pre_survey";
        const apiKey = "AIzaSyC8sdf9do-htTyWScQ9tEisowyP-f-Q7B4";

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

        result.innerHTML = "🔍 Searching...";

        try {
            const response = await fetch(url);
            const json = await response.json();
            const rows = json.values;

            const header = rows[0];
            const idIndex = 1; // Column B = Participant ID
            const climateIndex = 6;
            const gunsIndex = 7;
            const immigrationIndex = 8;

            const match = rows.find((row, i) => i > 0 && row[idIndex] === participantId);

            if (!match) {
                result.innerHTML = "<div class='text-danger'>Participant ID not found.</div>";
                return;
            }

            const mapToStance = (text) => {
                if (!text) return "neutral";
                const t = text.toLowerCase();
                if (t.includes("agree")) return "support";
                if (t.includes("disagree")) return "oppose";
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

            result.innerHTML = `✅ Participant found. Redirecting to your personalized news feed...`;

            setTimeout(() => {
                window.location.href = newsfeedUrl;
            }, 1500);
        } catch (err) {
            console.error(err);
            result.innerHTML = "<div class='text-danger'>An error occurred retrieving your data.{</div>";
        }
    });
});
