import express from 'express';
import path from 'path';
import multer from "multer";
import fs from "fs/promises";

const app : express.Application = express();
const uploadHandler = multer({ dest : path.resolve(__dirname, "tmp")});
const port : number = Number(process.env.PORT) || 3103;

app.use(express.static(path.resolve(__dirname, "public")));


app.post("/upload", uploadHandler.single("file"), async (req : express.Request, res : express.Response) => {

    if (req.file && req.file.mimetype == "image/jpeg") {

        await fs.copyFile(path.resolve(__dirname, "tmp", String(req.file.filename)), path.resolve(__dirname, "public", "uploads", req.file.originalname))
    
        res.json({ filePath: path.resolve(__dirname, "public", "uploads", req.file.originalname), ok: true });

    } else {

        res.json({ error: "Väärä tiedostomuoto" });
        
    }

})

app.listen(port, () => {

    console.log(`Palvelin käynnistyi osoitteeseen http://localhost:${port}`);  

});