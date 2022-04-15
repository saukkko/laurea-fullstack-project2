import express from "express";
import helmet from "helmet";
import { routes } from "./routes.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", "i.scdn.co"],
      },
    },
  })
);
app.use(express.static("./src/static", { maxAge: 3600 * 1000 }));
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.listen(PORT, () => console.log(`Express server listening port ${PORT}`));

app.all("*", (req, res) => {
  res.sendStatus(404);
});
