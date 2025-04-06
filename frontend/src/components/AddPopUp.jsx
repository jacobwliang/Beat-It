import {React, useContext, useState} from "react";
import {PageContext} from '../helpers/Contexts'
import "../index.css"

function AddPopUp(){
    const {pageState, setPageState} = useContext(PageContext);
    const [name, setName] = useState('');
    const [hrs, setHrs] = useState('');
    const [mins, setMins] = useState('');
    const [secs, setSecs] = useState('');
    const [days, setDays] = useState('');
    const habitOrTask = pageState === "habits" ? "Habit" : "Task";

    return(
        <div className="body">
            <div className="AddPopUp">
                <h1>Add New {habitOrTask}</h1>
                <div className="add-fields">
                    <h2>{habitOrTask} Name:</h2>
                    <input
                        type="text"
                        id="name"
                        placeholder={`${habitOrTask} Name`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="add-fields">
                    <h2>Goal Time:</h2>
                    <input
                        className="number-input"
                        type="number"
                        min="0"
                        id="hrs"
                        placeholder="hrs"
                        value={hrs}
                        onChange={(e) => setHrs(e.target.value)}
                    />
                    <h1>:</h1>
                    <input
                        className="number-input"
                        type="number"
                        min="0"
                        max="59"
                        id="mins"
                        placeholder="mins"
                        value={mins}
                        onChange={(e) => setMins(e.target.value)}
                    />
                    <h1>:</h1>
                    <input
                        className="number-input"
                        type="number"
                        min="0"
                        max="59"
                        id="secs"
                        placeholder="secs"
                        value={secs}
                        onChange={(e) => setSecs(e.target.value)}
                    />
                </div>
                <div className="add-fields">
                    <h2>Days to Complete In:</h2>
                    <input
                        className="number-input"
                        type="number"
                        min="0"
                        id="days"
                        placeholder="days"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                    />
                </div>
                <div>
                    <button className="pop-button" onClick={() => setPageState({pageState})}>Create {habitOrTask}!</button>
                </div>
            </div>
        </div>
    )
}

export default AddPopUp