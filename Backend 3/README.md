# BookNest-Web-App
An online book community platform for CS546 final project
# BookNest – Backend3 (Admin + Rankings)

## Run
npm install
npm start    # http://localhost:3000

## Seed (optional)
npm run seed

## Admin
POST /admin/login  { "username":"admin", "password":"123456" }
POST /admin/books  (Header: Authorization: Bearer fake-admin-token)
PUT  /admin/books/:id (同上)

## Rankings
GET /rankings
