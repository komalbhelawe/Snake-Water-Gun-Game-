import random

# Snake = -1
# Water = 1
# Gun = 0

def gamewin(computer, you):
    if computer == you:
        return "Draw"

    # Winning conditions for 'you':
    # Snake (-1) beats Water (1)
    # Water (1) beats Gun (0)
    # Gun (0) beats Snake (-1)
    if (you == -1 and computer == 1) or \
       (you == 1 and computer == 0) or \
       (you == 0 and computer == -1):
        return "You Win"
    else:
        return "Computer Win"

 

if __name__ == '__main__':
    flag = 1
    while flag == 1:
        print("Do you Want to play  (y/n): ")
        if input().lower() == 'y':
            yourplay = int(input("Enter your choice (snake->-1, water->1, gun->0): "))
            computerplay = random.choice([-1, 0, 1])
            print("Computer choice is:", computerplay)
            result = gamewin(computerplay, yourplay)
            print("Outcome:", result)
        else:
            flag = 0
            break