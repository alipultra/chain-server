# tuner

**tuner** is a generic middle-man server between front-end implementation of **tun**-based applications and its blockchain implementation that resides in a **tun** server.

It basically pre-processes all the blocks into a more traditional database format, by the help of **[js-data](www.js-data.io)** so that:

- the client app does not have to parse all the blockchain, which in turn makes it much lighter (especially for mobile devices) and,
- it is possible for the client app to have access database-like functionalities, such as complicated queries.
