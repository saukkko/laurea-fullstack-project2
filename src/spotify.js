import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

// We don't really use .env file at Heroku, so it's safe to remove these before publishing
import dotenv from "dotenv";
dotenv.config();

// If client id or client secret is missing, then exit immediately
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) process.exit(1);

/**
 * Checks if token needs to be updated or created and returns it. Otherwise it returns token that's stored in token.json file.
 * @returns {Promise<Token>}
 */
export const useBearerToken = async () => {
  // try to get token data from file
  let token = await readBearerToken();

  // if token does not exist or token has expired, then get new token
  if (
    !token ||
    token.updated + token.expires_in * 1000 <= new Date().getTime()
  ) {
    await getNewBearerToken();
    token = await readBearerToken();
  }

  return token;
};

/**
 * Reads token file and returns it's contents or undefined.
 * @returns {Promise<Token|undefined>}
 */
const readBearerToken = async () => {
  const data = await readFile("./token.json").catch((err) => {
    if (err.code === "ENOENT") return;
  });

  return data ? JSON.parse(data.toString()) : undefined;
};

/**
 * Authenticates against Spotify API by using client id and client secret, and then writes the token data to a file.
 */
const getNewBearerToken = async () => {
  // Construct URL
  const apiURL = new URL("https://accounts.spotify.com/");
  apiURL.pathname = "/api/token";

  // API requires that body is urlencoded. Using URLSearchParams class does that easily, while taking any special characters into account.
  const payload = new URLSearchParams({
    grant_type: "client_credentials",
  }).toString();

  // Call the API and store response object to variable "res"
  const res = fetch(apiURL, {
    method: "POST",
    headers: {
      // Authorization: Basic <base64 encoded client_id:client_secret>
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
        ).toString("base64"),
      // API requires content-type to be application/x-www-form-urlencoded when authenticating
      "Content-Type": "application/x-www-form-urlencoded",
    },
    // set request body to previously urlencoded data.
    body: payload,
  });

  // Handle the response from the API.
  await res
    .catch(console.error)
    .then((res) => res.json())
    .then(async (data) => {
      // Store updated time to file so we know when to update token
      data.updated = new Date().getTime();
      // Write token data to file
      await writeFile("./token.json", JSON.stringify(data));
    });
};

/**
 * Type definition for the token object. This is purely just to make vscode give better IntelliSense hints.
 * @typedef {Object} Token
 * @property {string} access_token
 * @property {string} token_type
 * @property {number} expires_in
 * @property {number} updated
 */
