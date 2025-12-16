# `POST /users/register`

## Description

Register a new user. The endpoint validates input, hashes the password, creates the user in the database, and returns a JWT auth token and the created user (password excluded).

- Method: `POST`
- URL: `/users/register`
- Headers: `Content-Type: application/json`

## Request Body

JSON object with the following fields:

- `fullname` (object)
  - `firstname` (string, required) — minimum length 3
  - `lastname` (string, optional) — minimum length 3 if provided
- `email` (string, required) — must be a valid email
- `password` (string, required) — minimum length 6

Example:

```json
{
  "fullname": {
    "firstname": "Jane",
    "lastname": "Doe"
  },
  "email": "jane@example.com",
  "password": "secret123"
}
```

## Validation Rules (express-validator)

- `body("email").isEmail()` — returns 400 if invalid email
- `body("fullname.firstname").isLength({ min: 3 })` — returns 400 if firstname shorter than 3
- `body("password").isLength({ min: 6 })` — returns 400 if password shorter than 6

If validation fails, the response is `400 Bad Request` with a JSON body containing the errors array.

## Responses

- `201 Created`

  - Body: `{ "token": "<jwt>", "user": { ... } }`
  - Note: The user object does not include the password (password is saved hashed and returned with `select: false`).

  ## Example Successful Response

  Example body returned on `201 Created` (password omitted):

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJf...",
    "user": {
      "_id": "64b8f1a2e6c8b1f0a1d2c3e4",
      "fullname": {
        "firstname": "Jane",
        "lastname": "Doe"
      },
      "email": "jane@example.com",
      "sockedId": null
    }
  }
  ```

- `400 Bad Request`
  - Body example (validation errors):

```json
{
  "errors": [
    {
      "value": "bad-email",
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

- `500 Internal Server Error`
  - Body: `{ "error": "<message>" }` (on unexpected server/database errors)

## Behavior & Implementation Notes

- Passwords are hashed using `bcrypt` before being stored: `userModel.hashPassword(password)`.
- The created user model calls `user.generateAuthToken()` to produce the JWT. The token uses `process.env.JWT_SECRET`.
- The `email` field is unique in the database — attempting to register an existing email will raise a database error (usually a 500 unless explicitly handled).

## Example cURL

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":{"firstname":"Jane","lastname":"Doe"},"email":"jane@example.com","password":"secret123"}'
```

## File Location

This documentation is in `backend/readme.md`.

---

# `POST /users/login`

## Description

Authenticate an existing user and return a JWT auth token and the user object (password excluded).

- Method: `POST`
- URL: `/users/login`
- Headers: `Content-Type: application/json`

## Request Body

JSON object with the following fields:

- `email` (string, required) — must be a valid email
- `password` (string, required) — minimum length 6

Example:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

## Validation Rules (express-validator)

- `body("email").isEmail()` — returns 400 if invalid email
- `body("password").isLength({ min: 6 })` — returns 400 if password shorter than 6

If validation fails, the response is `400 Bad Request` with a JSON body containing the errors array.

## Responses

- `200 OK`

  - Body: `{ "token": "<jwt>", "user": { ... } }`
  - Note: The user object does not include the password (password is stored hashed and is not returned).

  ## Example Successful Response

  Example body returned on `200 OK` (password omitted):

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJf...",
    "user": {
      "_id": "64b8f1a2e6c8b1f0a1d2c3e4",
      "fullname": {
        "firstname": "Jane",
        "lastname": "Doe"
      },
      "email": "jane@example.com",
      "sockedId": null
    }
  }
  ```

- `400 Bad Request`
  - Body example (validation errors):

```json
{
  "errors": [
    {
      "value": "bad-email",
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

- `401 Unauthorized`
  - Body example (invalid credentials):

```json
{
  "error": "Invalid email or password"
}
```

- `500 Internal Server Error`
  - Body: `{ "error": "<message>" }` (on unexpected server/database errors)

## Behavior & Implementation Notes

- Passwords are compared using `bcrypt`: `user.comparePassword(password)`.
- On successful authentication the code calls `user.generateAuthToken()` to produce a JWT. The token uses `process.env.JWT_SECRET`.
- If the email is not found or the password doesn't match, return `401 Unauthorized` rather than `200`.

---

# `GET /users/profile`

## Description

Retrieve the authenticated user's profile information.

- Method: `GET`
- URL: `/users/profile`
- Headers: `Authorization: Bearer <token>`

## Request

No request body is required. The endpoint relies on the `Authorization` header to authenticate the user.

## Responses

- `200 OK`

  - Body: `{ "user": { ... } }`
  - Example:

  ```json
  {
    "user": {
      "_id": "64b8f1a2e6c8b1f0a1d2c3e4",
      "fullname": {
        "firstname": "Jane",
        "lastname": "Doe"
      },
      "email": "jane@example.com",
      "sockedId": null
    }
  }
  ```

- `401 Unauthorized`

  - Body: `{ "error": "Unauthorized" }` (if the token is missing or invalid)

- `500 Internal Server Error`
  - Body: `{ "error": "<message>" }` (on unexpected server/database errors)

---

# `GET /users/logout`

## Description

Log out the authenticated user by clearing the token and blacklisting it.

- Method: `GET`
- URL: `/users/logout`
- Headers: `Authorization: Bearer <token>`

## Request

No request body is required. The endpoint relies on the `Authorization` header to authenticate the user.

## Responses

- `200 OK`

  - Body: `{ "message": "Logged out successfully" }`

- `401 Unauthorized`

  - Body: `{ "error": "Unauthorized" }` (if the token is missing or invalid)

- `500 Internal Server Error`
  - Body: `{ "error": "<message>" }` (on unexpected server/database errors)

## Behavior & Implementation Notes

- The token is cleared from the user's cookies and added to a blacklist to prevent reuse.
- The `Authorization` header or cookie must contain a valid token for the logout to succeed.

---

# `POST /captains/register`

## Description

Register a new captain. The endpoint validates input, hashes the password, creates the captain in the database, and returns the created captain object.

- **Method**: `POST`
- **URL**: `/captains/register`
- **Headers**: `Content-Type: application/json`

## Request Body

JSON object with the following fields:

- `fullname` (object)
  - `firstname` (string, required) — minimum length 3
  - `lastname` (string, optional) — minimum length 3 if provided
- `email` (string, required) — must be a valid email
- `password` (string, required) — minimum length 6
- `vehicle` (object)
  - `color` (string, required) — minimum length 3
  - `plate` (string, required) — minimum length 3
  - `capacity` (integer, required) — minimum value 1
  - `vehicleType` (string, required) — must be one of `car`, `motorcycle`, or `auto`

### Example:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john@example.com",
  "password": "secure123",
  "vehicle": {
    "color": "Red",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

## Validation Rules (express-validator)

- `body("fullname.firstname").isString().isLength({ min: 3 })` — returns 400 if `firstname` is not a string or shorter than 3 characters.
- `body("email").isEmail()` — returns 400 if `email` is not valid.
- `body("password").isLength({ min: 6 })` — returns 400 if `password` is shorter than 6 characters.
- `body("vehicle.color").isString().isLength({ min: 3 })` — returns 400 if `color` is not a string or shorter than 3 characters.
- `body("vehicle.plate").isString().isLength({ min: 3 })` — returns 400 if `plate` is not a string or shorter than 3 characters.
- `body("vehicle.capacity").isInt({ min: 1 })` — returns 400 if `capacity` is less than 1.
- `body("vehicle.vehicleType").isIn(["car", "motorcycle", "auto"])` — returns 400 if `vehicleType` is not one of the allowed values.

If validation fails, the response is `400 Bad Request` with a JSON body containing the errors array.

## Responses

### `201 Created`

- **Body**: `{ "captain": { ... } }`
- **Note**: The captain object does not include the password (password is saved hashed).

### Example Successful Response

```json
{
  "captain": {
    "_id": "64b8f1a2e6c8b1f0a1d2c3e4",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

### `400 Bad Request`

- **Body Example** (validation errors):

```json
{
  "errors": [
    {
      "value": "",
      "msg": "Firstname must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

### `500 Internal Server Error`

- **Body**: `{ "error": "<message>" }` (on unexpected server/database errors)

## Behavior & Implementation Notes

- Passwords are hashed using `bcrypt` before being stored.
- The `email` field is unique in the database — attempting to register an existing email will raise a database error (usually a 500 unless explicitly handled).
- The `vehicle.vehicleType` must be one of the allowed values (`car`, `motorcycle`, `auto`).

## Example cURL

```bash
curl -X POST http://localhost:3000/captains/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":{"firstname":"John","lastname":"Doe"},"email":"john@example.com","password":"secure123","vehicle":{"color":"Red","plate":"ABC123","capacity":4,"vehicleType":"car"}}'
```
