from flask import Flask, request, jsonify
import uuid
import datatier

app = Flask(__name__)

@app.route('/') 
def hello_world():
    return 'Sup! Beat it is running!'

# User Registration
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Extract username and password
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        print("Username and password are required.")
        return jsonify({
            "message": "Username and password are required.",
            "user_id": -1
        }), 400

    if datatier.add_user(username, password):
        print(f"User {username} registered successfully!")
        return jsonify({
            "message": f"User {username} registered successfully!",
            "user_id": datatier.lookup_user(username, password)
        }), 200
    else:
        print("User registration failed.")
        return jsonify({
            "message": "User registration failed.",
            "user_id": -1
        }), 400

# edittask
@app.route('/tasks', methods=['PUT'])
def edit_task_route():
    user_id = get_authenticated_user_id(request)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    task_name = data.get("task_name")

    if not task_name:
        return jsonify({"message": "task_name is required."}), 400

    new_task_name = data.get("new_task_name") or None
    new_goal_time = data.get("new_goal_time") or None
    new_deadline_days = data.get("new_deadline_days") or None

    success = datatier.edit_task(
        user_id=user_id,
        task_name=task_name,
        new_task_name=new_task_name,
        new_goal_time=new_goal_time,
        new_deadline_days=new_deadline_days
    )

    if success:
        return jsonify({"message": f"Task '{task_name}' updated successfully."}), 200
    else:
        return jsonify({"message": f"Failed to update task '{task_name}'."}), 400

@app.route('/habits', methods=['PUT'])
def edit_habit_route():
    user_id = get_authenticated_user_id(request)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    habit_name = data.get("habit_name")

    if not habit_name:
        return jsonify({"message": "habit_name is required."}), 400

    new_habit_name = data.get("new_habit_name") or None
    new_goal_time = data.get("new_goal_time") or None
    new_days_per_week = data.get("new_days_per_week") or None

    success = datatier.edit_habit(
        user_id=user_id,
        habit_name=habit_name,
        new_habit_name=new_habit_name,
        new_goal_time=new_goal_time,
        new_days_per_week=new_days_per_week
    )

    if success:
        return jsonify({"message": f"Habit '{habit_name}' updated successfully."}), 200
    else:
        return jsonify({"message": f"Failed to update habit '{habit_name}'."}), 400



# Add a new task
@app.route('/tasks', methods=['POST'])
def add_task_route():
    user_id = get_authenticated_user_id(request)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.json
    task_name = data.get('task_name')
    goal_time = data.get('goal_time')
    deadline_days = data.get('deadline_days', 7)

    if not task_name or not goal_time:
        return jsonify({"message": "Missing required fields"}), 400

    success = datatier.add_task(user_id, task_name, goal_time, deadline_days)

    if success:
        return jsonify({"message": "Task added successfully"}), 201
    else:
        return jsonify({"message": "Failed to add task"}), 500


# Add a new habit
@app.route('/habits', methods=['POST'])
def add_habit_route():
    user_id = get_authenticated_user_id(request)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.json
    habit_name = data.get('habit_name')
    goal_time = data.get('goal_time')
    days_per_week = data.get('days_per_week', 3)

    if not habit_name or not goal_time:
        return jsonify({"message": "Missing required fields"}), 400

    success = datatier.add_habit(user_id, habit_name, goal_time, days_per_week)

    if success:
        return jsonify({"message": "Habit added successfully"}), 201
    else:
        return jsonify({"message": "Failed to add habit"}), 500


# delete task
@app.route('/delete_task', methods=['DELETE'])
def delete_task_route():
    user_id = get_authenticated_user_id(request)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    task_name = data.get("task_name")

    if not task_name:
        return jsonify({"message": "task_name is required."}), 400

    success = datatier.delete_task(user_id, task_name)

    if success:
        return jsonify({"message": f"Task '{task_name}' deleted successfully."}), 200
    else:
        return jsonify({"message": f"Failed to delete task '{task_name}'."}), 400

# delete habit
@app.route('/delete_habit', methods=['DELETE'])
def delete_habit_route():
    user_id = get_authenticated_user_id(request)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    habit_name = data.get("habit_name")

    if not habit_name:
        return jsonify({"message": "habit_name is required."}), 400

    success = datatier.delete_habit(user_id, habit_name)

    if success:
        return jsonify({"message": f"Habit '{habit_name}' deleted successfully."}), 200
    else:
        return jsonify({"message": f"Failed to delete habit '{habit_name}'."}), 400


@app.route('/tasks', methods=['GET'])
def get_tasks_route():
    user_id = get_authenticated_user_id(request)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    tasks = datatier.get_user_tasks(user_id)

    if tasks:
        return jsonify({"tasks": tasks}), 200
    else:
        return jsonify({"message": "No tasks found"}), 404


@app.route('/habits', methods=['GET'])
def get_habits_route():
    user_id = get_authenticated_user_id(request)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    habits = datatier.get_user_habits(user_id)

    if habits:
        return jsonify({"habits": habits}), 200
    else:
        return jsonify({"message": "No habits found"}), 404


@app.route('/login', methods=['POST'])
def login_route():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    user = datatier.lookup_user(username, password)

    if user:
        # Generate and assign a new token
        token = str(uuid.uuid4())
        datatier.set_user_token(user, token)  # Assuming you have a function to set the token

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user_id": user,
            "token": token
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Invalid credentials."
        }), 401

def get_authenticated_user_id(request):
    token = request.headers.get("Authorization")  # like: Authorization: Bearer <token>
    if not token:
        return None

    token = token.replace("Bearer ", "").strip()
    user = datatier.lookup_user(token=token)
    return user

if __name__ == '__main__':
    app.run()



