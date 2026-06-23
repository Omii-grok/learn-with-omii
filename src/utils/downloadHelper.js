import { mockStorage } from "./mockStorage";

/**
 * Downloads a file by handling mock URLs, IndexedDB files, and standard URLs.
 * Resolves CORS limitations by fetching standard files and converting them to Base64 Data URLs.
 * 
 * @param {Object} file The file object containing download details.
 */
export const downloadFile = async (file) => {
  if (!file) return;

  try {
    if (file.url && file.url.startsWith("mock://")) {
      // Download mock presentation slides or mock DOCX document as a text outline file
      let content = "";
      if (file.slides) {
        content = file.slides.map((s, idx) => `Slide ${idx + 1}: ${s.title}\n-------------------------\n${s.content}\n\n`).join("");
      } else if (file.documentContent) {
        content = file.documentContent.replace(/<[^>]*>/g, ""); // strip html
      } else {
        content = `Mock content outline for ${file.name}`;
      }
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const reader = new FileReader();
      reader.onload = (event) => {
        const link = document.createElement("a");
        link.href = event.target.result;
        link.download = file.name.replace(/\.[^/.]+$/, "") + "_outline.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      reader.readAsDataURL(blob);
    } else if (file.isBlobInIndexedDB) {
      // Fetch blob from IndexedDB
      const blob = await mockStorage.getFileBlob(file.id);
      if (blob) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const link = document.createElement("a");
          link.href = event.target.result;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        reader.readAsDataURL(blob);
      } else {
        // Fallback to URL
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      // Standard online URLs
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (event) => {
          const link = document.createElement("a");
          link.href = event.target.result;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        reader.readAsDataURL(blob);
      } catch (fetchErr) {
        console.warn("CORS blocked direct download fetch, trying standard fallback link:", fetchErr);
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download file: " + err.message);
  }
};
