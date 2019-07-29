# PhotoX
This is a website for Year Book Club of CNU School

# Build
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

# Debug
```shell script
npm run debug
```

# Run
```shell script
export NODE_ENV="production"
npm run start
```
