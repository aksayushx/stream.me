# stream.me
This is my submission repo for the Microsoft Engage Mentorship Program 2021.
The demo video can be found [here](https://youtu.be/ckGRAKVA1fQ)
<br/>
**Live Web App: https://streamdotme.herokuapp.com/**

This application has been developed following the Scrum methodology of Agile software development using React for the frontend and nodejs for the backend. 
It has been developed in 3 sprints, each lasting a little over a week.

### Sprint 1
* Design the UI and the most suitable platforms or frameworks for the development.
* Decide the entire workflow of the app, components and overall structure.

### Sprint 2
* Develop the server for signalling using WebRTC.
* Develop the frontend components and combine them to get the video chatting functionality.

### Sprint 3
* Add the chat feature, and make it accessible independent of the meeting.
* Make minor UI improvments and thoroughly test all the features with different numbers of users in a room.

## List of Features
* Turn Microphone On/Off.
* Turn Camera On/Off.
* Conduct multiple meetings at the same time with each meeting having upto 5 people.
* in meeting chat.
* Access meeting chat before or after the meeting.
* Invite button to diectly copy joining info to the clipboard.
* Secure and fast, does not involve any intermediate server, direct peer to peer connections.

## Dependencies
* [socket.io](https://www.npmjs.com/package/socket.io)
* [express](https://www.npmjs.com/package/express)
* [cors](https://www.npmjs.com/package/cors)
* [xss](https://www.npmjs.com/package/xss)
* [react-bootstrap](https://www.npmjs.com/package/react-bootstrap)
* [material-ui](https://www.npmjs.com/package/@material-ui/core)

Following the agile methodology, the application has been structured such that switching to an Communication SDK 
in future can be done easily without introducing a lot ofmajor changes in the codebase.

The application has been tested thoroughly with upto 5 people and performed with the same smoothness irrespective of the number of users.
