const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const messageBox = document.getElementById("message");
const resultBox = document.getElementById("result");
const originalUrlEl = document.getElementById("original-url");
const shortUrlEl = document.getElementById("short-url");
const copyBtn = document.getElementById("copy-btn");
const refreshBtn = document.getElementById("refresh-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
const tableBody = document.getElementById("urls-table-body");

let latestShortUrl = "";

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.classList.remove("hidden");
}

function hideMessage() {
  messageBox.className = "message hidden";
}

function showResult(data) {
  originalUrlEl.textContent = data.originalUrl;
  shortUrlEl.textContent = data.shortUrl;
  shortUrlEl.href = data.shortUrl;
  latestShortUrl = data.shortUrl;
  resultBox.classList.remove("hidden");
}

function hideResult() {
  resultBox.classList.add("hidden");
}

async function fetchUrls() {
  try {
    const response = await fetch("/api/urls");
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch URLs");
    }

    renderTable(result.data);
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty">Failed to load URLs.</td>
      </tr>
    `;
  }
}

function renderTable(urls) {
  if (!urls.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty">No URLs created yet.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = urls
    .map(
      (item) => `
        <tr>
          <td>${item.shortCode}</td>
          <td><a href="${item.shortUrl}" target="_blank">${item.shortUrl}</a></td>
          <td><a href="${item.originalUrl}" target="_blank">${item.originalUrl}</a></td>
          <td>${item.clicks}</td>
          <td>${new Date(item.createdAt).toLocaleString()}</td>
          <td>
            <button class="delete-btn" type="button" onclick="deleteUrl('${item.shortCode}')">
              Delete
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

async function deleteUrl(code) {
  const confirmed = window.confirm(`Delete short URL with code "${code}"?`);
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/urls/${code}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete URL");
    }

    showMessage(`Short URL "${code}" deleted successfully.`, "success");
    fetchUrls();
  } catch (error) {
    showMessage(error.message || "Failed to delete URL.", "error");
  }
}

async function clearAllUrls() {
  const confirmed = window.confirm("Are you sure you want to clear all URLs?");
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch("/api/urls", {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to clear URLs");
    }

    showMessage(`Cleared ${result.clearedCount} URL(s) successfully.`, "success");
    hideResult();
    fetchUrls();
  } catch (error) {
    showMessage(error.message || "Failed to clear URLs.", "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  hideMessage();
  hideResult();

  const url = urlInput.value.trim();

  if (!url) {
    showMessage("Please enter a URL.", "error");
    return;
  }

  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to shorten URL");
    }

    showMessage("URL shortened successfully.", "success");
    showResult(result.data);
    urlInput.value = "";
    fetchUrls();
  } catch (error) {
    showMessage(error.message || "Something went wrong.", "error");
  }
});

copyBtn.addEventListener("click", async () => {
  if (!latestShortUrl) {
    return;
  }

  try {
    await navigator.clipboard.writeText(latestShortUrl);
    showMessage("Short URL copied to clipboard.", "success");
  } catch {
    showMessage("Failed to copy the short URL.", "error");
  }
});

refreshBtn.addEventListener("click", () => {
  fetchUrls();
});

clearAllBtn.addEventListener("click", () => {
  clearAllUrls();
});

fetchUrls();
window.deleteUrl = deleteUrl;
