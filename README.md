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
insert into config(name, value, deletable) values("session_secret", '"mark07x"', false);

# Update the Phone Number of System User
# Once You Finish This Step, You Could Login to System User
# By Using Your Phone Number
# And Password "Password"
# Then You Should Reset Your Password
update user set phone_number = "(YOUR PHONE NUMBER)" where id = 0;
```

## Debug
```shell script
# Set Environment to Development
export NODE_ENV="development"

# Set Http Port to 80 (or any number you want)
export PORT=80

# Start Server
npm run debug
```

## Run
```shell script
# Set Environment to Production
export NODE_ENV="production"

# Set Http Port to 80 (or any number you want)
export PORT=80

# Start Server
npm run start
```
