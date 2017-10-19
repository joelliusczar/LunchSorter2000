# LunchSorter2000 #

### Problem that we want to solve ####
Let's introduce Derick. 
Derick is in charge of organizing lunch and dinner at a week long conference and he wants to encouraged mingling so for the meals he has assigned seating, and restaurant. Monday, this is not a not a problem because he can just randomly junk people into groups. After he's grouped  people for dinner, he runs into a slight problem: one of the conference goers, AJ, comes and complains that he has been assigned pizza two meals in a row. AJ's a little bit of a pissant though, so he's the only one with a problem. 
Tueday more people complain to Derick about how he is grouping them together. Katie has been assigned the soup place for the third time in a row. Ron, Horratio, and Quintin have eaten together every meal this week and are ready to branch out.
And as the conference continues it gets harder and more difficult to assign people in such a way that they are not eating at the same place multiple times in a row or with the same people mutliple times in a row.

### \*enter lunchSorter2000\*  ###
LunchSorter2000 sorts the people using a kind of greedy algorithm. As it loops through the people, and then it loops through the candidate restaurants. For each person, it asks if the current person has recently eaten at candidate restarant. Then it asks, of the people that are currently sorted into the restaurant, whom has this person eaten with recently. Taken these factors into account, LunchSorter2000 places our person into the most optimal restaurant with optimality based on restaurant least recently dinned at and least number of people recently grouped with.

## setup ##

This code is dependent upon being run in https://script.google.com So, if you'd like to run it, you will need to copy it yourself. Alternatively, you can use this link to view my readonly version and copy it from there.
https://script.google.com/d/1h5OX7-4bpMpaRv1LjKGY8wj2kr_XGFpdKS1KwxgvXg4TOD8009ig30N1/edit?usp=sharing (requires you be signed into google)


### Exploring ###
The place to start in the code is probably Public.gs. This is where all of the public interfaces are. These methods are called from frontScript.html with ajax calls using Google's provided handlers. Each method in the public interface wraps its code inside of a decorator. The decorator itself is defined in Utilities.gs. 
