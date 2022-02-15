# Nodejs Test API To Upload/Download/Delete Files
A Node.js application with some API endpoints that upload/download/delete files into/from the local directory/Google cloud bucket

## Data flow
![alt text](https://github.com/OsmanSujoy/REST_API_FILES/blob/master/Data%20Flow.png)

## Project Structure 
```
. 
├───database
├───files
├───src
│   ├───controller
│   ├───middleware
│   ├───model
│   ├───routes
│   ├───service
│   └───utils
├───__tests__
└── README.md
```

## Step By Step - Instructions 

### .env (included for convenient)
Please modify the .env file if necessary
```javascript
# Server port
PORT=8888

# Local directory for storing files 
FOLDER=./files/

# Upload limit for a single file (MB)
UPLOAD_LIMIT=2

# Daily max upload & download limit (MB)
DAILY_UPLOAD_LIMIT=10
DAILY_DOWNLOAD_LIMIT=10

# Storage provider - local & google
PROVIDER=local
#PROVIDER=google

# If the provider is Google
# Must provide Google Service account key details in a JSON file and bucket name
CONFIG=google-cloud-key.json
BUCKET=mgi_api_logs

# Unit type for inactivity & cleanup process
UNIT_TYPE=hour
# Inactivity time duration
# Unit in UNIT_TYPE
INACTIVITY=1
# Clean up data of inactive IP 
# Unit in UNIT_TYPE - Interval for running the process
CLEAN_UP=1

# Local database information - currently using text files as database
# With minimal code modification, the actual database(SQL/NoSQL) can be connected
# MongoDB will be added in the next version
# For any real database, you need to modify the models & mock functions in tests of the project
# Initial data for the both text files: {"data":[]}
LOCAL_DATABASE=./database/database.txt
LOCAL_IPSTORAGE=./database/iplimit.txt

# Test file for API testing
TEST_FILE_LOCALTION=./__tests__/google.png
```
### Installation
Install the dependencies. 
```bash
npm install
```
### Start
Run to start
```bash
npm start
```

## [Testing Method] Postman 
Postman collection is also given, please import it.

`API #01:` To `UPLOAD` a file, use the below endpoint. In Postman, select "form-data" in the body section & upload files with the key name "file". In return, you will get a public & private key.

```bash
Request type -> POST
Endpoint -> http://localhost:8888/files
```
`API #02:` To `DOWNLOAD` a file, use the below endpoint. In Postman, replace {{public_key}} with a valid public key.

```bash
Request type -> GET
Endpoint -> http://localhost:8888/files/{{public_key}}
```
`API #03:` To `DELETE` a file, use the below endpoint. In Postman, replace {{private_key}} with a valid public key.

```bash
Request type -> DELETE
Endpoint -> http://localhost:8888/files/{{private_key}}
```
## Test
Run to some very basic tests
```bash
npm run test
```

### Note
Please ignore the warning of `ansi-regex`. It could be a bug. 
## Thank you!
