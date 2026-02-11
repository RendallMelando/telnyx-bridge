const axios = require("axios");

async function translateText(textVal, sourceLangVal, targetLangVal) {
  const ltUrlVal = process.env.LIBRETRANSLATE_URL || "http://localhost:5000/translate";

  const payloadObj = {
    q: textVal,
    source: sourceLangVal || "auto",
    target: targetLangVal || "en",
    format: "text"
  };

  const respObj = await axios.post(ltUrlVal, payloadObj, {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    timeout: 20000
  });

  const outVal = respObj && respObj.data ? respObj.data.translatedText : null;
  if (!outVal) {
    throw new Error("No translatedText returned. Response: " + JSON.stringify(respObj.data));
  }

  return outVal;
}

module.exports = { translateText };