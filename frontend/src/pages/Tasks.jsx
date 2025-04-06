import {React, useContext} from "react";
import {PageContext} from '../helpers/Contexts'

import TaskCard from '../components/TaskCard'
import NavBar from "../components/NavBar";
import AddPopUp from "../components/AddPopUp";


function Tasks(){
    const {pageState, setPageState} = useContext(PageContext);
    return(
        <div className="h-screen w-screen flex flex-col">
            <NavBar />
            <AddPopUp />
            <div className="text-5xl px-8 pt-8">Task HubHELLO</div>
            <div className="text-3xl px-8">Complete your tasks to train your students!</div>
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

export default Tasks