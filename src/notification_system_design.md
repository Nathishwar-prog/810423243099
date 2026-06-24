Notification Object
{
  "id": "123",
  "type": "Placement",
  "message": "TCS Hiring",
  "timestamp": "2026-06-24T10:00:00Z"
}

APIs
Create Notification
POST /notifications
Get Notifications
GET /notifications

Get Single Notification
GET /notifications/:id

Get Notification based on the category
GET /notifications/:category/?n=10?limit=10

Post based on the notifcation received 
POST /noti

Mark Read
PATCH /notifications/:id/read

Delete
DELETE /notifications/:id