from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timedelta
import sys
import os

uri = os.getenv('MONGODB_URI')
if not uri:
    raise ValueError("MONGODB_URI environment variable is not set")

client = MongoClient(uri)
db = client['beatapp']

Users = db['Users']
Tasks = db['Tasks']
Habits = db['Habits']

# Get the next userId (auto-incrementing)
def get_next_user_id():
    counter = db.counters.find_one_and_update(
        {"_id": "userId"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter['seq']

# ✅ Add User
def add_user(username, password):
    try:
        user_id = get_next_user_id()
        user_doc = {"UserId": user_id, "username": username, "password": password}
        Users.insert_one(user_doc)
        return True
    except:
        return False

# ✅ Add Task
def add_task(user_id, task_name, goal_time, deadline_days):
    try:
        deadline = datetime.now() + timedelta(days=deadline_days)
        task_doc = {
            "UserId": user_id,
            "task_name": task_name,
            "goal_time": goal_time,
            "deadline": deadline
        }
        Tasks.insert_one(task_doc)
        return True
    except:
        return False

# ✅ Add Habit
def add_habit(user_id, habit_name, goal_time, days_per_week):
    try:
        habit_doc = {
            "UserId": user_id,
            "habit_name": habit_name,
            "goal_time": goal_time,
            "days_per_week": days_per_week
        }
        Habits.insert_one(habit_doc)
        return True
    except:
        return False

# ✅ Delete Task
def delete_task(user_id, task_name):
    result = Tasks.delete_one({"UserId": user_id, "task_name": task_name})
    return result.deleted_count > 0

# ✅ Delete Habit
def delete_habit(user_id, habit_name):
    result = Habits.delete_one({"UserId": user_id, "habit_name": habit_name})
    return result.deleted_count > 0

# 🔍 Lookup user by username + password
def lookup_user(username=None, password=None, token=None):
    if token:
        user = Users.find_one({"token": token})
        if user:
            return user['UserId']
    user = Users.find_one({"username": username, "password": password})
    if user:
        return user['UserId']
    return None

# 📋 Get tasks for a user
def get_user_tasks(user_id):
    return list(Tasks.find({"UserId": user_id}, {"_id": 0}))

def get_user_habits(user_id):
    return list(Habits.find({"UserId": user_id}, {"_id": 0}))


def getallusers():
    all_users = Users.find()
    for user in all_users:
        print(user)

def deleteuser(user_id):
    Users.delete_one({"UserId": user_id})

def edit_task(user_id, task_name, new_task_name=None, new_goal_time=None, new_deadline_days=None):
    try:
        updates = {}
        if new_task_name is not None:
            updates["task_name"] = new_task_name
        if new_goal_time is not None:
            updates["goal_time"] = new_goal_time
        if new_deadline_days is not None:
            updates["deadline"] = datetime.now() + timedelta(days=new_deadline_days)

        if not updates:
            return False  # nothing to update

        result = Tasks.update_one(
            {"UserId": user_id, "task_name": task_name},
            {"$set": updates}
        )
        return result.modified_count > 0
    except:
        return False

def edit_habit(user_id, habit_name, new_habit_name=None, new_goal_time=None, new_days_per_week=None):
    try:
        updates = {}
        if new_habit_name is not None:
            updates["habit_name"] = new_habit_name
        if new_goal_time is not None:
            updates["goal_time"] = new_goal_time
        if new_days_per_week is not None:
            updates["days_per_week"] = new_days_per_week

        if not updates:
            return False  # nothing to update

        result = Habits.update_one(
            {"UserId": user_id, "habit_name": habit_name},
            {"$set": updates}
        )
        return result.modified_count > 0
    except:
        return False


def set_user_token(user_id, token):
    try:
        result = Users.update_one(
            {"UserId": user_id},
            {"$set": {"token": token}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error setting token for user {user_id}: {e}")
        return False
