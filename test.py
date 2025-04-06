import datatier 

# add 14th user

def test_add():
    # datatier.deleteuser(9)
    assert datatier.add_user("test_user14", "test_pass") == True
    assert datatier.add_task(14, "test_task", 2, 3) == True
    assert datatier.add_habit(14, "test_habit", 2, 3) == True

def test_delete():
    assert datatier.delete_task(14, "test_task") == True
    assert datatier.delete_habit(14, "test_habit") == True

def test_lookup():
    assert datatier.lookup_user("test_user14", "test_pass") == 14
    assert datatier.lookup_user("wrong_user", "wrong_pass") == None

def test_get():
    assert datatier.get_user_tasks(14) == []
    assert datatier.get_user_habits(14) == []

if __name__ == "__main__":
    datatier.getallusers()
    
    # test_add()
    # test_delete()
    # test_lookup()  # Uncommenting this to run the lookup test
    # test_get()  # Adding this to run the get tests
    # print("All tests passed!")  # This will only print if all tests pass