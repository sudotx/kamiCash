import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import routes from "./routes";
dotenv.config();

const PORT = process.env.PORT || 6969;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

app.listen(PORT, () => {
    console.log(`Getting Schiwfty on port ${PORT}`);
    routes(app);
});

export default app;