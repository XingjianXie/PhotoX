# PhotoX
**PhotoX is used to manage photos for Year Book Club of CNU High School.**  
We will support upload and download photos, and we have a simply user manage system. The download of photos will be recorded so that we can make sure a photo is used for only one time.  

## Build
**Node and NPM should be installed at first.**  
**Mysql and Redis are required to save informations of user and session.**  
```shell script
# Install Dependencies
npm install

# Build TypeScript
npm run build

# Copy Database Config Template
cp src/db/DBConfig.js.template src/db/DBConfig.js

# Edit Database Config
vim src/db/DBConfig.js

# Copy Redis Config Template
cp src/db/RedisConfig.js.template src/db/RedisConfig.js

# Edit Redis Config
vim src/db/RedisConfig.js
```

## Init Database
```shell script
# Chdir to Database Folder
cd src/db/

# Login to Root User (or any user you want, permission is required)
mysql -u root -p

# Create PhotoX Database (or any database you want)
create database photox;

# Switch to PhotoX Database (or any database you want)
use photox;

# Import Database File
source init.sql;

# Set Your Secret of Session
# Please, Change This to Your Own String
insert into config(name, value, deletable) values("session_secret", '"mark07x"', true);

# Set Env
insert into config(name, value, deletable) values("env", '"production"', true);

# Set PORT
insert into config(name, value, deletable) values("port", '3000', true);


# Update the Phone Number of System User
# Once You Finish This Step, You Could Login to System User
# By Using Your Phone Number
# And Password "Password"
# Then You Should Reset Your Password
update user set phone_number = "(YOUR PHONE NUMBER)" where id = 0;

# Remember to change configs bg1 ~ bg3 to the ID of your uploaded photos to change the cover in the login page
```

## Debug
```shell script
# Start Server
npm run startDev
```

## Run
```shell script
# Start Server
npm run start
```
