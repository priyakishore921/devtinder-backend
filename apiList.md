# DevTinder Apis

- POST /signup
- POST /login
- POST /logout

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId

- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

- GET /connections
- GET /requests/received
- GET /requests/sent
- GET /feed - Gets you the profile of other users on platform

status: ignore, interested, accepted, rejected