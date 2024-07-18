import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import routes from "./routes";
dotenv.config();

const PORT = process.env.PORT || 7790;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

app.listen(PORT, () => {
    console.log(`Listening on: ${PORT}`);
    routes(app);
});

export default app;