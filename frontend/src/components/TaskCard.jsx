import React, { useState, useEffect } from 'react';

function TaskCard({ taskId = "123" }) {
    // Initial time: 25 minutes in seconds (1500 seconds)
    const initialTime = 60;
    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    
    // Fetch initial timer value from backend on component mount
    useEffect(() => {
        const fetchTimerData = async () => {
            try {
                const response = await fetch(`http://your-backend-url/api/tasks/${taskId}`);
                if (response.ok) {
                    const data = await response.json();
                    // Assuming backend returns time in seconds
                    if (data.timeInSeconds) {
                        setTime(data.timeInSeconds);
                    }
                }
            } catch (error) {
                console.error("Error fetching timer data:", error);
            }
        };

        // Uncomment when backend is ready
        // fetchTimerData();
    }, [taskId]);
    
    // Format time as HH:MM:SS
    const formatTime = () => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // Timer effect - countdown
    useEffect(() => {
        let interval;
        
        if (isRunning && time > 0) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(interval);
                        setIsRunning(false);
                        // You could add a sound or notification here when timer completes
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (time === 0) {
            setIsRunning(false);
        }
        
        return () => clearInterval(interval);
    }, [isRunning, time]);
    
    // Handle Start/Stop button click
    function handleClick() {
        if (!isRunning) {
            // If time is 0, reset to initial time before starting
            if (time === 0) {
                setTime(initialTime);
            }
            setIsRunning(true);
        } else {
            setIsRunning(false);
        }
    }
    
    // Reset timer to initial value
    function handleReset() {
        setIsRunning(false);
        setTime(initialTime);
        
        // Optionally update backend when reset
        updateTimerInBackend(initialTime);
    }
    
    // Update timer in backend
    async function updateTimerInBackend(timeInSeconds) {
        try {

            const token = localStorage.getItem("authToken");

            const response = await fetch(`http://your-backend-url/api/tasks/${taskId}`, {
                
                method: 'PUT',
                headers: {
                    "Authorization": 'Bearer ${token}',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ timeInSeconds }),
            });
            
            if (!response.ok) {
                console.error("Failed to update timer in backend");
            }
        } catch (error) {
            console.error("Error updating timer:", error);
        }
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="border-3 border-gray-600 w-80 h-72 bg-[#C6CDFDDE] relative rounded-2xl overflow-hidden">
                <img
                    className="w-56 relative top-20 left-6 z-10"
                    src="/pictures/girl.png"
                    alt="piano boy/girl"
                />
                <div className="w-full h-28 absolute bottom-0 bg-[#b96244] z-0"></div>
                <div className="absolute top-0 flex justify-between w-full py-3 px-6 text-[#894625] text-4xl">
                    <p>Example Task</p>
                    <p className={`${isRunning && time <= 60 ? 'animate-pulse' : ''}`}>{formatTime()}</p>
                </div>

                {/* Buttons */}
                <div className="flex absolute bottom-2 right-6 gap-2">
                    <button 
                        onClick={handleReset}
                        className="bg-white py-1 px-3 text-3xl rounded-2xl border-2 text-[#894625] hover:text-[#dbbcaa]"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={handleClick}
                        className="bg-white py-1 px-3 text-3xl rounded-2xl border-2 text-[#894625] hover:text-[#dbbcaa]"
                    >
                        {isRunning ? 'Stop!' : 'Start!'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskCard;