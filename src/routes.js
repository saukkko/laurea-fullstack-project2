import { Router } from "express";
import fetch from "node-fetch";
import { useBearerToken } from "./spotify.js";

export const routes = Router();

routes.get("/", (req, res) => res.render("index"));
routes.get("/search", (req, res) => res.render("search", { data: "" }));
routes.post("/search", async (req, res) => {
  // parse req.body;
  // if not OK -> res.send(400)
  // grab token from file
  // if token needs refresh
  // -> refresh token
  // -> update token file
  // send request to endpoint
  // if response is err
  // -> render err
  // else
  // -> render res
  const token = await useBearerToken();
  const formData = req.body;

  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.append("limit", "5");
  url.searchParams.append("market", "FI");
  url.searchParams.append("type", "artist");
  url.searchParams.append("q", formData.artist);

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
  })
    .then((r) => r.json())
    .then((data) => {
      res.render("search", { cache: false, data: data });
    });
});
