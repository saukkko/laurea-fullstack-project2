import { Router } from "express";
import fetch from "node-fetch";
import { useBearerToken } from "./spotify.js";

// Export routes to main express applicatoin
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

  // Fetch API token
  const token = await useBearerToken();

  // TODO: Check malformed input
  const formData = req.body;

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
      // Parse the received data

      /** @type {SearchResponse} */
      const results = data;

      const artists = results.artists.items.map((x) => {
        return {
          name: x.name,
          img: x.images.find((y) => y),
          url: x.external_urls.spotify,
        };
      });

      console.log(artists);

      // re-render the search page with our new data and force caching to be disabled
      res.render("search", { cache: false, data: artists });
    });
});

// All of these JSDoc type definitions are only to give hints to IDE.
/**
 * @typedef {Object} SearchResponse
 * @property {Artists} artists
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
