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
