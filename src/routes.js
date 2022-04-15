import { Router } from "express";
import fetch from "node-fetch";
import { useBearerToken } from "./spotify.js";

// Export routes to main express applicatoin
export const routes = Router();

routes.get("/", (req, res) => res.render("index"));
routes.get("/search", (req, res) =>
  res.render("search", { artists: null, error: null })
);

routes.post("/search", async (req, res) => {
  // Fetch API token
  const token = await useBearerToken();

  // Check some simple malformed input
  const formData = req.body;

  if (!formData.artist) {
    res
      .status(400)
      .send("HTTP Error 400 - Bad Request: Artists field is missing");
    return;
  }

  if (formData.artist.length < 1) {
    res
      .status(400)
      .send("HTTP Error 400 - Bad Request: Minimum search length is 1");
    return;
  }

  // Construct API URL
  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.append("limit", "5");
  url.searchParams.append("market", "FI");
  url.searchParams.append("type", "artist");

  // "q" is the actual search query parameter
  url.searchParams.append("q", formData.artist);

  // Call the API
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
  })
    .then((r) => r.json())
    .then((data) => {
      /** @type {SearchResponse} */
      const results = data;

      // if results have error object, render error message and return early
      if (results.error) {
        res.render("search", {
          cache: false,
          artists: null,
          error: results.error,
        });

        return;
      }

      // Artists object have lots of info, parse only those that we need
      const artists = results.artists.items.map((x) => {
        return {
          name: x.name,
          img: x.images.find((y) => y),
          url: x.external_urls.spotify,
        };
      });

      // re-render the search page with our new data and force caching to be disabled
      res.render("search", { cache: false, artists: artists, error: null });
    });
});

// All of these JSDoc type definitions are only to give hints to IDE.
/**
 * @typedef {Object} SearchResponse
 * @property {Artists?} artists
 * @property {ErrorResponse?} error
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {number} status
 * @property {string} message
 */

/**
 * @typedef {Object} Artists
 * @property {string} href
 * @property {Artist[]} items
 * @property {number} limit
 * @property {string} next
 * @property {number} offset
 * @property {string} previous
 * @property {number} total
 */

/**
 * @typedef {Object} Artist
 * @property {ExternalUrls} external_urls
 * @property {Followers} followers
 * @property {string[]} genres
 * @property {string} href
 * @property {string} id
 * @property {Image[]} images
 * @property {string} name
 * @property {number} popularity
 * @property {"artist"} type
 * @property {string} uri
 */

/**
 * @typedef {Object} ExternalUrls
 * @property {string} spotify
 */

/**
 * @typedef {Object} Followers
 * @property {string} href
 * @property {number} total
 */

/**
 * @typedef {Object} Image
 * @property {string} url
 * @property {number} height
 * @property {number} width
 */
