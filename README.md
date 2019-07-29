# PhotoX
This is a website for Year Book Club of CNU School  
**THE MAIN PART OF THIS PROJECT IS NOT FINISHED YET.**  
**MYSQL AND REDIS IS REQUIRED IN ORDER TO SAVE USER AND SESSION**

# Build PhotoX
## Install Environment (only for Ubuntu, install Node & NPM by yourself for other system)
```shell script
# Install Node & NPM
sudo apt install nodejs-legacy
sudo apt install npm

# Update NPM
sudo npm install npm@latest -g
```

## Build
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
