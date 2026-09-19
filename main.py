import random

# Snake = -1
# Water = 1
# Gun = 0

def gamewin(computer, you):

    if computer == you:
        print("Draw")
        return

    if computer == -1 and you == 1:
        print("Computer Win")

    elif computer == -1 and you == 0:
        print("You Win")

    elif computer == 1 and you == -1:
        print("You Win")

    elif computer == 1 and you == 0:
        print("You Win")

    elif computer == 0 and you == 1:
        print("Computer Win")

    elif computer == 0 and you == -1:
        print("Computer Win")

    else:
        print("Something is wrong in the code...")

 

flag=1
while flag==1:
    print("Do you Want to play  (y/n): ")
    if(input().lower()=='y'):
        yourplay = int(input("Enter your choice (snake->-1, water->1, gun->0): "))
        computerplay = random.choice([-1, 0, 1])
        print("Computer choice is:", computerplay)
        gamewin(computerplay, yourplay)
    else:
        flag=0
        break