import React from 'react';
import { Button } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';


function Home() {

	const [roomUrl, setRoomUrl] = React.useState('');

	const joinRoom = () => {
		if (roomUrl === '') {
			alert("Enter Valid Room URl");
		}
		else {
			var url = roomUrl.split("/");
			window.location.href = `/${url[url.length - 1]}`;
		}
	}

	const createRoom = () => {
		var url = uuidv4();
		window.location.href = `/${url}`;
	}

	return (
		<div className="App">
			<div className="row">
				<div>
					<Button onClick={() => { createRoom() }}>
						Create a Meeting
					</Button>
				</div>
				<form onSubmit={(e) => {
					e.preventDefault();
					joinRoom();
				}}>
					<div className="row">
						<input value={roomUrl}
							onChange={(e) =>
								setRoomUrl(e.target.value)
							} type="text" className="field container input-field" placeholder="Enter Meeting Link Here!">
						</input>
					</div>
					<Button variant="light" className="submit-button" type="submit" value="Submit">Join Room</Button>
				</form>
			</div>
		</div>
	);
}

export default Home;
