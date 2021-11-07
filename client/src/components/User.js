import { useState, useEffect } from "react";
import axios from "axios";

import Task from "../Task";

const User = (props) => {
    const [sub, setSub] = useState("");
    const [name, setName] = useState("");
    const [foundTeam, setFoundTeam] = useState(false);
    const [teamId, setTeamId] = useState("");
    const [joinTeam, setJoinTeam] = useState("");

    useEffect(() => {
        setFoundTeam(false);
        setSub(props.user.sub);

        console.log(foundTeam)

        const data = {
            name: props.user.nickname,
            email: props.user.email,
            sub: props.user.sub
        };

        axios({
            url: 'http://localhost:9000/data/user',
            method: 'POST',
            data: data
          })
          .then(res => {
            console.log("Data has been sent to the server");
            console.log(res.data);

            makeDivs(res.data);
          })
          .catch(err => console.log(err));
    }, []);

    const goToTeam = (id) => {
        setTeamId(id);
        console.log(id);
        setFoundTeam(true);
    };

    const makeDivs = (data) => {
        const parent = document.getElementById("teams");
        const teams = data.teams;

        for (let i = 0; i < teams.length; i++) {
            const btn = document.createElement("button");
            btn.className = "team";
            btn.innerHTML = `${teams[i].name}`;
            btn.onclick = () => goToTeam(teams[i]._id);
            parent.appendChild(btn);
        }
    };
    
    const submit = (event) => {
        event.preventDefault();

        const data = {
            name: name,
            sub: sub
        };
        console.log(data);
    
        axios({
          url: 'http://localhost:9000/data/team',
          method: 'POST',
          data: data
        })
          .then(() => {
            console.log('Data has been sent to the server');
            setName("");
          })
          .catch(() => {
            console.log('Internal server error');
          });
    };

    const submitJoinTeam = (event) => {
        event.preventDefault();

        const data = {
            joinTeam: joinTeam,
            userId: sub
        };
    
        axios({
          url: 'http://localhost:9000/data/join',
          method: 'POST',
          data: data
        })
          .then(() => {
            console.log('Data for creating team has been sent to the server');
            setJoinTeam("");
          })
          .catch(() => {
            console.log('Internal server error while joining team...');
          });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
                <div style={{ padding: '10px' }}>
                    <h2>User - { props.user.nickname }</h2>
                    <h4>Email - { props.user.email }</h4>
                </div>
                <div id="teams" style={{ padding: '10px' }}></div>
                <div style={{ padding: '10px' }}>
                    <form onSubmit={submit}>
                        <input type="text" placeholder="Team name..." value={name} required name="name" onChange={(e) => setName(e.target.value)}/>
                        <input type="submit" value="Create Team" />
                    </form>
                </div>
                <div style={{ padding: '10px' }}>
                    <form onSubmit={submitJoinTeam}>
                        <input type="text" placeholder="Team ID" value={joinTeam} required name="join" onChange={(e) => setJoinTeam(e.target.value)}/>
                        <input type="submit" value="Join Team" />
                    </form>
                </div>
            </div>
            {foundTeam && <Task teamId={teamId} />}
        </div>
    )
}

export default User;
