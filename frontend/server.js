const express = require("express");
const path = require("path");

const app = express();
const PORT = 4200; // ✅ frontend साठी port

// Angular build serve
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Angular app running on http://localhost:${PORT}`);
});
