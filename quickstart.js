// Copyright 2018, Google, LLC.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START main_body]
const {google} = require('googleapis');
const express = require('express');
const opn = require('open');
const path = require('path');
const fs = require('fs');

const keyfile = path.join(__dirname, 'credentials.json');
const keys = JSON.parse(fs.readFileSync(keyfile));
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

// Create an oAuth2 client to authorize the API call
const client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
);

// Generate the url that will be used for authorization
this.authorizeUrl = client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

// Open an http server to accept the oauth callback. In this
// simple example, the only request to our webserver is to
// /oauth2callback?code=<code>
const app = express();
app.get('/oauth2callback', (req, res) => {
  const code = req.query.code;
  client.getToken(code, (err, tokens) => {
    if (err) {
      console.error('Error getting oAuth tokens:');
      throw err;
    }
    client.credentials = tokens;
    res.send('Authentication successful! Please return to the console.');
    server.close();
    listMajors(client);
    console.log("Ini credentialsnya" + client.credentials.access_token)
  });
});

const server = app.listen(3000, () => {
  // client.credentials = {
  //   access_token: 'ya29.GltCB9JnjppLqCAjfnPB83h5c2NDaFRl2aKhWUWGg59Fsi1hVEsE3iqNkP45GIhk_RUN7eRT64YUSVTZIz-QmhtyA2lgjFJZhrgp1Mjcosv1viSgA0-w24IYcIqa',
  //   refresh_token: '1/fVtt2rAsGIPqE_Gy-zPos5lxgbyDSZLpERe5bHHI8TJgwfm0pWaTLRpfvC3b0bDB',
  //   scope: 'https://www.googleapis.com/auth/spreadsheets',
  //   token_type: 'Bearer',
  //   expiry_date: 1562824301809
  // },
  // listMajors(client);
  // open the browser to the authorize url to start the workflow
  opn(this.authorizeUrl, {wait: false});
});

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors(auth) {
  const sheets = google.sheets('v4');
  console.log(auth);

  // sheets.spreadsheets.values.update(
  //   {
  //     auth: auth,
  //     spreadsheetId: '1F0VtWvKCRVESwgCBxvGLZU17LZQFdbXrGBr0Xz7Y1Sc',
  //     valueInputOption: 'USER_ENTERED',
  //     range: 'Sheet1!F2:F3',
  //     resource: {
  //       "range":"Sheet1!F2:F3",
  //       "majorDimension": "ROWS",
  //       "values": [
  //         ["UFC"],
  //         ["KFC"]
  //      ],
  //     },
  //   },

  sheets.spreadsheets.values.get(
    {
      auth: auth,
      spreadsheetId: '1F0VtWvKCRVESwgCBxvGLZU17LZQFdbXrGBr0Xz7Y1Sc',
      range: 'Sheet1!A1:C3',
    },
    (err, res) => {
      if (err) {
        console.error('The API returned an error.');
        throw err;
      }
      console.log(res.data);
      const rows = res.data.values;
      if (rows.length === 0) {
        console.log('No data found.');
      } else {
        console.log('Name, Major:');
        for (const row of rows) {
          // Print columns A and E, which correspond to indices 0 and 4.
          console.log(`${row[0]}, ${row[1]}`);
        }
      }
    }
  );
}
// [END main_body]
