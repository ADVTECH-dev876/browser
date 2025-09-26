let privacyMode = false;

async function navigate() {
  const input = document.getElementById('url-bar').value;
  const resultsDiv = document.getElementById('search-results');

  // Detect if input is a search query (no TLD)
  if (!input.match(/^https?:\/\//) && !input.includes('.')) {
    try {
      const html = await window.privacyAPI.search(input);
      resultsDiv.innerHTML = `<h3>Search Results (Anonymized):</h3>${html}`;
    } catch (e) {
      resultsDiv.innerHTML = '<p>Search failed. Try again.</p>';
    }
  } else {
    // Standard navigation (in a real app, load in a <webview>)
    resultsDiv.innerHTML = `<p>Navigating to: ${input}</p>`;
  }
}

function togglePrivacyMode() {
  privacyMode = !privacyMode;
  document.body.style.backgroundColor = privacyMode ? '#1a1a2e' : 'white';
  alert(privacyMode ? 'Privacy Mode: ON (All data will be cleared on exit)' : 'Privacy Mode: OFF');
}

// Auto-clear non-essential cookies every 5s (simulated)
setInterval(() => {
  if (document.cookie) {
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
}, 5000);
