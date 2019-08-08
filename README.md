# PhotoX
**PhotoX is used to manage photos for Year Book Club of CNU High School.**  
We will support upload and download photos, and we have a simply user manage system. The download of photos will be recorded so that we can make sure a photo is used for only one time.  

**THE MAIN PART(MANAGE PHOTOS) OF THIS PROJECT IS NOT FINISHED YET.**  

## Build
**Node and NPM should be installed at first.**  
**Mysql and Redis are required to save informations of user and session.**  
```shell script
# Install Dependencies
npm install

# Build TypeScript
npm run build

# Copy Database Config Template
cp db/DBConfig.js.template db/DBConfig.js

# Edit Database Config
vim db/DBConfig.js

# Copy Redis Config Template
cp db/RedisConfig.js.template db/RedisConfig.js

# Edit Redis Config
vim db/RedisConfig.js
```

## Init Database
```shell script
# Chdir to Database Folder
cd db/

# Login to Root User (or any user you want, permission is required)
mysql -u root -p

# Create PhotoX Database (or any database you want)
create database photox;

# Switch to PhotoX Database (or any database you want)
use photox;

# Import Database File
source init.sql;

# Insert System User
# passcode("5f4dcc3b5aa765d61d8327deb882cf99") is md5("password")
# passrd("") is salt, so please reset password once login)
# Please replace "11111111111" by your own phone number
insert into user(phone_number, name, type, passcode, passrd)
values(11111111111, "System", 127, "5f4dcc3b5aa765d61d8327deb882cf99", "");
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
