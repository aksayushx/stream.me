# stream.me
This is my submission repo for the Microsoft Engage Mentorship Program 2021.

This application has been developed following the agile methodology using react for the frontend part and nodejs for the backend. 
It has been developed in 3 sprints, each lasting a week.

### Sprint 1
* Design the UI and the most suitable platforms or frameworks for the development.
* Decide the entire workflow of the app, components and overall structure.

### Sprint 2
* Develop the server for signalling using WebRTC.
* Develop the frontend components and combine them to get the video chatting functionality.

### Sprint 3
* Add the chat feature, and make it accessible independent of the meeting.
* Make minor UI improvments and thoroughly test all the features with different numbers of users in a room.


It has a very simple to use interface and allows upto 5 people to join the same room and chat with each other seamlessly. 
There can be multiple rooms and different team wise going on at the same time with each room having upto 5 people. 
It is incredibly fast and secure as it does not involve any intermediate server or SDK and uses direct peer to peer connections 
between the browsers.

The current features allow users to turn their microphone and camera on/off. Chat with each other in the meeting. The chat remains forever and can be used 
even after the meeting gets over, using the Room Url which was used to connect to the meeting.

A user can also put a message as a notice before the start of the meeting so that anyone joining the meet in future can see that.

Keeping in mind the agile methodology, the application has been developed such that switching to an Communication SDK 
in future can be done easily without introducing a lot ofmajor changes in the codebase.

The application has been tested thoroughly with upto 5 people and performed with the same smoothness irrespective of the number of users.

Following is a short demo of its functionality and its currently deployed at the url provided so that you can test it out yourselves.
