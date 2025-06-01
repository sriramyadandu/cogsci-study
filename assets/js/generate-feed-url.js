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

        resultContainer.innerHTML = "🔍 Checking...";

        // 1. GET stance from pre-survey sheet
        const stanceSheetId = "19BMNvRsF__4cE_i5VTAng3Sy5Wgg2wZIPpFwEI5S8FM"; // Pre-survey
        const stanceSheetName = "pre_survey";
        const formSheetId = "1x65dR3l2lImyosKWzNFom67JFWkdxLHydTGG-F4xfUY";
        const formSheetName = "url_params";
        const apiKey = "AIzaSyC8sdf9do-htTyWScQ9tEisowyP-f-Q7B4";

        try {
            // Fetch stance sheet
            const stanceUrl = `https://sheets.googleapis.com/v4/spreadsheets/${stanceSheetId}/values/${encodeURIComponent(stanceSheetName)}?key=${apiKey}`;
            const stanceRes = await fetch(stanceUrl);
            const stanceJson = await stanceRes.json();
            const stanceRows = stanceJson.values;

            const idIndex = 1;
            const climateIndex = 6;
            const gunsIndex = 7;
            const immigrationIndex = 8;

            let match = null;
            for (let i = stanceRows.length - 1; i > 0; i--) {
                if (stanceRows[i][idIndex] === participantId) {
                    match = stanceRows[i];
                    break;
                }
            }

            if (!match) {
                resultContainer.innerHTML = "<div class='text-danger'> ❌ Pre-Survey unfinished. Please take the survey first.</div>";
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

            // 2. Check if this participant ID already submitted form
            let finalGroup = stance.group;

            const formUrl = `https://sheets.googleapis.com/v4/spreadsheets/${formSheetId}/values/${encodeURIComponent(formSheetName)}?key=${apiKey}`;
            const formRes = await fetch(formUrl);
            const formJson = await formRes.json();
            const formRows = formJson.values;
            const formIdIndex = 1; // Assume column B in form sheet is participant ID

            const existingRow = formRows.find((row, i) => i > 0 && row[formIdIndex] === participantId);
            if (existingRow) {
                const groupColIndex = 2;
                finalGroup = existingRow[groupColIndex];
            }

            const ENTRY_IDS = {
                participantId: "entry.871120931",
                group: "entry.24563833",
                climate: "entry.1215374200",
                guns: "entry.1042400706",
                immigration: "entry.1149778435"
            };

            // Submit the tracking pixel
            const formBase = "https://docs.google.com/forms/d/e/1FAIpQLSesG1EXt9FYeEqHP4KGv96RmF4d6fbv5U04Ri1y_jeZFhM8hw/formResponse";
            const query = new URLSearchParams({
                [ENTRY_IDS.participantId]: participantId,
                [ENTRY_IDS.group]: finalGroup,
                [ENTRY_IDS.climate]: stance.climate,
                [ENTRY_IDS.guns]: stance.guns,
                [ENTRY_IDS.immigration]: stance.immigration
            });
            const trackingPixel = new Image();
            trackingPixel.src = `${formBase}?${query.toString()}`;

            // 4. Redirect
            const baseUrl = document.body.dataset.baseurl || "";
            const newsfeedUrl = `${window.location.origin}${baseUrl}/news-feed.html?id=${encodeURIComponent(participantId)}&climate=${stance.climate}&guns=${stance.guns}&immigration=${stance.immigration}&group=${stance.group}`;

            resultContainer.innerHTML = `✅ Pre-Survey completed. Redirecting to your personalized news feed...`;
            setTimeout(() => {
                window.location.href = newsfeedUrl;
            }, 1500);
        } catch (err) {
            console.error(err);
            resultContainer.innerHTML = `<div class='text-danger'>An error occurred retrieving your data.</div>`;
        }
    });
});
