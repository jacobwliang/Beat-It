import React, { useState, useEffect, useMemo } from 'react';
import { loadMidiFile, pausePlayback, resumePlayback } from '../helpers/midi_parser';

function HabitCard({ habit }) {
    // Use habit prop or fallback to default values
    const habitId = habit?.id || "123";
    const habitName = habit?.habit_name || "Example Habit";
    const daysOfWeek = habit?.days_of_week || [];
    const goalTime = habit?.goal_time || 60; // in minutes
    const daysPerWeek = habit?.days_per_week || 3;
    const [isPaused, setIsPaused] = useState(false);
    
    // Create a unique storage key that includes both habit ID and name
    const storageKey = useMemo(() => {
        return `habit_timer_${habitId}_${habitName.replace(/\s+/g, '_')}`;
    }, [habitId, habitName]);
    
    // Set initial time (converting minutes to seconds if goal_time exists)
    const initialTime = useMemo(() => {
        if (habit?.goal_time) {
            return habit.goal_time * 60;
        }
        return 60;
    }, [habit?.goal_time]);
    
    // Initialize state with localStorage values or defaults
    const [time, setTime] = useState(() => {
        try {
            const storedItem = localStorage.getItem(storageKey);
            if (storedItem) {
                const storedState = JSON.parse(storedItem);
                if (storedState.time !== undefined) {
                    return storedState.time;
                }
            }
        } catch (error) {
            console.error("Error parsing stored timer state:", error);
            localStorage.removeItem(storageKey);
        }
        return initialTime;
    });

    const [isRunning, setIsRunning] = useState(() => {
        try {
            const storedItem = localStorage.getItem(storageKey);
            if (storedItem) {
                const storedState = JSON.parse(storedItem);
                return storedState.isRunning || false;
            }
        } catch (error) {
            console.error("Error parsing stored timer state:", error);
        }
        return false;
    });

    const [lastUpdated, setLastUpdated] = useState(() => {
        try {
            const storedItem = localStorage.getItem(storageKey);
            if (storedItem) {
                const storedState = JSON.parse(storedItem);
                return storedState.lastUpdated || Date.now();
            }
        } catch (error) {
            console.error("Error parsing stored timer state:", error);
        }
        return Date.now();
    });

    // Calculate consistency score and level
    const consistencyScore = useMemo(() => {
        // Get current day of week (0-6, where 0 is Sunday)
        const currentDay = new Date().getDay();
        const isTodayScheduled = daysOfWeek.includes(currentDay);
        
        // Calculate days percentage
        const daysCompleted = daysOfWeek.length;
        const daysPercentage = (daysCompleted / daysPerWeek) * 100;
        
        // Calculate hours percentage
        const timeSpent = (initialTime - time) / 60; // Convert to minutes
        const hoursPercentage = (timeSpent / goalTime) * 100;
        
        // Calculate consistency score (60% days, 40% hours)
        return (0.6 * daysPercentage) + (0.4 * hoursPercentage);
    }, [time, initialTime, goalTime, daysOfWeek, daysPerWeek]);

    const level = useMemo(() => {
        if (consistencyScore <= 33.33) return "Novice";
        if (consistencyScore <= 66.66) return "Practitioner";
        if (consistencyScore <= 100) return "Artist";
        return "Master";
    }, [consistencyScore]);
    
    // Generate a consistent player number based on the task name
        const playerNum = useMemo(() => {
            const sum = habitName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return (sum % 6) + 1;
        }, [habitName]);
    
    // Format time as MM:SS or HH:MM:SS
    const formatTime = () => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        
        return `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // Save state to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                time,
                isRunning,
                lastUpdated: Date.now()
            }));
        } catch (error) {
            console.error("Error saving timer state:", error);
        }
    }, [time, isRunning, storageKey]);
    
    // Check for time passage while away
    useEffect(() => {
        if (isRunning && lastUpdated) {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - lastUpdated) / 1000);
            
            if (elapsedSeconds > 0 && time > 0) {
                const newTime = Math.max(0, time - elapsedSeconds);
                setTime(newTime);
                
                if (newTime === 0) {
                    setIsRunning(false);
                }
            }
        }
        
        setLastUpdated(Date.now());
    }, []);
    
    // Timer effect - countdown
    useEffect(() => {
        let interval;
        
        if (isRunning && time > 0) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    const newTime = prevTime - 1;
                    if (newTime <= 0) {
                        clearInterval(interval);
                        setIsRunning(false);
                        return 0;
                    }
                    return newTime;
                });
                setLastUpdated(Date.now());
            }, 1000);
        }
        
        return () => clearInterval(interval);
    }, [isRunning]);
    
    // Handle Start/Stop button click
    function handleClick() {
        if (!isRunning && !isPaused) {
            if (time === 0) {
                setTime(initialTime);
            }
    
            // Start playback
            loadMidiFile({ level: level.toLowerCase(), taskId: habitId });
    
            setIsRunning(true);
            setIsPaused(false); // Make sure isPaused is false when starting
        } else if (isRunning && !isPaused) {
            // Pause playback
            pausePlayback({ taskId: habitId });
            setIsRunning(false);
            setIsPaused(true); // Set paused to true
        } else if (isPaused) {
            // Resume playback
            resumePlayback({ taskId: habitId });
            setIsRunning(true);
            setIsPaused(false); // Set paused to false
        }
    }
    
    // Reset timer to initial value
    function handleReset() {
        setIsRunning(false);
        setIsPaused(false);
        setTime(initialTime);
    }
    
    // Format days of week for display
    const formatDaysOfWeek = () => {
        if (!daysOfWeek || daysOfWeek.length === 0) return "";
        
        const dayAbbreviations = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
        return dayAbbreviations
            .map((day, index) => daysOfWeek.includes(index) ? day : null)
            .filter(Boolean)
            .join(', ');
    };
    
    return (
        <div className="flex justify-center">
            <div className="border-3 border-gray-600 w-96 h-72 bg-[#F2D7D9] relative rounded-2xl overflow-hidden">
                <img
                    className="w-56 relative top-20 left-6 z-10"
                    src={`/pictures/player${playerNum}.${isRunning ? 'gif' : 'png'}`}
                    alt="piano boy/girl"
                />
                <div className="w-full h-28 absolute bottom-0 bg-[#D14D72] z-0"></div>
                <div className="absolute top-0 flex justify-between w-full py-3 px-6 text-[#8F4F4F] text-4xl">
                    <div>
                        <p className="truncate max-w-48">{habitName}</p>
                        <p className="text-[24px] mt-1 text-white">{level}</p>
                        <p className="text-sm mt-1">{formatDaysOfWeek()}</p>
                    </div>
                    <p className={`${isRunning && time <= 60 ? 'animate-pulse' : ''}`}>{formatTime()}</p>
                </div>

                {/* Buttons */}
                <div className="flex absolute bottom-2 right-6 gap-2">
                    <button 
                        onClick={handleReset}
                        className="bg-white py-1 px-3 text-3xl rounded-2xl border-2 text-[#8F4F4F] hover:text-[#D99C9C]"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={handleClick}
                        className="bg-white py-1 px-3 text-3xl rounded-2xl border-2 text-[#8F4F4F] hover:text-[#D99C9C]"
                    >
                        {isRunning ? 'Stop!' : 'Start!'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HabitCard;