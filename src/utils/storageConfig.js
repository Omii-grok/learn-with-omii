/**
 * Utility to manage custom cloud storage configurations (GitHub or custom Firebase)
 * saved in the browser's localStorage. This allows users to configure cloud databases
 * directly from the UI without editing build environment variables.
 */

const CONFIG_KEY = "omii_storage_config";

export const getStorageConfig = () => {
  try {
    const config = localStorage.getItem(CONFIG_KEY);
    if (config) {
      return JSON.parse(config);
    }
  } catch (e) {
    console.error("Failed to parse storage config:", e);
  }
  return { type: "local" }; // Default to local IndexedDB + localStorage mode
};

export const saveStorageConfig = (config) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Failed to save storage config:", e);
    return false;
  }
};

/**
 * Uploads a file directly to a user's GitHub repository.
 * 
 * @param {File} file The file object from the input.
 * @param {Object} githubConfig The config containing token, owner, repo, branch.
 * @returns {Promise<string>} The raw CDN URL of the uploaded file on GitHub.
 */
export const uploadToGitHub = async (file, githubConfig) => {
  const { token, owner, repo, branch = "main" } = githubConfig;
  
  if (!token || !owner || !repo) {
    throw new Error("GitHub configuration is incomplete. Token, owner, and repository name are required.");
  }

  // Read file as base64
  const base64Content = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // FileReader.readAsDataURL returns "data:*/*;base64,....." -> Extract base64 part
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filePath = `uploads/${Date.now()}_${sanitizedFileName}`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/vnd.github.v3+json"
    },
    body: JSON.stringify({
      message: `Upload ${file.name} via Learn With Omii IT Library`,
      content: base64Content,
      branch: branch
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `GitHub API returned status ${response.status}`);
  }

  const responseData = await response.json();
  
  // Use the raw GitHub URL or download URL.
  // raw.githubusercontent.com URL is highly CORS friendly and can be loaded directly in browsers
  const cdnUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  return cdnUrl;
};
