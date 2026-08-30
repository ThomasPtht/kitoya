import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

const KIT_CONDITIONS_MAP: Record<string, string> = {
  NEW_WITH_TAGS: "New with Tags",
  EXCELLENT: "Excellent",
  VERY_GOOD: "Very Good",
  GOOD: "Good",
  FAIR: "Fair",
};

const KIT_VERSIONS_MAP: Record<string, string> = {
  REPLICA: "Replica",
  AUTHENTIC: "Authentic",
  PLAYER_ISSUE: "Player Issue",
  MATCH_WORN: "Match Worn",
};

const JERSEY_TYPES_MAP: Record<string, string> = {
  HOME: "Home",
  AWAY: "Away",
  THIRD: "Third",
  FOURTH: "Fourth",
  SPECIAL: "Special",
  GOALKEEPER: "Goalkeeper",
  TRAINING: "Training",
};

export const exportCollectionToPdf = async (jerseyData: any[]) => {
  try {
    const generatedDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Helvetica', sans-serif; 
              color: #121212; 
              padding: 30px; 
              background-color: #f4f4f5; 
            }
            .header-container { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-end; 
              border-bottom: 2px solid #05C785; 
              padding-bottom: 15px; 
              margin-bottom: 30px; 
            }
            h1 { color: #121212; font-size: 28px; margin: 0; }
            .accent { color: #05C785; }
            .subtitle { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
            
            .grid { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 20px; 
            }
            .card { 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              width: 48%; 
              border: 1px solid #e0e0e0; 
              margin-bottom: 20px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.02);
              page-break-inside: avoid;
            }
            .card-header {
              background: #121212;
              color: white;
              padding: 10px 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .club-name { font-size: 16px; font-weight: bold; color: #fff; }
            .season-badge { background: #05C785; color: #121212; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; }
            
            .card-body {
              display: flex;
              padding: 15px;
              gap: 15px;
              align-items: center;
            }
            .jersey-img {
              width: 90px;
              height: 110px;
              object-fit: contain;
              background: #f9f9f9;
              border-radius: 8px;
              border: 1px solid #eee;
            }
            .jersey-info {
              flex: 1;
            }
            .info-row {
              font-size: 13px;
              margin-bottom: 6px;
              color: #444;
            }
            .info-label {
              font-weight: bold;
              color: #888;
              font-size: 11px;
              text-transform: uppercase;
              display: block;
              margin-bottom: 2px;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 11px; 
              color: #888; 
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1>Kitoya <span class="accent">Portfolio</span></h1>
              <div class="subtitle">Collection Archive Generated on ${generatedDate}</div>
            </div>
            <div style="text-align: right; font-weight: bold; font-size: 14px; color: #05C785;">
              Total: ${jerseyData.length} ${jerseyData.length > 1 ? "kits" : "kit"}
            </div>
          </div>
          
          <div class="grid">
            ${jerseyData
              .map(
                (jersey) => `
              <div class="card">
                <div class="card-header">
                  <span class="club-name">${jersey.club?.name || "N/A"}</span>
                  <span class="season-badge">${jersey.season || "N/A"}</span>
                </div>
                <div class="card-body">
                  ${
                    jersey.frontImageUrl
                      ? `<img src="${jersey.frontImageUrl}" class="jersey-img" />`
                      : `<div class="jersey-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:10px;">No Image</div>`
                  }
                  <div class="jersey-info">
                    <div class="info-row">
                      <span class="info-label">Player</span>
                      <strong>${jersey.playerName || "Unnamed"} ${jersey.number ? `(#${jersey.number})` : ""}</strong>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Type & Size</span>
                      ${JERSEY_TYPES_MAP[jersey.type] || jersey.type || "-"} • <span style="font-weight:bold;">${jersey.size || "-"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Condition & Version</span>
                      ${KIT_CONDITIONS_MAP[jersey.condition] || jersey.condition || "-"} (${KIT_VERSIONS_MAP[jersey.version] || jersey.version || "Standard"})
                    </div>
                  </div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>

          <div class="footer">Kitoya App - Your data stays yours.</div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Error", "Sharing is not available on this device");
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Your Kitoya Portfolio PDF",
      UTI: "com.adobe.pdf",
    });
  } catch (error: any) {
    Alert.alert("Error", error.message || "Failed to generate PDF");
    throw error;
  }
};
