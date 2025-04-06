import {React, useContext} from "react";
import {PageContext} from '../helpers/Contexts'
import TaskCard from '../components/TaskCard'
import NavBar from "../components/NavBar";
import AddPopUp from "../components/AddPopUp";
import AddTaskCard from "../components/AddTaskCard";

function Habits(){
    const {pageState, setPageState} = useContext(PageContext);
    return(
        <div className="h-screen w-screen flex flex-col">
            <NavBar />
            <AddPopUp />
            <div className="text-5xl px-8 pt-8">Habit Hub</div>
            <div className="text-3xl px-8">Practice healthy habits to train your students!</div>
            <div className="p-8 w-full">
                <div className="overflow-x-auto">
                    <div className="flex gap-8 pb-8">
                        <TaskCard />
                        <TaskCard />
                        <TaskCard />
                        <TaskCard />
                        <TaskCard />
                        <TaskCard />
                        <TaskCard />
                        <TaskCard />
                        <AddTaskCard />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Habits